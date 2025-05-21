// const Product = require('../models/Product'); // Only if needed for more complex AI logic that fetches product details

// Simulated Gemini comparison logic
const performAiComparisonLogic = async (itemsToCompare) => {
  // Basic input validation
  if (!itemsToCompare || itemsToCompare.length < 2) {
    return "Please provide at least two items to compare.";
  }
  
  // Extract relevant product details for comparison
  const formattedItems = itemsToCompare.map(item => ({
    name: item.name,
    category: item.category,
    price: item.lowestPrice,
    brand: item.brand || 'Unknown',
    specs: item.specs || [],
    rating: item.avgRating || 0,
    reviews: item.numReviews || 0,
    performanceTier: item.performanceTier || 'Unknown',
    useCases: item.useCases || [],
    compatibility: item.compatibility || {}
  }));

  // In a real implementation, you would call the Gemini API here with a well-crafted prompt
  // For now, we'll simulate a detailed response based on the product attributes
  
  // Building a detailed comparison
  let comparisonText = `# Comparison of ${formattedItems.map(item => item.name).join(' vs ')}\n\n`;
  
  // Add overview section
  comparisonText += `## Overview\n`;
  formattedItems.forEach((item, index) => {
    comparisonText += `**${item.name}** is a ${item.category} from ${item.brand}, priced at $${item.price?.toFixed(2)}. `;
    comparisonText += `It has an average rating of ${item.rating?.toFixed(1)}/5 based on ${item.reviews} customer reviews.\n\n`;
  });
  
  // Add price comparison
  comparisonText += `## Price Comparison\n`;
  // Sort items by price
  const sortedByPrice = [...formattedItems].sort((a, b) => a.price - b.price);
  comparisonText += `- **${sortedByPrice[0].name}** is the more economical option at $${sortedByPrice[0].price?.toFixed(2)}\n`;
  
  if (sortedByPrice.length > 1) {
    const priceDiff = sortedByPrice[1].price - sortedByPrice[0].price;
    const percentDiff = (priceDiff / sortedByPrice[0].price) * 100;
    
    comparisonText += `- **${sortedByPrice[1].name}** costs $${priceDiff.toFixed(2)} more (${percentDiff.toFixed(1)}% higher)\n\n`;
  }
  
  // Add specifications comparison if same category
  const sameCategory = formattedItems.every(item => item.category === formattedItems[0].category);
  if (sameCategory) {
    comparisonText += `## Key Specifications Comparison\n`;
    
    // For CPUs, GPUs, etc. add specific comparisons
    if (['Processors', 'Graphics Cards', 'Memory', 'Storage'].includes(formattedItems[0].category)) {
      // Find common aspects to compare based on the specs arrays
      const performanceComparison = generatePerformanceComparison(formattedItems);
      comparisonText += performanceComparison + '\n\n';
    }
  }
  
  // Add use case recommendations
  comparisonText += `## Recommended Use Cases\n`;
  formattedItems.forEach(item => {
    comparisonText += `**${item.name}**:\n`;
    
    if (item.useCases && item.useCases.length > 0) {
      item.useCases.forEach(useCase => {
        comparisonText += `- ${useCase}\n`;
      });
    } else {
      // Generate appropriate use cases based on category and performance tier
      const suggestedUseCases = suggestUseCases(item);
      suggestedUseCases.forEach(useCase => {
        comparisonText += `- ${useCase}\n`;
      });
    }
    comparisonText += '\n';
  });
  
  // Add buying recommendation
  comparisonText += `## Recommendation\n`;
  
  // Generate a contextual recommendation based on the products
  const recommendation = generateRecommendation(formattedItems);
  comparisonText += recommendation;
  
  return comparisonText;
};

// Helper function to generate performance comparison
function generatePerformanceComparison(items) {
  let comparisonText = '';
  
  // Compare by category
  if (items[0].category === 'Processors') {
    comparisonText += `Both processors have different performance characteristics:\n\n`;
    items.forEach(item => {
      const coreSpec = item.specs.find(s => s.toLowerCase().includes('core')) || 'Multi-core processor';
      const clockSpec = item.specs.find(s => s.toLowerCase().includes('ghz')) || 'Variable clock speeds';
      const archSpec = item.specs.find(s => s.toLowerCase().includes('nm') || s.toLowerCase().includes('architecture')) || 'Modern architecture';
      
      comparisonText += `**${item.name}**:\n`;
      comparisonText += `- **Cores/Threads**: ${coreSpec}\n`;
      comparisonText += `- **Clock Speed**: ${clockSpec}\n`;
      comparisonText += `- **Architecture**: ${archSpec}\n`;
      
      if (item.performanceTier) {
        comparisonText += `- **Performance Tier**: ${item.performanceTier}\n`;
      }
      comparisonText += '\n';
    });
  }
  else if (items[0].category === 'Graphics Cards') {
    comparisonText += `Comparing GPU specifications:\n\n`;
    items.forEach(item => {
      const memorySpec = item.specs.find(s => s.toLowerCase().includes('gb') && s.toLowerCase().includes('memory')) || 'Variable memory configuration';
      const architectureSpec = item.specs.find(s => s.toLowerCase().includes('architecture')) || 'Modern GPU architecture';
      const rtSpec = item.specs.find(s => s.toLowerCase().includes('ray tracing') || s.toLowerCase().includes('rt')) || 'Graphics acceleration';
      
      comparisonText += `**${item.name}**:\n`;
      comparisonText += `- **Memory**: ${memorySpec}\n`;
      comparisonText += `- **Architecture**: ${architectureSpec}\n`;
      comparisonText += `- **Special Features**: ${rtSpec}\n`;
      
      if (item.performanceTier) {
        comparisonText += `- **Performance Tier**: ${item.performanceTier}\n`;
      }
      comparisonText += '\n';
    });
  }
  // Add other categories as needed
  
  return comparisonText;
}

// Helper function to suggest use cases based on product type and tier
function suggestUseCases(item) {
  const useCases = [];
  
  if (item.category === 'Processors') {
    if (item.performanceTier === 'high' || (item.price && item.price > 300)) {
      useCases.push('High-end gaming');
      useCases.push('3D rendering and content creation');
      useCases.push('Virtual machine hosting');
    } else if (item.performanceTier === 'mid' || (item.price && item.price > 150)) {
      useCases.push('Mainstream gaming');
      useCases.push('Photo/video editing');
      useCases.push('Multitasking workloads');
    } else {
      useCases.push('Office productivity');
      useCases.push('Web browsing and media consumption');
      useCases.push('Student/home use');
    }
  }
  else if (item.category === 'Graphics Cards') {
    if (item.performanceTier === 'high' || (item.price && item.price > 500)) {
      useCases.push('4K gaming');
      useCases.push('AI and machine learning');
      useCases.push('Professional 3D rendering');
    } else if (item.performanceTier === 'mid' || (item.price && item.price > 300)) {
      useCases.push('1440p gaming');
      useCases.push('Video editing');
      useCases.push('Streaming and content creation');
    } else {
      useCases.push('1080p gaming');
      useCases.push('Basic content creation');
      useCases.push('Multiple monitor productivity');
    }
  }
  // Add other categories as needed
  
  return useCases;
}

// Helper function to generate an overall recommendation
function generateRecommendation(items) {
  if (items.length !== 2) {
    return `Comparing multiple products: Each has its strengths for different use cases. Consider your specific needs and budget.`;
  }
  
  const item1 = items[0];
  const item2 = items[1];
  
  // Price difference
  const priceDiff = Math.abs(item1.price - item2.price);
  const cheaperItem = item1.price < item2.price ? item1 : item2;
  const expensiveItem = item1.price < item2.price ? item2 : item1;
  
  // Performance tiers
  const performanceDiff = getPerformanceTierValue(expensiveItem.performanceTier) - getPerformanceTierValue(cheaperItem.performanceTier);
  
  // Ratings
  const ratingDiff = expensiveItem.rating - cheaperItem.rating;
  
  let recommendation = '';
  
  // If price difference is small but performance difference is significant
  if (priceDiff < 50 && performanceDiff > 1) {
    recommendation = `**Best Value**: The **${expensiveItem.name}** offers significantly better performance for just a small price premium over the **${cheaperItem.name}**. Unless you're on a very tight budget, the extra investment is worth considering.`;
  }
  // If price difference is large but performance difference is minimal
  else if (priceDiff > 100 && performanceDiff <= 1) {
    recommendation = `**Best Value**: The **${cheaperItem.name}** offers similar performance to the **${expensiveItem.name}** at a much lower price point, making it the better value option for most users.`;
  }
  // If expensive option has much better ratings
  else if (ratingDiff > 1) {
    recommendation = `While the **${cheaperItem.name}** is more affordable, the **${expensiveItem.name}** has significantly better user ratings, suggesting better reliability and user satisfaction. Consider the **${expensiveItem.name}** as a long-term investment.`;
  }
  // Balanced comparison
  else {
    recommendation = `For budget-conscious users, the **${cheaperItem.name}** offers solid performance for the price. If you need the extra capabilities, the **${expensiveItem.name}** justifies its higher price with better ${getPerformanceAspect(items[0].category)}.`;
  }
  
  return recommendation;
}

// Helper to convert performance tiers to numeric values
function getPerformanceTierValue(tier) {
  if (!tier) return 2; // Default to mid-tier if undefined
  
  switch(tier.toLowerCase()) {
    case 'low': return 1;
    case 'entry': return 1;
    case 'budget': return 1;
    case 'mid': return 2;
    case 'mainstream': return 2;
    case 'high': return 3;
    case 'premium': return 3;
    case 'enthusiast': return 4;
    case 'extreme': return 4;
    default: return 2;
  }
}

// Helper to get relevant performance aspects by category
function getPerformanceAspect(category) {
  switch(category) {
    case 'Processors': return 'multi-threaded performance';
    case 'Graphics Cards': return 'gaming and rendering capabilities';
    case 'Memory': return 'bandwidth and capacity';
    case 'Storage': return 'speed and reliability';
    case 'Motherboards': return 'features and expandability';
    case 'Power Supplies': return 'efficiency and reliability';
    default: return 'performance';
  }
}

exports.compareProductsWithAI = async (req, res) => {
  try {
    const { itemsToCompare } = req.body;

    if (!itemsToCompare || !Array.isArray(itemsToCompare) || itemsToCompare.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of at least two items to compare in the "itemsToCompare" field.'
      });
    }

    // In a real application with Gemini integration, you would:
    // 1. Format product data into a prompt
    // 2. Call the Gemini API with that prompt
    // 3. Process and format the response
    
    // For now, we'll use our enhanced simulation
    const comparisonSummary = await performAiComparisonLogic(itemsToCompare);

    res.json({ success: true, comparisonSummary });

  } catch (error) {
    console.error('Error in AI comparison controller:', error);
    res.status(500).json({ success: false, message: 'Server error during AI comparison.' });
  }
};
