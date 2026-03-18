const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user profile
// @route   GET /api/patients/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId || req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/patients/:userId
// @access  Private
router.put('/:userId', protect, async (req, res) => {
    try {
        // Log update attempt (omit full image data to keep logs clean)
        const { profileImage, ...otherUpdates } = req.body;
        console.log(`[ProfileUpdate] User: ${req.user.email}, Fields: ${Object.keys(otherUpdates).join(', ')}${profileImage ? ', profileImage' : ''}`);
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (updatedUser) {
            console.log('✅ Profile updated successfully for user:', updatedUser.email);
            res.json({ user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Update Error:', error);
        if (error.code === 'ERR_OUT_OF_RANGE' || error.message.includes('large') || error.message.includes('BSON') || error.message.includes('16777216')) {
            return res.status(400).json({ message: 'The image is too large. Please select a smaller photo or lower resolution image.' });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
