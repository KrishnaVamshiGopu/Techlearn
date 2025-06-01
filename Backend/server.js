const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const submissionRoutes = require('./routes/submission');

const app = express();

app.use('/api/submission', submissionRoutes);

// Enable CORS for all routes
app.use(cors({
    origin: [
        // Local development URLs
        'http://127.0.0.1:5500', 
        'http://localhost:5500', 
        'http://127.0.0.1:5501',
        'http://localhost:3000',
        
        // Your deployed backend IPs (HTTP)
        'http://52.41.36.82',
        'http://54.191.253.12', 
        'http://44.226.122.3',
        
        // Your deployed backend IPs (HTTPS)
        'https://52.41.36.82',
        'https://54.191.253.12',
        'https://44.226.122.3',
        
        // Netlify frontend URL (replace with your actual Netlify URL)
        'https://https://683b697b572570a3bb286211--tech-learn-kv.netlify.app/',
        
        // Allow all Netlify subdomains (optional)
        /https:\/\/.*\.netlify\.app$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Enable if you're using cookies/sessions
}));


// Add request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Routes
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const progressRoutes = require('./routes/progress');

app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Something broke!' });
});

// MongoDB Connection with improved options
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_system', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/auth/signup');
    console.log('- POST /api/auth/signin');
});
