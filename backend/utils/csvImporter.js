const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Product = require('../models/Product');

// Function to import transformed CSV data to MongoDB
async function importCSVDataToMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcbuilder', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📊 Connected to MongoDB');
    
    // Directory with transformed CSV data
    const dataDir = path.join(__dirname, '..', 'data', 'transformed');
    
    // Get all JSON files
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'));
      
    console.log(`📁 Found ${files.length} JSON files to import`);
    
    // Total count of imported items
    let totalImported = 0;
    
    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(dataDir, file);
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n🔄 Importing ${items.length} items from ${file}...`);
        
        let fileImportCount = 0;
        
        // Import each item
        for (const item of items) {
          try {
            // Check if product already exists
            const existingProduct = await Product.findOne({ name: item.name });
            
            if (existingProduct) {
              // Update existing product
              await Product.findByIdAndUpdate(existingProduct._id, item);
              console.log(`  ♻️ Updated: ${item.name}`);
            } else {
              // Create new product
              await Product.create(item);
              console.log(`  ✨ Created: ${item.name}`);
            }
            
            fileImportCount++;
          } catch (itemError) {
            console.error(`  ❌ Failed to import item: ${item.name || 'Unnamed item'}`, itemError);
          }
        }
        
        console.log(`✅ Imported ${fileImportCount}/${items.length} items from ${file}`);
        totalImported += fileImportCount;
      } catch (fileError) {
        console.error(`❌ Failed to import from ${file}:`, fileError);
      }
    }
    
    console.log(`\n🎉 Total items imported to MongoDB: ${totalImported}`);
  } catch (error) {
    console.error('❌ Error importing to MongoDB:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📊 MongoDB connection closed');
  }
}

module.exports = {
  importCSVDataToMongoDB
};

// Run the script directly if called from command line
if (require.main === module) {
  importCSVDataToMongoDB()
    .then(() => console.log('✅ Data import completed'))
    .catch(err => console.error('❌ Failed to import data:', err));
}