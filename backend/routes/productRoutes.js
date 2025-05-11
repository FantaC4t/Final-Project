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

// @route   GET /api/products
// @desc    Get products with pagination, filtering, and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Query params:', req.query);
    
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'lowest';
    const category = req.query.category || null;
    const search = req.query.search || null;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 100000;  // High default max
    const inStock = req.query.inStock === 'true' ? true : null;

    // Build the filter query
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };  // Case-insensitive search
    }
    
    // Only apply price filter if lowestPrice field exists
    filter.lowestPrice = { $gte: minPrice, $lte: maxPrice };
    
    if (inStock) {
      // This assumes you have a structure like prices: [{retailer: '...', price: X, inStock: true/false}]
      filter['prices.inStock'] = true;  // At least one retailer has it in stock
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Build the sort object
    let sort = {};
    if (sortBy === 'lowest') {
      sort = { lowestPrice: 1 };
    } else if (sortBy === 'highest') {
      sort = { lowestPrice: -1 };
    } else if (sortBy === 'rating') {
      sort = { avgRating: -1 };
    } else if (sortBy === 'popularity') {
      sort = { popularity: -1 };
    }
    
    console.log('Filter:', JSON.stringify(filter));
    console.log('Sort:', sort);
    
    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();  // Use lean() for better performance when you don't need Mongoose document methods
    
    // Get total count for pagination
    const totalItems = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    
    console.log(`Found ${totalItems} products, page ${page} of ${totalPages}`);
    
    res.json({
      success: true,
      products,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching products',
      error: error.message
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