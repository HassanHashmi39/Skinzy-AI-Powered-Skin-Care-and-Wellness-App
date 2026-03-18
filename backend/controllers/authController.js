const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (patient or doctor)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const userData = { ...req.body };
        if (!userData.joinDate) {
            userData.joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        const user = await User.create(userData);

        // Create welcome notification
        await Notification.create({
            user: user._id,
            type: 'reminder',
            title: 'Welcome to Skinzy!',
            message: `Hello ${user.name}, welcome to Skinzy! We're glad to have you here. Let's start your skin health journey!`,
        });

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        if (!req.user) return res.status(404).json({ message: 'User not found' });
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, login, getMe };
