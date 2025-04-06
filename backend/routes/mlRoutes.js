const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// GET price prediction for a product
router.get('/price-prediction/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;
    
    console.log(`Getting price prediction for product ID: ${productId}, days: ${days}`);
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    // Find the product in DB
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get price history
    const priceHistory = product.priceHistory || [];
    
    if (priceHistory.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient price history for prediction'
      });
    }
    
    // Simple linear prediction algorithm
    const predictedPrice = linearRegressionPredict(priceHistory, parseInt(days));
    const currentPrice = priceHistory[priceHistory.length - 1];
    const trend = predictedPrice > currentPrice ? 'up' : 'down';
    const volatility = calculateVolatility(priceHistory);
    
    return res.json({
      currentPrice,
      predictedPrice,
      daysInFuture: parseInt(days),
      confidence: 0.75, // Mock confidence value
      trend,
      volatility
    });
  } catch (error) {
    console.error('Error in price prediction:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Helper functions
function linearRegressionPredict(prices, daysInFuture) {
  // Simple linear regression for prediction
  const n = prices.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predict future price
  return intercept + slope * (n - 1 + daysInFuture / 30);
}

function calculateVolatility(priceHistory) {
  if (priceHistory.length < 2) return 0;
  
  const changes = [];
  for (let i = 1; i < priceHistory.length; i++) {
    const percentChange = Math.abs(priceHistory[i] - priceHistory[i-1]) / priceHistory[i-1];
    changes.push(percentChange);
  }
  
  // Calculate standard deviation of changes
  const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
  const squareDiffs = changes.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  
  return Math.sqrt(avgSquareDiff);
}

module.exports = router;