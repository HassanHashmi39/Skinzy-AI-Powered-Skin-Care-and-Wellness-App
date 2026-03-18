const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Give feedback for an appointment
// @route   POST /api/feedbacks
// @access  Private (Patient only)
router.post('/', protect, async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;

        if (req.user.userType !== 'patient') {
            return res.status(403).json({ message: 'Only patients can give feedback' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if the patient is the one who had the appointment
        if (appointment.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to give feedback for this appointment' });
        }

        // Check if appointment is completed
        if (appointment.status !== 'completed') {
            return res.status(400).json({ message: 'Feedback can only be given for completed appointments' });
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ appointment: appointmentId });
        if (existingFeedback) {
            return res.status(400).json({ message: 'Feedback already submitted for this appointment' });
        }

        const feedback = await Feedback.create({
            appointment: appointmentId,
            patient: req.user.id,
            doctor: appointment.doctor,
            rating,
            comment
        });

        // Update Doctor's average rating and number of reviews
        const doctor = await User.findById(appointment.doctor);
        if (doctor) {
            const currentTotalRating = doctor.rating * doctor.reviews;
            doctor.reviews += 1;
            doctor.rating = (currentTotalRating + rating) / doctor.reviews;
            await doctor.save();
        }

        // Create notification for Doctor
        await Notification.create({
            user: appointment.doctor,
            type: 'feedback',
            title: 'New Patient Feedback',
            message: `You received a ${rating}-star rating from ${req.user.name}`,
            relatedId: feedback._id
        });

        res.status(201).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all feedbacks for a specific doctor
// @route   GET /api/feedbacks/doctor/:doctorId
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ doctor: req.params.doctorId })
            .populate('patient', 'name profileImage')
            .sort({ createdAt: -1 });
        
        res.json({ feedbacks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get doctor's own feedback (Dashboard)
// @route   GET /api/feedbacks/my-feedback
// @access  Private (Doctor only)
router.get('/my-feedback', protect, async (req, res) => {
    try {
        if (req.user.userType !== 'doctor') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const feedbacks = await Feedback.find({ doctor: req.user.id })
            .populate('patient', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ feedbacks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
