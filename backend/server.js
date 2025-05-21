// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const path = require('path');

// Load env vars
dotenv.config();

// Debug log to verify JWT_SECRET is loaded
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is missing. Authentication will not work!');
  // You could either exit here or continue with a default value
  process.env.JWT_SECRET = 'temporarysecret'; // Only for development
}

// Connect to database
connectDB();

// Debug database connection
mongoose.connection.once('open', async () => {
  console.log('MongoDB connection opened');
  console.log('MongoDB Connected:', mongoose.connection.host);
  
  // List all collections in the database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  
  // Check products collection directly
  try {
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log('Direct products count:', count);
    
    // Get a sample product to verify data structure
    const sample = await mongoose.connection.db.collection('products').findOne({});
    console.log('Sample product (direct):', sample);
  } catch (err) {
    console.error('Error accessing products collection:', err);
  }
});

const app = express();

// Enable CORS for all routes with proper configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/ml', require('./routes/mlRoutes'));

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      jwtConfigured: !!process.env.JWT_SECRET
    }
  });
});

// Static files and catch-all route for production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});