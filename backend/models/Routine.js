const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        morningRoutine: [
            {
                task: { type: String, required: true },
                description: { type: String },
                isCompleted: { type: Boolean, default: false },
                lastCompletedAt: { type: Date },
                days: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                reminderTime: { type: String }, // "HH:mm"
                isReminderEnabled: { type: Boolean, default: false },
            }
        ],
        eveningRoutine: [
            {
                task: { type: String, required: true },
                description: { type: String },
                isCompleted: { type: Boolean, default: false },
                lastCompletedAt: { type: Date },
                days: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                reminderTime: { type: String }, // "HH:mm"
                isReminderEnabled: { type: Boolean, default: false },
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Routine', routineSchema);
