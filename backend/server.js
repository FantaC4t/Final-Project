// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Add this near the top after connectDB()
mongoose.connection.once('open', async () => {
  console.log('MongoDB connection opened');
  
  // List all collections in the database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  
  // Check products collection directly
  try {
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log('Direct products count:', count);
    
    if (count > 0) {
      const sample = await mongoose.connection.db.collection('products').findOne({});
      console.log('Sample product (direct):', JSON.stringify(sample, null, 2));
    }
  } catch (err) {
    console.error('Error checking products collection:', err);
  }
});

const app = express();

// Enable CORS for all routes with proper configuration
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's address
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/ml', require('./routes/mlRoutes'));

// Add this route near your other routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
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

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});