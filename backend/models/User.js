const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
        },
        userType: {
            type: String,
            enum: ['patient', 'doctor'],
            required: true,
        },
        // Common fields
        phone: { type: String },
        city: { type: String },
        location: { type: String },
        
        // Doctor-specific fields
        specialization: { type: String },
        licenseNumber: { type: String },
        experience: { type: String },
        hospital: { type: String },
        consultationFee: { type: String },
        availability: [
            {
                day: { type: String }, // e.g., 'Monday'
                startTime: { type: String }, // e.g., '09:00 AM'
                endTime: { type: String }, // e.g., '05:00 PM'
                isActive: { type: Boolean, default: true }
            }
        ],
        timeSlots: [{ type: String }], // Optional: specifically predefined slots like ['09:00', '10:00']
        unavailableDates: [{ type: String }], // e.g., ['2024-03-25', '2024-03-26']
        totalPatientsServed: { type: Number, default: 0 },
        rating: { type: Number, default: 5.0 },
        reviews: { type: Number, default: 0 },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        
        // Patient-specific fields
        age: { type: Number },
        dateOfBirth: { type: String }, // Store as YYYY-MM-DD
        gender: { type: String },
        skinType: { type: String },
        skinTone: { type: String },
        mainConcerns: [{ type: String }],
        allergies: { type: String },
        chronicConditions: { type: String },
        currentMedications: { type: String },
        shareDataWithDoctors: { type: Boolean, default: true },
        joinDate: { type: String },
        totalAnalyses: { type: Number, default: 0 },
        profileImage: { type: String },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
