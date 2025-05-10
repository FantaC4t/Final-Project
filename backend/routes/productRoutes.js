const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose'); // Added mongoose import

// DEBUG route to directly access MongoDB
router.get('/debug/direct', async (req, res) => {
  try {
    console.log('DEBUG: Attempting direct MongoDB access');
    
    // Check connection state
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB not connected',
        state: mongoose.connection.readyState
      });
    }
    
    // Get collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Try to access products directly
    let productsData;
    try {
      productsData = await mongoose.connection.db.collection('products').find({}).limit(10).toArray();
    } catch (dbErr) {
      console.error('Direct DB access error:', dbErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to access products collection',
        error: dbErr.message,
        collections: collectionNames
      });
    }
    
    return res.json({
      success: true,
      dbName: mongoose.connection.name,
      collections: collectionNames,
      productsCount: productsData.length,
      sampleProducts: productsData.slice(0, 3)
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET all products with direct MongoDB approach
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products request received');
    
    // Use the direct MongoDB approach since we know it works
    const directProducts = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`Found ${directProducts.length} products via direct query`);
    
    return res.json({
      success: true,
      count: directProducts.length,
      data: directProducts
    });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// In backend/routes/productRoutes.js
// @route   GET /api/products/popular
// @desc    Get popular products
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    // For now, return all products sorted by popularity
    const products = await Product.find({})
      .sort({ popularity: -1, numReviews: -1 })
      .limit(8);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;