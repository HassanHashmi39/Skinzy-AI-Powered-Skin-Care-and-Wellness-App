const express = require('express');
const router = express.Router();
console.log('📈 Loading Doctor Routes...');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        console.log('🔍 Fetching all doctors...');
        const doctors = await User.find({ userType: 'doctor' })
            .select('-password');
        console.log(`✅ Found ${doctors.length} doctors`);
        res.json({ doctors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
router.put('/availability', protect, async (req, res) => {
    try {
        if (req.user.userType !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can update availability' });
        }

        let { availability, timeSlots, unavailableDates } = req.body;
        
        // Sanitize availability if it's an array of strings
        if (availability && Array.isArray(availability)) {
            availability = availability.map(item => {
                if (typeof item === 'string') {
                    return { day: item, isActive: true };
                }
                return item;
            });
        }

        const doctor = await User.findById(req.user.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        if (availability) doctor.availability = availability;
        if (timeSlots) doctor.timeSlots = timeSlots;
        if (unavailableDates) doctor.unavailableDates = unavailableDates;

        await doctor.save();
        res.json({ 
            message: 'Availability updated successfully', 
            availability: doctor.availability, 
            timeSlots: doctor.timeSlots,
            unavailableDates: doctor.unavailableDates
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get doctor's available slots for the next 14 days
// @route   GET /api/doctors/:id/slots
// @access  Private
router.get('/:id/slots', protect, async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor || doctor.userType !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const defaultSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
        const workingSlots = (doctor.timeSlots && doctor.timeSlots.length > 0) ? doctor.timeSlots : defaultSlots;

        const dayNameToIdx = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };

        // Determine availability map
        let availabilityMap = {};
        if (doctor.availability && doctor.availability.length > 0) {
            // Start with all days false, then enable only what is active in config
            availabilityMap = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
            doctor.availability.forEach(a => {
                if (a && a.day) {
                    // Make lookup case-insensitive
                    const normalizedDay = a.day.charAt(0).toUpperCase() + a.day.slice(1).toLowerCase();
                    const idx = dayNameToIdx[normalizedDay];
                    if (idx !== undefined) {
                        availabilityMap[idx] = a.isActive !== undefined ? a.isActive : true;
                    }
                }
            });
        } else {
            // Default fallback if no settings at all: Mon-Sat active, Sunday off
            console.log(`[SLOTS] No availability set for ${doctor.name}, using Mon-Sat fallback`);
            availabilityMap = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 0: false };
        }

        const now = new Date();
        const slots = [];
        
        console.log(`[SLOTS] Generating for ${doctor.name}. Availability Map:`, availabilityMap);
        
        for (let i = 0; i < 14; i++) {
            const date = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
            
            // Generate YYYY-MM-DD string in LOCAL time
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayNum = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayNum}`;
            
            const dayIdx = date.getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[dayIdx];

            if (doctor.unavailableDates && doctor.unavailableDates.includes(dateStr)) {
                console.log(`[SLOTS] Day ${dateStr} (${dayName}) is in unavailableDates`);
                continue;
            }

            if (!availabilityMap[dayIdx]) {
                console.log(`[SLOTS] Day ${dateStr} (${dayName}) is OFF in doctor availability`);
                continue;
            }

            if (availabilityMap[dayIdx]) {
                const bookedAppointments = await Appointment.find({
                    doctor: doctor._id,
                    appointmentDate: dateStr,
                    status: { $ne: 'cancelled' }
                });

                const bookedTimes = bookedAppointments.map(a => a.appointmentTime);

                workingSlots.forEach(time => {
                    const [timeStr, period] = time.split(' ');
                    const [hourStr, minStr] = timeStr.split(':');
                    let hour = parseInt(hourStr);
                    if (period === 'PM' && hour !== 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0;

                    const slotDateTime = new Date(date.getTime());
                    slotDateTime.setHours(hour, parseInt(minStr), 0, 0);

                    if (slotDateTime > new Date(now.getTime() + (30 * 60 * 1000)) && !bookedTimes.includes(time)) {
                        slots.push({
                            date: dateStr,
                            time: time,
                            dateTime: slotDateTime
                        });
                    }
                });
            }
        }

        console.log(`[SLOTS] Result: ${slots.length} found for ${doctor.name}`);
        res.json({ slots });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, userType: 'doctor' })
            .select('-password');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json({ doctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
