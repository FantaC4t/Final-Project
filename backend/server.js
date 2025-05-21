// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const path = require('path');
const pricePredService = require('./services/pricePredService'); // Import the service

// Load env vars
dotenv.config();

// Debug log to verify JWT_SECRET is loaded
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is missing. Authentication will not work!');
  process.env.JWT_SECRET = 'temporarysecret'; // Only for development
}

// Connect to database
connectDB();

// Debug database connection
mongoose.connection.once('open', async () => {
  console.log('MongoDB connection opened');
  console.log('MongoDB Connected:', mongoose.connection.host);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  
  try {
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log('Direct products count:', count);
    
    const sample = await mongoose.connection.db.collection('products').findOne({});
    console.log('Sample product (direct):', sample);
  } catch (err) {
    console.error('Error accessing products collection:', err);
  }
});

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://192.168.0.105:3000'], // Added your local network IP for mobile testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/ml', require('./routes/mlRoutes'));
app.use('/api/recommendations', require('./routes/recommendations')); // Adjust path if needed

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    pricePredictionInitialized: pricePredService.initialized, // Add service status
    timestamp: new Date(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      jwtConfigured: !!process.env.JWT_SECRET
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message // Send only message in prod
  });
});

const PORT = process.env.PORT || 5000;

// Wrap app.listen in an async function to await service initialization
async function startServer() {
  try {
    await pricePredService.initialize(); // Initialize the service
    console.log('Price Prediction Service initialized successfully.'); // Confirmation log

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to initialize Price Prediction Service or start server:', error);
    process.exit(1); // Exit if critical initialization fails
  }
}

startServer(); // Call the async function

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // server.close(() => process.exit(1)); // Consider graceful shutdown
});