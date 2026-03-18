const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification routes are protected

router.get('/', (req, res, next) => {
    console.log(`[Route] GET /api/notifications called by ${req.user?.name || 'Unknown'}`);
    next();
}, getNotifications);

router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAll);

module.exports = router;
