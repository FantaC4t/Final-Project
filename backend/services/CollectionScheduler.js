const cron = require('node-cron');
const DataCollector = require('./DataCollector');

class CollectionScheduler {
  constructor() {
    this.collector = new DataCollector();
    this.isCollecting = false;
  }
  
  async initialize() {
    await this.collector.initialize();
    
    // Schedule daily collection at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.startCollection();
    });
    
    console.log('Collection scheduler initialized');
  }
  
  async startCollection() {
    if (this.isCollecting) {
      console.log('Collection already in progress');
      return;
    }
    
    this.isCollecting = true;
    console.log('Starting scheduled data collection');
    
    try {
      const result = await this.collector.startCollection();
      console.log(`Collection completed: ${result.savedCount} products added, ${result.updatedCount} products updated`);
    } catch (error) {
      console.error('Error during scheduled collection:', error);
    } finally {
      this.isCollecting = false;
    }
  }
  
  async manualCollection() {
    if (this.isCollecting) {
      return { success: false, message: 'Collection already in progress' };
    }
    
    this.startCollection();
    return { success: true, message: 'Collection started' };
  }
}

module.exports = new CollectionScheduler();