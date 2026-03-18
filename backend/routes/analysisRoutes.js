const express = require('express');
const router = express.Router();
const AIAnalysis = require('../models/AIAnalysis');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @desc    Save new AI analysis result
// @route   POST /api/analyses
// @access  Private (Patient only)
router.post('/', protect, async (req, res) => {
    try {
        const { results, imageUrl } = req.body;
        
        if (req.user.userType !== 'patient') {
            return res.status(403).json({ message: 'Only patients can save analysis results' });
        }

        const analysis = await AIAnalysis.create({
            patient: req.user.id,
            results,
            imageUrl
        });

        // Create notification
        await Notification.create({
            user: req.user.id,
            type: 'product',
            title: 'Analysis Complete',
            message: `Your skin analysis is ready! You have ${results.skinType} skin with ${results.topConcern}.`,
            relatedId: analysis._id
        });

        res.status(201).json({ analysis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all AI analyses for a patient
// @route   GET /api/analyses
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let analyses;
        if (req.user.userType === 'doctor') {
            // Need patientId from query
            const { patientId } = req.query;
            if (!patientId) {
                return res.status(400).json({ message: 'patientId is required' });
            }
            analyses = await AIAnalysis.find({ patient: patientId }).sort({ createdAt: -1 });
        } else {
            analyses = await AIAnalysis.find({ patient: req.user.id }).sort({ createdAt: -1 });
        }
        res.json({ analyses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
