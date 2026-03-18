const Routine = require('../models/Routine');
const Notification = require('../models/Notification');

// @desc    Get user's daily routine
// @route   GET /api/routine
// @access  Private
const getRoutine = async (req, res) => {
    try {
        let routine = await Routine.findOne({ user: req.user._id });
        
        // If no routine exists, create a default one based on patient profile (optional)
        if (!routine) {
            // Default routine setup
            const defaultMorning = [
                { task: 'Cleanse', description: 'Gentle facial cleanser' },
                { task: 'Toner', description: 'Alcohol-free toner' },
                { task: 'Vitamin C', description: 'Brightening serum' },
                { task: 'Moisturizer', description: 'Lightweight moisturizer' },
                { task: 'Sunscreen', description: 'SPF 50+ protection' },
            ];
            
            const defaultEvening = [
                { task: 'Double Cleanse', description: 'Oil cleanser followed by water cleanser' },
                { task: 'Treatment', description: 'Serum or targeted treatment' },
                { task: 'Eye Cream', description: 'Nourishing under-eye cream' },
                { task: 'Night Cream', description: 'Rich hydrating cream' },
            ];
            
            routine = await Routine.create({
                user: req.user._id,
                morningRoutine: defaultMorning,
                eveningRoutine: defaultEvening,
            });
        }
        
        // Check if completion needs to be reset (e.g., if last updated date is not today)
        const today = new Date().setHours(0, 0, 0, 0);
        const lastUpdate = new Date(routine.updatedAt).setHours(0, 0, 0, 0);
        
        // For simple apps, we could reset here, but better to let frontend handle fresh states if needed
        // Or track daily logs. Here we'll just return the routine.
        
        res.json(routine);
    } catch (error) {
        console.error('Get Routine Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle a task completion status
// @route   PUT /api/routine/toggle/:type/:taskId
// @access  Private
const toggleTaskCompletion = async (req, res) => {
    const { type, taskId } = req.params; // type: 'morning' or 'evening'
    
    try {
        const routine = await Routine.findOne({ user: req.user._id });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });
        
        const routineArray = type === 'morning' ? routine.morningRoutine : routine.eveningRoutine;
        const task = routineArray.id(taskId);
        
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        task.isCompleted = !task.isCompleted;
        task.lastCompletedAt = task.isCompleted ? new Date() : null;
        
        await routine.save();

        // Check if all tasks for this type are completed
        const allCompleted = routineArray.every(t => t.isCompleted);
        if (allCompleted && task.isCompleted) {
            await Notification.create({
                user: req.user._id,
                type: 'reminder',
                title: `${type.charAt(0).toUpperCase() + type.slice(1)} Routine Complete!`,
                message: `Great job! You've completed all tasks in your ${type} skincare routine.`,
            });
        }

        res.json(routine);
    } catch (error) {
        console.error('Toggle Task Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset all tasks (e.g., for a new day)
// @route   POST /api/routine/reset
// @access  Private
const resetRoutine = async (req, res) => {
    try {
        const routine = await Routine.findOne({ user: req.user._id });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });
        
        routine.morningRoutine.forEach(task => task.isCompleted = false);
        routine.eveningRoutine.forEach(task => task.isCompleted = false);
        
        await routine.save();
        res.json(routine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a task to a routine
// @route   POST /api/routine/task/:type
// @access  Private
const addTask = async (req, res) => {
    const { type } = req.params; // 'morning' or 'evening'
    const { task, description, days, reminderTime, isReminderEnabled } = req.body;
    
    try {
        let routine = await Routine.findOne({ user: req.user._id });
        
        // If no routine exists, create one
        if (!routine) {
            routine = await Routine.create({
                user: req.user._id,
                morningRoutine: [],
                eveningRoutine: [],
            });
        }
        
        const routineArray = type === 'morning' ? routine.morningRoutine : routine.eveningRoutine;
        routineArray.push({ task, description, days, reminderTime, isReminderEnabled });
        
        await routine.save();

        // Create notification
        await Notification.create({
            user: req.user._id,
            type: 'reminder',
            title: 'New Task Added',
            message: `"${task}" has been added to your ${type} routine. Don't forget to follow it!`,
        });

        res.status(201).json(routine);
    } catch (error) {
        console.error('Add Task Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a specific task
// @route   PUT /api/routine/task/:type/:taskId
// @access  Private
const updateTask = async (req, res) => {
    const { type, taskId } = req.params;
    const { task, description, days, reminderTime, isReminderEnabled } = req.body;
    
    try {
        const routine = await Routine.findOne({ user: req.user._id });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });
        
        const routineArray = type === 'morning' ? routine.morningRoutine : routine.eveningRoutine;
        const taskToUpdate = routineArray.id(taskId);
        
        if (!taskToUpdate) return res.status(404).json({ message: 'Task not found' });
        
        if (task) taskToUpdate.task = task;
        if (description) taskToUpdate.description = description;
        if (days) taskToUpdate.days = days;
        if (reminderTime !== undefined) taskToUpdate.reminderTime = reminderTime;
        if (isReminderEnabled !== undefined) taskToUpdate.isReminderEnabled = isReminderEnabled;
        
        await routine.save();
        res.json(routine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a specific task
// @route   DELETE /api/routine/task/:type/:taskId
// @access  Private
const deleteTask = async (req, res) => {
    const { type, taskId } = req.params;
    
    try {
        const routine = await Routine.findOne({ user: req.user._id });
        if (!routine) return res.status(404).json({ message: 'Routine not found' });
        
        const routineArray = type === 'morning' ? routine.morningRoutine : routine.eveningRoutine;
        routineArray.pull({ _id: taskId });
        
        await routine.save();
        res.json(routine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoutine,
    toggleTaskCompletion,
    resetRoutine,
    addTask,
    updateTask,
    deleteTask,
};
