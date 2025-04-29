const mongoose = require('mongoose');
const DataCollector = require('./services/DataCollector');
require('dotenv').config();

// Initialize MongoDB connection
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Update the runTest function to test just the KSP GPU URL:

async function runTest() {
  try {
    console.log('Starting data collection test...');
    await connectToDatabase();
    
    const collector = new DataCollector();
    console.log('Initializing collector...');
    await collector.initialize();
    
    // Update the testUrl:
    const testUrl = 'https://www.zap.co.il/computers/hardware/videocards'; // Zap GPUs
    console.log(`Testing specific URL: ${testUrl}`);
    
    const products = await collector.scrapeSourcePage(testUrl, 'zap', 'he');
    console.log(`Scraped ${products.length} products from KSP`);
    
    if (products.length > 0) {
      console.log('First product example:');
      console.log(JSON.stringify(products[0], null, 2));
    }
    
    if (products.length > 0) {
      // Process and save to database
      const normalizedData = collector.normalizeData(products);
      const enrichedData = collector.enrichWithCompatibility(normalizedData);
      const result = await collector.saveToDatabase(enrichedData);
      
      console.log('Data saved to database:');
      console.log(`New products: ${result.savedCount}`);
      console.log(`Updated products: ${result.updatedCount}`);
    }
    
    // Disconnect from database after completion
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
    
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('Database connection closed');
      }
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
    
    process.exit(1);
  }
}

// Run the test
runTest();