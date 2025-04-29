const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  specs: [{
    type: String
  }],
  avgRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  prices: [{
    retailer: String,
    price: Number,
    inStock: Boolean
  }],
  lowestPrice: {
    type: Number,
    required: true
  },
  priceHistory: [{
    type: Number
  }],
  releaseDate: {
    type: Date,
    default: Date.now
  },
  popularity: {
    type: Number,
    default: 0.5
  },
  // Add the compatibility field as a mixed type schema to support all component types
  compatibility: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'products' // Force the collection name explicitly
});

module.exports = mongoose.model('Product', ProductSchema);