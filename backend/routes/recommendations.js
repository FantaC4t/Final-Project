const express = require('express');
const router = express.Router();
const { 
  getPersonalRecommendations, 
  getCollaborativeRecommendations, 
  getPopularProducts,
  getCompatibleComponents
} = require('../services/recommendationService');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/recommendations
// @desc    Get personalized recommendations for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const recommendations = await getPersonalRecommendations(req.user._id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// @route   GET /api/recommendations/popular
// @desc    Get popular products (for guests or new users)
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularProducts = await getPopularProducts();
    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular products', error: error.message });
  }
});

// @route   GET /api/recommendations/compatible/:partType
// @desc    Get compatible components for current PC build
// @access  Public
router.get('/compatible/:partType', async (req, res) => {
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
