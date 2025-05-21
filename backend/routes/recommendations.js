const express = require('express');
const router = express.Router();
const {
  getPersonalRecommendations,
  getPopularProducts,
  getCompatibleComponents
} = require('../services/recommendationService');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/recommendations
// @desc    Get personalized recommendations for logged-in user (can include current wishlist)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { wishlistProductIds } = req.body; // Array of product IDs from client's current wishlist
    const recommendations = await getPersonalRecommendations(req.user._id, wishlistProductIds || []);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error.message);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// @route   POST /api/recommendations/guest
// @desc    Get recommendations based on guest's current wishlist
// @access  Public
router.post('/guest', async (req, res) => {
  try {
    const { wishlistProductIds } = req.body; // Array of product IDs
    const recommendations = await getPersonalRecommendations(null, wishlistProductIds || []);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching guest recommendations:', error.message);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// @route   GET /api/recommendations/popular
// @desc    Get popular products (general fallback)
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    // Optionally, allow excluding IDs via query params if needed for some scenarios
    const excludeIds = req.query.excludeIds ? req.query.excludeIds.split(',') : [];
    const popularProducts = await getPopularProducts(excludeIds);
    res.json(popularProducts);
  } catch (error) {
    console.error('Error fetching popular products:', error.message);
    res.status(500).json({ message: 'Error fetching popular products', error: error.message });
  }
});

// @route   POST /api/recommendations/compatible/:partType
// @desc    Get compatible components for current PC build
// @access  Public
router.post('/compatible/:partType', async (req, res) => { // Changed to POST to accept currentBuild in body
  try {
    const currentBuild = req.body.currentBuild || {};
    const partType = req.params.partType;
    const components = await getCompatibleComponents(partType, currentBuild);
    res.json(components);
  } catch (error) {
    res.status(500).json({ message: 'Error finding compatible components', error: error.message });
  }
});

module.exports = router;
