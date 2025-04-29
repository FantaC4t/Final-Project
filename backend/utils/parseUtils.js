/**
 * Utility functions for parsing product data
 */

// Parse price from text (handles both Hebrew and English formats)
const parsePrice = (priceText) => {
  if (!priceText) return null;
  
  // Remove non-breaking spaces and other whitespace
  priceText = priceText.replace(/\s+/g, ' ').trim();
  
  // Match Hebrew price format (₪ followed by number or number followed by ₪)
  const hebrewMatch = priceText.match(/₪\s*([\d,]+(?:\.\d+)?)|(?:([\d,]+(?:\.\d+)?)\s*₪)/);
  
  if (hebrewMatch) {
    // Get the matched price (either group 1 or group 2)
    const priceStr = (hebrewMatch[1] || hebrewMatch[2]).replace(/,/g, '');
    return parseFloat(priceStr);
  }
  
  // Match common price formats ($ or just numbers)
  const englishMatch = priceText.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (englishMatch) {
    return parseFloat(englishMatch[1].replace(/,/g, ''));
  }
  
  // Try to find just numbers in the string
  const numericMatch = priceText.match(/[\d,]+(?:\.\d+)?/);
  if (numericMatch) {
    return parseFloat(numericMatch[0].replace(/,/g, ''));
  }
  
  return null;
};

// Clean text by removing excess whitespace and normalizing characters
const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
    .replace(/[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4]/g, match => match) // Preserve Hebrew characters
    .trim();
};

module.exports = {
  parsePrice,
  cleanText
};