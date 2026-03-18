const express = require('express');
const router = express.Router();
const { getRoutine, toggleTaskCompletion, resetRoutine, addTask, updateTask, deleteTask } = require('../controllers/routineController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routine routes
router.use(protect);

router.get('/', getRoutine);
router.post('/task/:type', addTask);
router.put('/task/:type/:taskId', updateTask);
router.delete('/task/:type/:taskId', deleteTask);
router.put('/toggle/:type/:taskId', toggleTaskCompletion);
router.post('/reset', resetRoutine);

module.exports = router;
