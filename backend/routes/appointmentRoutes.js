const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AIAnalysis = require('../models/AIAnalysis');
const MedicalHistory = require('../models/MedicalHistory');
const Routine = require('../models/Routine');
const { protect } = require('../middleware/authMiddleware');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
router.post('/', protect, async (req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
        
        if (req.user.userType !== 'patient') {
            return res.status(403).json({ message: 'Only patients can book appointments' });
        }

        // Parse dateTime for sorting and better management
        let dateTime;
        try {
            // Check if it's already a valid date string or needs construction
            dateTime = new Date(`${appointmentDate} ${appointmentTime}`);
            if (isNaN(dateTime.getTime())) {
                // If it fails, maybe it's just the date
                dateTime = new Date(appointmentDate);
            }
        } catch (e) {
            dateTime = new Date(); // Fallback
        }

        // Check if date is in the past
        const now = new Date();
        if (dateTime < now) {
            return res.status(400).json({ message: 'Cannot book appointments in the past' });
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctorId,
            appointmentDate,
            appointmentTime,
            dateTime: dateTime || new Date(),
            reason
        });

        console.log(`[Appointment] New booking created. ID: ${appointment._id}`);

        // Create notification for Doctor
        const notif = await Notification.create({
            user: doctorId,
            type: 'appointment',
            title: 'New Appointment Request',
            message: `You have a new appointment request from ${req.user.name} for ${appointmentDate} at ${appointmentTime}`,
            relatedId: appointment._id
        });
        console.log(`[Notification] Created for doctor: ${doctorId}, notifId: ${notif._id}`);

        res.status(201).json({ appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let appointments;
        if (req.user.userType === 'doctor') {
            appointments = await Appointment.find({ doctor: req.user.id })
                .populate('patient', 'name email phone age gender skinType profileImage')
                .sort({ dateTime: 1 });
        } else {
            appointments = await Appointment.find({ patient: req.user.id })
                .populate('doctor', 'name specialization hospital profileImage city phone')
                .sort({ dateTime: 1 });
        }
        res.json({ appointments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update appointment status (e.g., Accept/Confirm)
// @route   PATCH /api/appointments/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Security: only doctor or patient can update status relevant to them. 
        // Doctor usually confirms, patient or doctor can cancel.
        appointment.status = status;
        await appointment.save();

        // Create notification for the other party
        // If doctor confirms/cancels, notify patient. If patient cancels, notify doctor.
        const notifyUser = req.user.userType === 'doctor' ? appointment.patient : appointment.doctor;
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        let type = 'appointment';
        let title = `Appointment ${statusText}`;
        let message = `Your appointment on ${appointment.appointmentDate} has been ${status}`;

        if (status === 'cancelled') {
            type = 'cancellation';
        } else if (status === 'completed' && req.user.userType === 'doctor') {
            type = 'feedback';
            title = 'Appointment Completed';
            message = 'Your appointment is completed. Please click here to give feedback to your doctor.';
        }
        
        await Notification.create({
            user: notifyUser,
            type: type,
            title: title,
            message: message,
            relatedId: appointment._id
        });

        res.json({ appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a message/chat in appointment context
// @route   POST /api/appointments/:id/messages
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.messages.push({
            sender: req.user.id,
            content
        });
        await appointment.save();

        // Create notification for receiver
        const receiverId = req.user.id === appointment.patient.toString() ? appointment.doctor : appointment.patient;
        await Notification.create({
            user: receiverId,
            type: 'message',
            title: 'New Message',
            message: `New message from ${req.user.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            relatedId: appointment._id
        });

        res.json({ messages: appointment.messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update prescription
// @route   PATCH /api/appointments/:id/prescription
// @access  Private (Doctor only)
router.patch('/:id/prescription', protect, async (req, res) => {
    try {
        const { prescription } = req.body;
        if (req.user.userType !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can issue prescriptions' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        appointment.prescription = prescription;
        await appointment.save();

        // Create notification for Patient
        await Notification.create({
            user: appointment.patient,
            type: 'message',
            title: 'Prescription Updated',
            message: 'Your doctor has updated your prescription. Please check your appointment details.',
            relatedId: appointment._id
        });

        res.json({ appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get patient details for a doctor (if confirmed)
// @route   GET /api/appointments/:id/patient-details
// @access  Private (Doctor only)
router.get('/:id/patient-details', protect, async (req, res) => {
    try {
        if (req.user.userType !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can access patient details' });
        }

        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name email phone age gender skinType profileImage joinDate city');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Ensure the doctor is authorized for this patient 
        if (appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access to this patient details' });
        }

        const patientId = appointment.patient._id;
        const medicalHistory = await MedicalHistory.findOne({ user: patientId });
        const aiAnalyses = await AIAnalysis.find({ patient: patientId }).sort({ createdAt: -1 });
        const routine = await Routine.findOne({ user: patientId });

        res.json({
            patient: appointment.patient,
            medicalHistory,
            aiAnalyses,
            routine,
            appointmentStatus: appointment.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
