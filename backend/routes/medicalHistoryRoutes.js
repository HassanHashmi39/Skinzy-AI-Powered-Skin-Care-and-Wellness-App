const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const MedicalHistory = require('../models/MedicalHistory');

// @desc    Save medical history
// @route   POST /api/medical-history
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { user: req.user.id },
            { ...req.body, user: req.user.id },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(201).json({ success: true, data: medicalHistory });
    } catch (error) {
        console.error('Error saving medical history:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get medical history
// @route   GET /api/medical-history/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const medicalHistory = await MedicalHistory.findOne({ user: req.params.userId || req.user.id });
        if (!medicalHistory) return res.status(404).json({ message: 'Medical history not found' });
        res.json({ success: true, data: medicalHistory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
