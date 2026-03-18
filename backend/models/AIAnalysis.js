const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    results: {
        type: Object, // Could be {prediction, score, details...}
        required: true
    },
    imageUrl: {
        type: String, // Store image of analysis
        default: ''
    },
    datePerformed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
