import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSearch, FiFilter, FiShoppingCart, FiBarChart2, FiStar, 
  FiChevronDown, FiX, FiMonitor, FiCpu, FiServer, 
  FiHardDrive, FiGrid, FiBattery, FiBox, FiWind,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import axios from 'axios';
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
  const [isLoading, setIsLoading] = useState(true);

  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 2000]);
  const [appliedSortBy, setAppliedSortBy] = useState('lowest');
  const [appliedInStockOnly, setAppliedInStockOnly] = useState(false);

  const [isFilterClosing, setIsFilterClosing] = useState(false);

  const [products, setProducts] = useState([]);
  const [showCompareView, setShowCompareView] = useState(false); // New state for comparison view

  // Add useState for tracking expanded items
  const [expandedItems, setExpandedItems] = useState({});

  // Add toggle function to scroll to the expanded item
  const toggleExpand = (itemId) => {
    // Toggle the expanded state
    setExpandedItems(prev => ({ // Use functional update for safety
      ...prev,
      [itemId]: !prev[itemId]
    }));
    
    // If we're expanding the item, scroll to it after a short delay
    // to allow the DOM to update
    // Check the new state, not the old one (expandedItems[itemId] would be the old state here)
    if (!expandedItems[itemId]) { // This condition means it *was* false, so it's *now* true (expanding)
      setTimeout(() => {
        const element = document.getElementById(`result-card-${itemId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // 'nearest' or 'center' might be better
        }
      }, 100);
    }
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

  // Add this helper function to properly close filters
  const closeFilters = () => {
    setIsFilterClosing(true);
    setTimeout(() => {
      setShowFilters(false);
      setIsFilterClosing(false);
    }, 300); // Match animation duration
  };

  // Function to toggle an item in the compare list
  const toggleCompareItem = (product) => {
    setCompareItems(prevItems => {
      if (prevItems.find(item => item._id === product._id)) {
        return prevItems.filter(item => item._id !== product._id);
      } else if (prevItems.length < 4) { // Limit to comparing, e.g., 4 items
        return [...prevItems, product];
      }
      return prevItems; // If already 4 items, don't add more
    });
  };

  // Function to handle opening the compare view
  const handleOpenCompareView = () => {
    if (compareItems.length > 0) {
      setShowCompareView(true);
    }
  };

  // Function to handle closing the compare view
  const handleCloseCompareView = () => {
    setShowCompareView(false);
  };
  
  // Placeholder for fetching products - replace with your actual fetch logic
  useEffect(() => {
    // Simulating fetching products
    const fetchedProducts = [
      // Add mock product data here if you don't have backend integration yet
      // Example:
      // { _id: '1', name: 'NVIDIA GeForce RTX 4080', category: 'Graphics Cards', image: '/assets/hardware/graphicscards.png', specs: ['16GB GDDR6X', 'DLSS 3', 'Ray Tracing'], avgRating: 4.8, numReviews: 250, prices: [{ retailer: 'Amazon', price: 1199.99, inStock: true }], lowestPrice: 1199.99, brand: 'NVIDIA', popularity: 95, performanceTier: 'highend', useCases: ['4K Gaming', 'VR', 'Content Creation'], compatibility: { powerRequirement: 320, length: 304, recommendedPSU: 750 } },
      // { _id: '2', name: 'AMD Ryzen 9 7950X', category: 'Processors', image: '/assets/hardware/processors.png', specs: ['16 Cores / 32 Threads', '5.7 GHz Boost', 'AM5 Socket'], avgRating: 4.9, numReviews: 180, prices: [{ retailer: 'Newegg', price: 549.00, inStock: true }], lowestPrice: 549.00, brand: 'AMD', popularity: 92, performanceTier: 'highend', useCases: ['Gaming', 'Rendering', 'Multitasking'], compatibility: { socket: 'AM5', tdp: 170, compatibleChipsets: ['X670', 'B650'] } },
    ];
    setProducts(fetchedProducts);
    setSearchResults(fetchedProducts); // Initially show all products or based on default filters
  }, []);


  // Placeholder for search and filter logic
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered = filtered.filter(p => p.lowestPrice >= appliedPriceRange[0] && p.lowestPrice <= appliedPriceRange[1]);
    if (appliedInStockOnly) {
      filtered = filtered.filter(p => p.prices.some(priceInfo => priceInfo.inStock));
    }
    // Add sorting logic based on appliedSortBy
    if (appliedSortBy === 'lowest') {
        filtered.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (appliedSortBy === 'highest') {
        filtered.sort((a, b) => b.lowestPrice - a.lowestPrice);
    } else if (appliedSortBy === 'rating') {
        filtered.sort((a, b) => b.avgRating - a.avgRating);
    }


    setSearchResults(filtered);
  }, [searchTerm, selectedCategory, products, appliedPriceRange, appliedSortBy, appliedInStockOnly]);

  // Replace the visibleItemCount and allFilteredResults with pagination controls
  const [paginationSettings, setPaginationSettings] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1
  });
  
  // Function to change items per page
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPaginationSettings(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
    }));
  };
  
  // Function to change page
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationSettings.totalPages) return;
    setPaginationSettings(prev => ({
      ...prev,
      currentPage: newPage
    }));
    
    // Scroll to top when changing pages for better UX
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Modified filtering/pagination effect
  useEffect(() => {
    let filtered = products;

    // Apply all your existing filters
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered = filtered.filter(p => 
      typeof p.lowestPrice === 'number' && 
      p.lowestPrice >= appliedPriceRange[0] && 
      p.lowestPrice <= appliedPriceRange[1]
    );
    if (appliedInStockOnly) {
      filtered = filtered.filter(p => Array.isArray(p.prices) && p.prices.some(priceInfo => priceInfo.inStock));
    }
    
    // Apply sorting
    if (appliedSortBy === 'lowest') {
        filtered.sort((a, b) => (a.lowestPrice || Infinity) - (b.lowestPrice || Infinity));
    } else if (appliedSortBy === 'highest') {
        filtered.sort((a, b) => (b.lowestPrice || -Infinity) - (a.lowestPrice || -Infinity));
    } else if (appliedSortBy === 'rating') {
        filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    }

    // Update total count and pages
    const totalFilteredItems = filtered.length;
    const totalPages = Math.ceil(totalFilteredItems / paginationSettings.itemsPerPage);
    
    // Update pagination settings
    setPaginationSettings(prev => ({
      ...prev,
      totalItems: totalFilteredItems,
      totalPages: totalPages > 0 ? totalPages : 1,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));

    // Calculate start and end indices for the current page
    const startIndex = (paginationSettings.currentPage - 1) * paginationSettings.itemsPerPage;
    const endIndex = startIndex + paginationSettings.itemsPerPage;
    
    // Only set the items for the current page
    setSearchResults(filtered.slice(startIndex, endIndex));

  }, [
    searchTerm, 
    selectedCategory, 
    products, 
    appliedPriceRange, 
    appliedSortBy, 
    appliedInStockOnly, 
    paginationSettings.currentPage, 
    paginationSettings.itemsPerPage
  ]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Processors': return <FiCpu className="mr-2" />;
      case 'Graphics Cards': return <FiMonitor className="mr-2" />;
      case 'Motherboards': return <FiServer className="mr-2" />;
      case 'Memory': return <FiGrid className="mr-2" />; // Or a more specific RAM icon if available
      case 'Storage': return <FiHardDrive className="mr-2" />;
      case 'Power Supplies': return <FiBattery className="mr-2" />;
      case 'Cases': return <FiBox className="mr-2" />;
      case 'Cooling': return <FiWind className="mr-2" />;
      default: return <FiGrid className="mr-2" />;
    }
  };

  // Pagination UI component with styled controls
const PaginationControls = () => {
  const { currentPage, totalPages, itemsPerPage, totalItems } = paginationSettings;
  
  // Generate page numbers to display (show current page, and neighbors)
  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than our max, show all pages
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first page, last page, current page, and neighbors of current page
      const leftNeighbor = Math.max(1, currentPage - 1);
      const rightNeighbor = Math.min(totalPages, currentPage + 1);
      
      pages = [1]; // Always start with page 1
      
      if (leftNeighbor > 2) {
        pages.push('...'); // Ellipsis if there's a gap
      }
      
      // Add neighbors and current page if they're not already included
      for (let i = leftNeighbor; i <= rightNeighbor; i++) {
        if (i !== 1 && i !== totalPages) { // Avoid duplicates
          pages.push(i);
        }
      }
      
      if (rightNeighbor < totalPages - 1) {
        pages.push('...'); // Ellipsis if there's a gap
      }
      
      if (totalPages > 1) {
        pages.push(totalPages); // Always end with last page
      }
    }
    
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <div className="pagination-count">
          Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
        
        <div className="pagination-items-per-page">
          <label htmlFor="items-per-page">Items per page:</label>
          <select 
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="pagination-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      
      <div className="pagination-buttons">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`pagination-button ${currentPage === 1 ? 'pagination-button-disabled' : ''}`}
          aria-label="Previous page"
        >
          <FiChevronLeft size={18} />
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page)}
              className={`pagination-button ${page === currentPage ? 'pagination-button-active' : ''}`}
            >
              {page}
            </button>
          )
        ))}
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`pagination-button ${currentPage === totalPages ? 'pagination-button-disabled' : ''}`}
          aria-label="Next page"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Add this helper function near the top of your component or outside it
const truncateText = (text, maxLength = 20) => {
  if (!text) return 'Product';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
              <div className="filter-panel-header">
                <h2>Filter Options</h2>
                <button 
                  className="filter-panel-close"
                  onClick={closeFilters}
                  aria-label="Close filters"
                >
                  <FiX size={24} />
                </button>
              </div>

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
                  Reset
                </button>
                <button 
                  className="pyro-button primary"
                  onClick={() => {
                    handleApplyFilters();
                    closeFilters(); // Close panel after applying
                  }}
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
                  id={`result-card-${item._id}`}
                >
                  <div 
                    className="result-card-header" 
                    onClick={() => toggleExpand(item._id)}
                  >
                    <div className="result-card-header-top">
                      <div className="result-image">
                        <img src={item.image || `https://via.placeholder.com/300x200/777777/FFFFFF?text=${encodeURIComponent(truncateText(item.name, 15))}`} alt={item.name} />
                      </div>
                      
                      <div className="result-summary">
                        <h3 className="product-name">
                          {item.name || 'Unnamed Product'}
                        </h3>
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

        {/* Add Load More Button */}
        {paginationSettings.totalItems > 0 && <PaginationControls />}

        {/* Show a message when no products match filters */}
        {searchResults.length === 0 && products.length > 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-400">No products match your current filters.</p>
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

      {/* Comparison Modal/View */}
      {showCompareView && compareItems.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col"> {/* Increased max-width */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-indigo-400">Compare Products ({compareItems.length})</h2>
              <button onClick={handleCloseCompareView} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar spacing */}
              <div className={`grid grid-cols-1 md:grid-cols-${Math.min(compareItems.length, 4)} gap-4`}>
                {compareItems.map(item => (
                  <div key={item._id} className="bg-gray-700 p-4 rounded-lg shadow flex flex-col">
                    <img 
                      src={item.image || `https://via.placeholder.com/200x150/777777/FFFFFF?text=${encodeURIComponent(truncateText(item.name, 15))}`} 
                      alt={item.name} 
                      className="w-full h-40 object-contain rounded-md mb-3 bg-gray-600" // Added bg for placeholder
                    />
                    <h3 className="product-name">
                      {item.name || 'Unnamed Product'}
                    </h3>
                    <p className="text-sm text-gray-400 mb-1">{item.category}</p>
                    <p className="text-2xl font-bold text-green-400 mb-2">${item.lowestPrice?.toFixed(2)}</p>
                    
                    <div className="text-xs text-gray-300 space-y-1 mb-3 border-t border-gray-600 pt-2 mt-2">
                      <p><strong>Brand:</strong> {item.brand}</p>
                      <p><strong>Rating:</strong> {item.avgRating?.toFixed(1)} <FiStar className="inline text-yellow-400 mb-0.5"/> ({item.numReviews} reviews)</p>
                      <p><strong>Performance:</strong> <span className="capitalize">{item.performanceTier}</span></p>
                      <p><strong>Popularity:</strong> {item.popularity}%</p>
                    </div>

                    <div className="mb-3 border-t border-gray-600 pt-2">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-1">Key Specs:</h4>
                      <ul className="list-disc list-inside text-xs text-gray-300 space-y-0.5 max-h-24 overflow-y-auto">
                        {item.specs?.map((spec, index) => <li key={index}>{spec}</li>)}
                        {(!item.specs || item.specs.length === 0) && <li>No specs available.</li>}
                      </ul>
                    </div>
                    
                    <div className="mb-3 border-t border-gray-600 pt-2">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-1">Use Cases:</h4>
                      <ul className="list-disc list-inside text-xs text-gray-300 space-y-0.5">
                        {item.useCases?.map((useCase, index) => <li key={index}>{useCase}</li>)}
                        {(!item.useCases || item.useCases.length === 0) && <li>N/A</li>}
                      </ul>
                    </div>

                    {item.compatibility && Object.keys(item.compatibility).length > 0 && (
                      <div className="border-t border-gray-600 pt-2">
                        <h4 className="text-sm font-semibold text-indigo-400 mb-1">Compatibility:</h4>
                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-0.5">
                          {Object.entries(item.compatibility).map(([key, value]) => {
                            if (value === null || value === undefined || value === '') return null;
                            // Simple formatting for array values
                            const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                            // Add units or specific labels based on key
                            let formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            let unit = '';
                            if (key.toLowerCase().includes('tdp') || key.toLowerCase().includes('powerrequirement') || key.toLowerCase().includes('wattage') || key.toLowerCase().includes('recommendedpsu')) unit = 'W';
                            else if (key.toLowerCase().includes('length') || key.toLowerCase().includes('height') || key.toLowerCase().includes('maxgpulegnth') || key.toLowerCase().includes('maxcoolerheight')) unit = 'mm';
                            else if (key.toLowerCase().includes('capacity') && item.category === 'Storage') unit = 'GB'; // Assuming GB for storage
                            else if (key.toLowerCase().includes('speed') && item.category === 'Memory') unit = 'MHz';
                            else if (key.toLowerCase().includes('maxmemory') && item.category === 'Motherboards') unit = 'GB';


                            return <li key={key}><strong>{formattedKey}:</strong> {displayValue}{unit}</li>;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button 
                onClick={() => { setCompareItems([]); setShowCompareView(false); }}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
            >
                <FiX className="mr-2"/> Clear Comparison & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Compare;