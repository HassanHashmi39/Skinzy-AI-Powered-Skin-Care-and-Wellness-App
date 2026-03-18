const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Routes
// Authentication
app.use('/api/auth', require('./routes/authRoutes'));

// Business Logic
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/medical-history', require('./routes/medicalHistoryRoutes'));
app.use('/api/routine', require('./routes/routineRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/analyses', require('./routes/analysisRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Skinzy Backend is running 🚀',
        version: '1.0.3',
        time: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
