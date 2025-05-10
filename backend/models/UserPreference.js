const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    count: {
      type: Number,
      default: 1
    },
    lastViewed: {
      type: Date,
      default: Date.now
    }
  }],
  purchasedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  categoryPreferences: {
    type: Map,
    of: Number,
    default: {}
  },
  priceRangePreference: {
    min: Number,
    max: Number
  },
  performancePreference: {
    type: String,
    enum: ['budget', 'midrange', 'highend'],
    default: 'midrange'
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
