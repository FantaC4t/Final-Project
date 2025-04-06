import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiShoppingCart, FiBarChart2, FiStar, FiChevronDown, FiX } from 'react-icons/fi';

// Mock data for demonstration
const mockRetailers = ['Amazon', 'Newegg', 'Best Buy', 'Micro Center', 'B&H Photo'];
const mockCategories = ['Graphics Cards', 'Processors', 'Memory', 'Storage', 'Motherboards', 'Power Supplies', 'Cases', 'Cooling'];

// Mock search results with local image paths
const mockResults = [
  {
    id: 1,
    name: 'NVIDIA RTX 4070 Ti',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['12GB GDDR6X', '7680 CUDA Cores', '2.6 GHz'],
    avgRating: 4.7,
    numReviews: 324,
    prices: [
      { retailer: 'Amazon', price: 799.99, inStock: true },
      { retailer: 'Newegg', price: 789.99, inStock: true },
      { retailer: 'Best Buy', price: 819.99, inStock: false },
      { retailer: 'Micro Center', price: 779.99, inStock: true },
    ],
    lowestPrice: 779.99,
    priceHistory: [800, 820, 810, 790, 780]
  },
  {
    id: 2,
    name: 'AMD Radeon RX 7900 XTX',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['24GB GDDR6', '12288 Stream Processors', '2.5 GHz'],
    avgRating: 4.5,
    numReviews: 256,
    prices: [
      { retailer: 'Amazon', price: 929.99, inStock: true },
      { retailer: 'Newegg', price: 949.99, inStock: true },
      { retailer: 'Best Buy', price: 969.99, inStock: true },
      { retailer: 'B&H Photo', price: 939.99, inStock: false },
    ],
    lowestPrice: 929.99,
    priceHistory: [1000, 980, 950, 940, 930]
  },
  {
    id: 3,
    name: 'Intel Core i9-14900K',
    image: '/assets/hardware/cpu.png', // Assuming you have a CPU image
    category: 'Processors',
    specs: ['24 Cores (8P+16E)', '5.8 GHz Max Turbo', 'DDR5-5600'],
    avgRating: 4.8,
    numReviews: 189,
    prices: [
      { retailer: 'Amazon', price: 569.99, inStock: true },
      { retailer: 'Newegg', price: 549.99, inStock: true },
      { retailer: 'Best Buy', price: 589.99, inStock: true },
      { retailer: 'Micro Center', price: 529.99, inStock: true },
    ],
    lowestPrice: 529.99,
    priceHistory: [600, 590, 575, 560, 530]
  }
];

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

  // Simulate search functionality
  useEffect(() => {
    if (searchTerm) {
      // In a real app, this would be an API call
      const filteredResults = mockResults.filter(
        item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger the API call
    // For this demo, the useEffect handles the filtering
    console.log('Searching for:', searchTerm);
  };

  const handleAddToCompare = (item) => {
    if (compareItems.find(i => i.id === item.id)) {
      setCompareItems(compareItems.filter(i => i.id !== item.id));
    } else {
      setCompareItems([...compareItems, item]);
    }
  };

  const isItemInCompare = (itemId) => {
    return compareItems.some(item => item.id === itemId);
  };

  const handleViewPriceHistory = (item) => {
    setCurrentItem(item);
    setPriceHistoryModal(true);
  };

  const closeModal = () => {
    setPriceHistoryModal(false);
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
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter /> Filters
              </button>
            </div>
          </form>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-section">
                <h3>Price Range</h3>
                <div className="price-slider">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="price-range-display">
                    ${priceRange[0]} - ${priceRange[1]}
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <h3>Sort By</h3>
                <div className="radio-group">
                  <label className="radio-container">
                    <input 
                      type="radio" 
                      name="sortBy" 
                      value="lowest" 
                      checked={sortBy === 'lowest'}
                      onChange={() => setSortBy('lowest')}
                    />
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
                <button className="pyro-button secondary">Reset Filters</button>
                <button className="pyro-button primary">Apply Filters</button>
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
                <div key={item.id} className="comparison-item">
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

        {/* Search results */}
        {searchResults.length > 0 ? (
          <div className="search-results">
            <h2>Search Results ({searchResults.length})</h2>
            <div className="results-list">
              {searchResults.map(item => (
                <div key={item.id} className="result-card">
                  <div className="result-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="result-details">
                    <h3>{item.name}</h3>
                    <div className="result-category">{item.category}</div>
                    
                    <div className="result-specs">
                      {item.specs.map((spec, index) => (
                        <span key={index} className="spec-tag">{spec}</span>
                      ))}
                    </div>
                    
                    <div className="result-rating">
                      <div className="rating-stars">
                        <FiStar className="star-filled" />
                        <span>{item.avgRating}</span>
                      </div>
                      <span className="review-count">({item.numReviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="result-pricing">
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
                        onClick={() => handleViewPriceHistory(item)}
                      >
                        <FiBarChart2 /> View Price History
                      </button>
                      <button 
                        className={`pyro-button ${isItemInCompare(item.id) ? 'primary' : 'outline'}`}
                        onClick={() => handleAddToCompare(item)}
                      >
                        {isItemInCompare(item.id) ? 'Remove from Compare' : 'Add to Compare'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          <div className="no-results">
            <h2>No results found for "{searchTerm}"</h2>
            <p>Try different keywords or browse categories</p>
          </div>
        ) : (
          <div className="search-suggestions">
            <h2>Popular Components</h2>
            <div className="suggestion-categories">
              {mockCategories.map(category => (
                <div 
                  key={category} 
                  className="suggestion-category"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm(category);
                  }}
                >
                  <div className="category-icon">
                    {/* This would ideally be specific icons for each category */}
                    {category === 'Graphics Cards' && <FiBarChart2 />}
                    {category === 'Processors' && <FiBarChart2 />}
                    {category !== 'Graphics Cards' && category !== 'Processors' && <FiBarChart2 />}
                  </div>
                  <div className="category-name">{category}</div>
                </div>
              ))}
            </div>
            
            <h2>Popular Searches</h2>
            <div className="popular-searches">
              <button onClick={() => setSearchTerm('RTX 4080')}>NVIDIA RTX 4080</button>
              <button onClick={() => setSearchTerm('Ryzen 7900X')}>AMD Ryzen 9 7900X</button>
              <button onClick={() => setSearchTerm('DDR5 Memory')}>DDR5 Memory</button>
              <button onClick={() => setSearchTerm('SSD NVMe')}>NVMe SSDs</button>
              <button onClick={() => setSearchTerm('Gaming Motherboard')}>Gaming Motherboards</button>
            </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;