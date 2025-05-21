const Product = require('../models/Product');
const UserPreference = require('../models/UserPreference'); // #.# USERPREFERENCE.JS CONTEXT

// Helper to process wishlist items and boost scores
function applyWishlistToScores(wishlistProducts, viewedCategories, brandPreferences) {
  wishlistProducts.forEach(item => {
    if (item.category) {
      viewedCategories[item.category] = (viewedCategories[item.category] || 0) + 10;
    }
    if (item.brand) {
      brandPreferences[item.brand] = (brandPreferences[item.brand] || 0) + 10;
    }
  });
}

async function getPersonalRecommendations(userId, clientWishlistProductIds = []) {
  try {
    const viewedCategories = {};
    const brandPreferences = {};
    let userPref = null;
    let purchasedProductIdsFromDb = [];

    if (userId) {
      userPref = await UserPreference.findOne({ userId }).populate({
        path: 'purchasedProducts.productId viewedProducts.productId',
        select: 'category brand name _id',
      });
    }

    if (userPref) {
      userPref.viewedProducts.forEach(view => {
        if (view.productId) {
          viewedCategories[view.productId.category] = (viewedCategories[view.productId.category] || 0) + view.count;
          brandPreferences[view.productId.brand] = (brandPreferences[view.productId.brand] || 0) + view.count;
        }
      });
      userPref.purchasedProducts.forEach(purchase => {
        if (purchase.productId) {
          viewedCategories[purchase.productId.category] = (viewedCategories[purchase.productId.category] || 0) + 5;
          brandPreferences[purchase.productId.brand] = (brandPreferences[purchase.productId.brand] || 0) + 5;
          purchasedProductIdsFromDb.push(purchase.productId._id.toString());
        }
      });
    }

    let wishlistProductsFromDb = [];
    if (clientWishlistProductIds && clientWishlistProductIds.length > 0) {
      wishlistProductsFromDb = await Product.find({
        '_id': { $in: clientWishlistProductIds }
      }).select('category brand name');
      applyWishlistToScores(wishlistProductsFromDb, viewedCategories, brandPreferences);
    }

    if (Object.keys(viewedCategories).length === 0 && Object.keys(brandPreferences).length === 0) {
      return getPopularProducts(clientWishlistProductIds);
    }

    const topCategories = Object.entries(viewedCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const topBrands = Object.entries(brandPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const queryConditions = [];
    if (topCategories.length > 0) queryConditions.push({ category: { $in: topCategories } });
    if (topBrands.length > 0) queryConditions.push({ brand: { $in: topBrands } });

    let query = {};
    if (queryConditions.length > 0) {
      query.$or = queryConditions;
    } else {
      return getPopularProducts(clientWishlistProductIds);
    }

    const allIdsToExclude = [...new Set([...clientWishlistProductIds, ...purchasedProductIdsFromDb])];
    if (allIdsToExclude.length > 0) {
      query._id = { $nin: allIdsToExclude };
    }

    let recommendations = await Product.find(query)
      .sort({ popularity: -1, numReviews: -1, avgRating: -1 })
      .limit(10);

    if (recommendations.length < 5) {
      const currentRecommendationIds = recommendations.map(r => r._id.toString());
      const fallbackExcludeIds = [...new Set([...allIdsToExclude, ...currentRecommendationIds])];
      const popularFallback = await getPopularProducts(fallbackExcludeIds, 5 - recommendations.length);
      recommendations = [...recommendations, ...popularFallback];
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getPopularProducts(clientWishlistProductIds); // Fallback with potential excludes
  }
}

// This is the version of getPopularProducts that should be kept and used.
// It accepts excludeIds and a limit.
async function getPopularProducts(excludeIds = [], limit = 6) {
  try {
    const query = excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {};
    return await Product.find(query)
      .sort({ numReviews: -1, avgRating: -1 }) // Example sorting for popular
      .limit(limit);
  } catch (error) {
    console.error('Error getting popular products:', error);
    return [];
  }
}

// Get recommendations based on similar users (collaborative filtering)
async function getCollaborativeRecommendations(userId) {
  try {
    const userPref = await UserPreference.findOne({ userId });
    if (!userPref || !userPref.purchasedProducts) return []; // Added null check for purchasedProducts
    
    const currentUserProductIds = new Set(
      userPref.purchasedProducts.map(p => p.productId?.toString()).filter(id => id) // Added optional chaining and filter
    );

    const similarUsersPreferences = await UserPreference.find({
      userId: { $ne: userId },
      'purchasedProducts.productId': { 
        $in: userPref.purchasedProducts.map(p => p.productId).filter(id => id) // Filter nulls
      }
    }).limit(10).populate({
      path: 'purchasedProducts.productId',
      select: 'name category brand specs _id' // Ensure _id is selected
    });
    
    const recommendedProductsMap = new Map();
    
    similarUsersPreferences.forEach(pref => {
      pref.purchasedProducts.forEach(purchase => {
        if (purchase.productId && !currentUserProductIds.has(purchase.productId._id.toString())) {
          if (!recommendedProductsMap.has(purchase.productId._id.toString())) {
             recommendedProductsMap.set(purchase.productId._id.toString(), purchase.productId);
          }
        }
      });
    });
    
    return Array.from(recommendedProductsMap.values()).slice(0, 5);
  } catch (error) {
    console.error('Error with collaborative recommendations:', error);
    return [];
  }
}

// REMOVED the duplicate getPopularProducts function that took no arguments.

// Get build compatibility recommendations
async function getCompatibleComponents(partType, currentBuild) {
  try {
    let query = { category: partType }; // Ensure category field matches your Product schema
    
    // Example: If currentBuild has a CPU and we're looking for a Motherboard
    if (currentBuild.cpu && partType === 'Motherboards') { // Assuming 'Motherboards' is the category name
      const cpu = await Product.findById(currentBuild.cpu);
      // Ensure cpu.compatibility.socket exists and matches your schema
      if (cpu && cpu.compatibility && cpu.compatibility.socket) {
        query['compatibility.socket'] = cpu.compatibility.socket;
      }
    }
    
    // Example: If currentBuild has a Motherboard and we're looking for RAM (Memory)
    if (currentBuild.motherboard && partType === 'Memory') { // Assuming 'Memory' is the category name
      const motherboard = await Product.findById(currentBuild.motherboard);
      // Ensure motherboard.compatibility.memoryType exists
      if (motherboard && motherboard.compatibility && motherboard.compatibility.memoryType) {
        query['compatibility.memoryType'] = motherboard.compatibility.memoryType;
      }
    }
    
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
  getPopularProducts, // This now correctly refers to the version with parameters
  getCompatibleComponents
};
