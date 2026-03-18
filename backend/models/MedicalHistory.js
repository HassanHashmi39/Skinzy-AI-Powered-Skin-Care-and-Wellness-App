const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hasFamilyHistory: { type: Boolean, default: false },
        familyHistoryDetails: { type: String },
        hasAllergies: { type: Boolean, default: false },
        allergyDetails: { type: String },
        skinType: { type: String },
        concerns: [{ type: String }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
