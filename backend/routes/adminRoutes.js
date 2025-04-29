const express = require('express');
const router = express.Router();
const collectionScheduler = require('../services/CollectionScheduler');
const { protectAdmin } = require('../middleware/authMiddleware');

// Initialize the collection scheduler
(async () => {
  try {
    await collectionScheduler.initialize();
  } catch (error) {
    console.error('Failed to initialize collector:', error);
  }
})();

// Start manual collection
router.post('/collect-data', protectAdmin, async (req, res) => {
  try {
    const result = await collectionScheduler.manualCollection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get collection status
router.get('/collection-status', protectAdmin, (req, res) => {
  res.json({ 
    isCollecting: collectionScheduler.isCollecting,
    lastCollection: collectionScheduler.lastCollectionTime,
    nextScheduled: collectionScheduler.nextScheduledTime
  });
});

module.exports = router;