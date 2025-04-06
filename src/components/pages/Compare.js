import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiShoppingCart, FiBarChart2, FiStar, 
  FiChevronDown, FiX, FiMonitor, FiCpu, FiServer, 
  FiHardDrive, FiGrid, FiBattery, FiBox, FiWind 
} from 'react-icons/fi';
import PricePrediction from '../PricePrediction';

// Mock data for demonstration
const mockRetailers = ['Amazon', 'Newegg', 'Best Buy', 'Micro Center', 'B&H Photo'];
const mockCategories = ['Graphics Cards', 'Processors', 'Memory', 'Storage', 'Motherboards', 'Power Supplies', 'Cases', 'Cooling'];

// Mock search results with local image paths
function Compare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState('lowest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [priceHistoryModal, setPriceHistoryModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Add these new state variables for "applied" filters
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 2000]);
  const [appliedSortBy, setAppliedSortBy] = useState('lowest');
  const [appliedInStockOnly, setAppliedInStockOnly] = useState(false);

  // Add this new state variable
  const [isFilterClosing, setIsFilterClosing] = useState(false);

  // Add this new state variable for products
  const [products, setProducts] = useState([]);

  // Add useState for tracking expanded items
  const [expandedItems, setExpandedItems] = useState({});

  // Add toggle function
  const toggleExpand = (itemId) => {
    setExpandedItems({
      ...expandedItems,
      [itemId]: !expandedItems[itemId]
    });
  };

  // Update filterResults to use the products from state
  const filterResults = (filterPriceRange, filterSortBy, filterInStockOnly, productData = products) => {
    // Start with all products
    let filtered = [...productData];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.specs.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Apply price range filter
    filtered = filtered.filter(
      item => item.lowestPrice >= filterPriceRange[0] && item.lowestPrice <= filterPriceRange[1]
    );
    
    // Apply in-stock filter
    if (filterInStockOnly) {
      filtered = filtered.filter(
        item => item.prices.some(price => price.inStock)
      );
    }
    
    // Apply sorting
    if (filterSortBy === 'lowest') {
      filtered.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (filterSortBy === 'highest') {
      filtered.sort((a, b) => b.lowestPrice - a.lowestPrice);
    } else if (filterSortBy === 'rating') {
      filtered.sort((a, b) => b.avgRating - a.avgRating);
    }
    
    return filtered;
  };

  // Simulate search functionality
  useEffect(() => {
    // CHANGE: Allow showing results even without search terms
    // Using applied filter values instead of pending ones
    setSearchResults(filterResults(appliedPriceRange, appliedSortBy, appliedInStockOnly));
    
  }, [searchTerm, selectedCategory, appliedPriceRange, appliedSortBy, appliedInStockOnly]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        
        // Use explicit URL
        const response = await fetch('http://localhost:5000/api/products');
        console.log('Response status:', response.status);
        
        // Get response text first to debug
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Try parsing as JSON
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed data:', data);
          
          if (!data.data || !Array.isArray(data.data)) {
            console.warn('API returned invalid data structure:', data);
            return;
          }
          
          console.log(`Fetched ${data.data.length} products`);
          
          // Process data
          setProducts(data.data);
          setSearchResults(data.data);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          console.log('First 100 chars of response:', responseText.substring(0, 100));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchResults.length > 0) {
      console.log('First product ID:', searchResults[0]._id);
      console.log('Full first product:', searchResults[0]);
    }
  }, [searchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger the API call
    // For this demo, the useEffect handles the filtering
    console.log('Searching for:', searchTerm);
  };

  const handleAddToCompare = (item) => {
    // Use _id instead of id
    if (compareItems.find(i => i._id === item._id)) {
      setCompareItems(compareItems.filter(i => i._id !== item._id));
    } else {
      setCompareItems([...compareItems, item]);
    }
  };

  const isItemInCompare = (itemId) => {
    // Use _id instead of id
    return compareItems.some(item => item._id === itemId);
  };

  const handleViewPriceHistory = (item) => {
    setCurrentItem(item);
    setPriceHistoryModal(true);
  };

  const closeModal = () => {
    setPriceHistoryModal(false);
  };

  // Update handleApplyFilters to apply the pending filters
  const handleApplyFilters = () => {
    setAppliedPriceRange(priceRange);
    setAppliedSortBy(sortBy);
    setAppliedInStockOnly(inStockOnly);
  };

  // Update handleResetFilters to reset both pending and applied filters
  const handleResetFilters = () => {
    // Reset pending filters
    setPriceRange([0, 2000]);
    setSortBy('lowest');
    setInStockOnly(false);
    
    // Reset applied filters
    setAppliedPriceRange([0, 2000]);
    setAppliedSortBy('lowest');
    setAppliedInStockOnly(false);
  };

  // Replace the current filter button click handler
  const toggleFilters = () => {
    if (showFilters) {
      // Start closing animation
      setIsFilterClosing(true);
      // Remove from DOM after animation completes
      setTimeout(() => {
        setShowFilters(false);
        setIsFilterClosing(false);
      }, 300); // Match animation duration
    } else {
      setShowFilters(true);
    }
  };

  return (
    <div className="pyro-page compare-page">
      <div className="page-header">
        <h1>Price Comparison</h1>
      </div>
      
      <div className="compare-page-container">
        {/* Search and filters section */}
        <div className="compare-search-container">
          <form onSubmit={handleSearch} className="compare-search-form">
            <div className="search-input-group">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for components (e.g., RTX 4070, Ryzen 7900X)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="pyro-button primary">Search</button>
            </div>

            <div className="search-options">
              <div className="category-dropdown">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="All Categories">All Categories</option>
                  {mockCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <FiChevronDown className="dropdown-icon" />
              </div>
              
              <button 
                type="button" 
                className="filter-button"
                onClick={toggleFilters}
              >
                <FiFilter /> Filters
              </button>
            </div>
          </form>

          {/* Advanced filters panel */}
          {(showFilters || isFilterClosing) && (
            <div className={`filter-panel ${isFilterClosing ? 'filter-panel-closing' : ''}`}>
              <div className="filter-section">
                <h3>Price Range</h3>
                <div className="price-labels">
                  <span>$0</span>
                  <span>$2000</span>
                </div>
                <div 
                  className="price-slider"
                  style={{ 
                    '--left-percent': `${(priceRange[0]/2000)*100}%`,
                    '--right-percent': `${100 - (priceRange[1]/2000)*100}%` 
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      // Ensure minimum doesn't exceed maximum
                      setPriceRange([Math.min(newMin, priceRange[1] - 50), priceRange[1]]);
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      // Ensure maximum isn't less than minimum
                      setPriceRange([priceRange[0], Math.max(newMax, priceRange[0] + 50)]);
                    }}
                  />
                </div>
                <div className="price-range-display">
                  ${priceRange[0]} - ${priceRange[1]}
                </div>
              </div>

              <div className="filter-section">
                <h3>Sort By</h3>
                <div className="radio-group">
                  <label className="radio-container">
                    <input type="radio" name="sortBy" value="lowest" checked={sortBy === 'lowest'} onChange={() => setSortBy('lowest')} />
                    <span className="radio-mark"></span>
                    Lowest Price
                  </label>
                  <label className="radio-container">
                    <input 
                      type="radio" 
                      name="sortBy" 
                      value="highest" 
                      checked={sortBy === 'highest'}
                      onChange={() => setSortBy('highest')}
                    />
                    <span className="radio-mark"></span>
                    Highest Price
                  </label>
                  <label className="radio-container">
                    <input 
                      type="radio" 
                      name="sortBy" 
                      value="rating" 
                      checked={sortBy === 'rating'}
                      onChange={() => setSortBy('rating')}
                    />
                    <span className="radio-mark"></span>
                    Best Rating
                  </label>
                </div>
              </div>

              <div className="filter-section">
                <h3>Availability</h3>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                  />
                  <span className="checkmark"></span>
                  In Stock Only
                </label>
              </div>

              <div className="filter-actions">
                <button 
                  className="pyro-button secondary"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
                <button 
                  className="pyro-button primary"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected for comparison */}
        {compareItems.length > 0 && (
          <div className="comparison-selection">
            <div className="comparison-header">
              <h2>Comparison ({compareItems.length})</h2>
              <button 
                className="clear-comparison"
                onClick={() => setCompareItems([])}
              >
                Clear All
              </button>
            </div>
            <div className="comparison-items">
              {compareItems.map(item => (
                <div key={item._id} className="comparison-item">
                  <img src={item.image} alt={item.name} />
                  <div className="comparison-item-name">{item.name}</div>
                  <button 
                    className="remove-item"
                    onClick={() => handleAddToCompare(item)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {compareItems.length >= 2 && (
                <button className="pyro-button primary compare-button">
                  Compare Items
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search results - UPDATE THIS CONDITIONAL */}
        {searchResults && searchResults.length > 0 ? (
          <div className="search-results">
            <h2>
              {searchTerm || selectedCategory !== 'All Categories' 
                ? `Search Results (${searchResults.length})` 
                : `All Components (${searchResults.length})`}
            </h2>
            <div className="results-list">
              {searchResults.map(item => (
                <div 
                  key={item._id} 
                  className={`result-card ${expandedItems[item._id] ? 'expanded' : ''}`}
                >
                  <div 
                    className="result-card-header" 
                    onClick={() => toggleExpand(item._id)}
                  >
                    <div className="result-card-header-top">
                      <div className="result-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      
                      <div className="result-summary">
                        <h3>{item.name}</h3>
                        <div className="result-meta">
                          <div className="result-category">{item.category}</div>
                          <div className="result-rating">
                            <div className="rating-stars">
                              <FiStar className="star-filled" />
                              <span>{item.avgRating}</span>
                            </div>
                            <span className="review-count">({item.numReviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="result-card-header-bottom">
                      <div className="price-value">${item.lowestPrice}</div>
                      <div className="expand-toggle">
                        {expandedItems[item._id] ? 'Hide details' : 'Show details'} 
                        <FiChevronDown className={`expand-icon ${expandedItems[item._id] ? 'expanded' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="result-card-details">
                    <div className="details-container">
                      <div className="product-info">
                        <div className="result-specs">
                          {item.specs.map((spec, index) => (
                            <span key={index} className="spec-tag">{spec}</span>
                          ))}
                        </div>
                        
                        {/* Add best price here - will show on desktop, hide on mobile */}
                        <div className="best-price">
                          <div className="price-label">Best Price:</div>
                          <div className="price-value">${item.lowestPrice}</div>
                          <div className="price-retailer">
                            at {item.prices.find(p => p.price === item.lowestPrice)?.retailer}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pricing-details">
                        {/* Keep best price here too - will hide on desktop, show on mobile */}
                        <div className="best-price">
                          <div className="price-label">Best Price:</div>
                          <div className="price-value">${item.lowestPrice}</div>
                          <div className="price-retailer">
                            at {item.prices.find(p => p.price === item.lowestPrice)?.retailer}
                          </div>
                        </div>
                        
                        <div className="price-history">
                          <FiBarChart2 />
                          <span>Price trend: {item.priceHistory[0] > item.priceHistory[item.priceHistory.length - 1] ? 'Decreasing' : 'Increasing'}</span>
                        </div>
                        
                        <PricePrediction productId={item._id} />
                        
                        <div className="price-comparison">
                          <h4>Compare Prices:</h4>
                          <div className="retailer-prices">
                            {item.prices.map((price, idx) => (
                              <div 
                                key={idx} 
                                className={`retailer-price ${price.price === item.lowestPrice ? 'best' : ''}`}
                              >
                                <div className="retailer">{price.retailer}</div>
                                <div className="price">${price.price}</div>
                                <div className="stock-status">
                                  {price.inStock ? 'In Stock' : 'Out of Stock'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="result-actions">
                          <button 
                            className="pyro-button secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPriceHistory(item);
                            }}
                          >
                            <FiBarChart2 /> View Price History
                          </button>
                          <button 
                            className={`pyro-button ${isItemInCompare(item._id) ? 'primary' : 'outline'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCompare(item);
                            }}
                          >
                            {isItemInCompare(item._id) ? 'Remove from Compare' : 'Add to Compare'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="no-filtered-results">
            <h2>No products match your current filters</h2>
            <p>Try adjusting your search criteria or filters</p>
            <button 
              className="pyro-button primary"
              onClick={() => {
                // Reset filters and show all products
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setAppliedPriceRange([0, 2000]);
                setAppliedInStockOnly(false);
                setAppliedSortBy('lowest');
                setSearchResults(products);
              }}
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="loading-products">
            <h2>Loading products...</h2>
            <p>If nothing appears, there may be an issue connecting to the database</p>
          </div>
        )}
      </div>

      {priceHistoryModal && currentItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="price-history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Price History: {currentItem.name}</h2>
              <button className="close-modal" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <div className="price-chart">
                <div className="chart-container">
                  {/* A simple representation of the price history */}
                  <div className="chart-bars">
                    {currentItem.priceHistory.map((price, index) => (
                      <div 
                        key={index} 
                        className="chart-bar"
                        style={{ 
                          height: `${(price/Math.max(...currentItem.priceHistory))*100}%`,
                          backgroundColor: price === currentItem.lowestPrice ? 'var(--pyro-tertiary)' : 'var(--pyro-primary)'
                        }}
                      >
                        <span className="price-tip">${price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    <div className="date-labels">
                      {/* Mock dates - in a real app these would be actual timestamps */}
                      {['1 month ago', '3 weeks ago', '2 weeks ago', '1 week ago', 'Today'].map((date, index) => (
                        <span key={index} className="date-label">{date}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="price-stats">
                <div className="stat">
                  <span>Current Best Price:</span>
                  <strong>${currentItem.lowestPrice}</strong>
                </div>
                <div className="stat">
                  <span>Highest Price:</span>
                  <strong>${Math.max(...currentItem.priceHistory)}</strong>
                </div>
                <div className="stat">
                  <span>Lowest Price:</span>
                  <strong>${Math.min(...currentItem.priceHistory)}</strong>
                </div>
                <div className="stat">
                  <span>Price Trend:</span>
                  <strong className={currentItem.priceHistory[0] > currentItem.priceHistory[currentItem.priceHistory.length - 1] ? 'trend-down' : 'trend-up'}>
                    {currentItem.priceHistory[0] > currentItem.priceHistory[currentItem.priceHistory.length - 1] 
                      ? 'Decreasing ↓' 
                      : 'Increasing ↑'}
                  </strong>
                </div>
              </div>
              
              <div className="price-prediction-section">
                <PricePrediction productId={currentItem._id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;