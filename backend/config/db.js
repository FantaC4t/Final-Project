//backend/config/db.js
const mongoose = require('mongoose');

// Make sure you're connecting to the correct database (easyware)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/easyware', {
      // options might be here
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;