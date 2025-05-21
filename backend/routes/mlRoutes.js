const express = require('express');
const router = express.Router();
const pricePredService = require('../services/pricePredService'); // Adjust path

// @route   GET /api/ml/price-prediction/:productId
// @desc    Get price prediction for a product
// @access  Public
router.get('/price-prediction/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const days = parseInt(req.query.days, 10) || 30; // Default to 30 days if not specified

    if (!pricePredService.initialized) {
      console.error('Price prediction service not initialized yet.');
      return res.status(503).json({ 
        success: false, 
        message: 'Price prediction service is not ready. Please try again shortly.' 
      });
    }

    const predictionData = await pricePredService.predictPrice(productId, days);
    
    res.json({
      success: true,
      prediction: predictionData // The service already structures this well
    });

  } catch (error) {
    console.error(`Error in /price-prediction/${req.params.productId}:`, error.message);
    // Send specific error messages based on known errors from the service
    if (error.message === 'Product not found' || error.message === 'No price history available') {
      return res.status(404).json({ success: false, message: error.message });
    }
    // Generic server error for other cases
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching price prediction.',
      error: error.message // Optionally include more detail in dev
    });
  }
});

module.exports = router;