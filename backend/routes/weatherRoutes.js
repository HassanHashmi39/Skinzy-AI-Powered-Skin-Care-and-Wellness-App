const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get weather for a city
// @route   GET /api/weather/:city
// @access  Private
router.get('/:city', protect, getWeather);

// @desc    Get weather (default or query param)
// @route   GET /api/weather
// @access  Private
router.get('/', protect, getWeather);

module.exports = router;
