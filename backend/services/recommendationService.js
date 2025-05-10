const Product = require('../models/Product');
const UserPreference = require('../models/UserPreference');

// Get personal recommendations based on user history
async function getPersonalRecommendations(userId) {
  try {
    // Get user preferences
    const userPref = await UserPreference.findOne({ userId }).populate({
      path: 'purchasedProducts.productId viewedProducts.productId',
      select: 'category specs brand price'
    });
    
    if (!userPref) {
      return getPopularProducts(); // Fallback to popular products
    }

    // Extract user's preferred categories
    const categoryScores = {};
    const viewedCategories = {};
    const brandPreferences = {};
    
    // Calculate scores from viewed products
    userPref.viewedProducts.forEach(view => {
      if (view.productId) {
        const category = view.productId.category;
        const brand = view.productId.brand;
        
        // Category preference
        viewedCategories[category] = (viewedCategories[category] || 0) + view.count;
        
        // Brand preference
        brandPreferences[brand] = (brandPreferences[brand] || 0) + view.count;
      }
    });
    
    // Higher weight for purchased products
    userPref.purchasedProducts.forEach(purchase => {
      if (purchase.productId) {
        const category = purchase.productId.category;
        const brand = purchase.productId.brand;
        
        // Category gets higher weight for purchases (5x viewed)
        viewedCategories[category] = (viewedCategories[category] || 0) + 5;
        
        // Brand gets higher weight for purchases
        brandPreferences[brand] = (brandPreferences[brand] || 0) + 5;
      }
    });
    
    // Get top 3 categories
    const topCategories = Object.entries(viewedCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
      
    // Get top 3 brands
    const topBrands = Object.entries(brandPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
      
    // Find recommendations
    const recommendations = await Product.find({
      $or: [
        { category: { $in: topCategories } },
        { brand: { $in: topBrands } }
      ]
    }).limit(10);
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getPopularProducts(); // Fallback to popular items
  }
}

// Get recommendations based on similar users (collaborative filtering)
async function getCollaborativeRecommendations(userId) {
  try {
    const userPref = await UserPreference.findOne({ userId });
    if (!userPref) return [];
    
    // Find users with similar purchase patterns
    const userPreferences = await UserPreference.find({
      userId: { $ne: userId },
      'purchasedProducts.productId': { 
        $in: userPref.purchasedProducts.map(p => p.productId)
      }
    }).limit(10).populate({
      path: 'purchasedProducts.productId',
      select: 'name category brand price specs'
    });
    
    // Extract products purchased by similar users that current user hasn't purchased
    const currentUserProductIds = new Set(
      userPref.purchasedProducts.map(p => p.productId.toString())
    );
    
    const recommendedProducts = [];
    
    userPreferences.forEach(pref => {
      pref.purchasedProducts.forEach(purchase => {
        if (purchase.productId && !currentUserProductIds.has(purchase.productId._id.toString())) {
          recommendedProducts.push(purchase.productId);
        }
      });
    });
    
    return recommendedProducts.slice(0, 5);
  } catch (error) {
    console.error('Error with collaborative recommendations:', error);
    return [];
  }
}

// Get most popular products overall
async function getPopularProducts() {
  try {
    // Get products with highest number of reviews/ratings
    return await Product.find({})
      .sort({ numReviews: -1, avgRating: -1 })
      .limit(6);
  } catch (error) {
    console.error('Error getting popular products:', error);
    return [];
  }
}

// Get build compatibility recommendations
async function getCompatibleComponents(partType, currentBuild) {
  try {
    // Base query to find components of specified type
    let query = { category: partType };
    
    // Apply compatibility filters based on current build
    if (currentBuild.cpu && partType === 'Motherboard') {
      // Get CPU socket from database
      const cpu = await Product.findById(currentBuild.cpu);
      if (cpu && cpu.specs && cpu.specs.socket) {
        query['specs.socket'] = cpu.specs.socket;
      }
    }
    
    if (currentBuild.motherboard && partType === 'RAM') {
      const motherboard = await Product.findById(currentBuild.motherboard);
      if (motherboard && motherboard.specs && motherboard.specs.memoryType) {
        query['specs.type'] = motherboard.specs.memoryType;
      }
    }
    
    // Return compatible components
    const components = await Product.find(query).limit(10);
    return components;
  } catch (error) {
    console.error('Error finding compatible components:', error);
    return [];
  }
}

module.exports = {
  getPersonalRecommendations,
  getCollaborativeRecommendations,
  getPopularProducts,
  getCompatibleComponents
};
