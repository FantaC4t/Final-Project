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
  // const [allFetchedProducts, setAllFetchedProducts] = useState([]); // We might not need this if we always fetch per page
  const [products, setProducts] = useState([]); // This will hold the products for the current page/filters
  const [searchResults, setSearchResults] = useState([]); // This will be the same as products or a subset if further client-side manipulation is needed (but ideally not for primary filtering)
  
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterClosing, setIsFilterClosing] = useState(false); // For filter panel animation

  // States for PENDING filter values (what user selects in UI)
  const [pendingPriceRange, setPendingPriceRange] = useState([0, 2000]);
  const [pendingSortBy, setPendingSortBy] = useState('lowest');
  const [pendingInStockOnly, setPendingInStockOnly] = useState(false);

  // States for APPLIED filter values (what's actually sent to backend)
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 2000]);
  const [appliedSortBy, setAppliedSortBy] = useState('lowest');
  const [appliedInStockOnly, setAppliedInStockOnly] = useState(false);
  
  const [compareItems, setCompareItems] = useState([]);
  const [showCompareView, setShowCompareView] = useState(false); // For the comparison modal
  const [priceHistoryModal, setPriceHistoryModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true); // For initial load and filter changes
  // const [isLoadingMore, setIsLoadingMore] = useState(false); // isLoading should cover this

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20, // Default items per page, can be changed by user
    totalItems: 0,
    totalPages: 1,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Main data fetching effect - relies on backend for filtering and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy: appliedSortBy, // Use applied sort by
      });

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedCategory && selectedCategory !== 'All Categories') params.append('category', selectedCategory);
      
      // Use applied price range and in-stock status
      params.append('minPrice', appliedPriceRange[0].toString());
      params.append('maxPrice', appliedPriceRange[1].toString());
      if (appliedInStockOnly) params.append('inStock', 'true');

      try {
        const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setSearchResults(data.products); // Directly use fetched products
          setPagination(prev => ({
            ...prev,
            totalItems: data.totalItems,
            totalPages: data.totalPages,
            // currentPage is already set or updated by handlePageChange/filter apply
          }));
        } else {
          console.error("Failed to fetch products:", data.message);
          setProducts([]);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    debouncedSearchTerm, 
    selectedCategory, 
    appliedPriceRange, // Use applied filters as dependencies
    appliedSortBy, 
    appliedInStockOnly
  ]);

  // Effect to reset to page 1 when APPLIED filters change (excluding pagination itself)
  // This might be redundant if handleApplyFilters already resets the page.
  // Consider if debouncedSearchTerm or selectedCategory should also reset page immediately or wait for "Apply"
  useEffect(() => {
    // If search term or category changes directly (not through "Apply Filters" button), reset page
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearchTerm, selectedCategory]);


  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };
  
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  }

  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    if (!expandedItems[itemId]) {
      setTimeout(() => {
        const element = document.getElementById(`result-card-${itemId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  // REMOVE the old client-side filterResults function
  // const filterResults = (...) => { ... };

  // REMOVE the old useEffect that called filterResults
  // useEffect(() => {
  //   setSearchResults(filterResults(appliedPriceRange, appliedSortBy, appliedInStockOnly));
  // }, [searchTerm, selectedCategory, appliedPriceRange, appliedSortBy, appliedInStockOnly]);

  // REMOVE the old useEffect that fetched ALL products initially (around line 200 in your full file)
  // useEffect(() => {
  //   const fetchProducts = async () => { ... };
  //   fetchProducts();
  // }, []);

  // REMOVE the old useEffect that logged searchResults[0] (around line 218)
  // useEffect(() => { ... }, [searchResults]);


  const handleSearch = (e) => {
    e.preventDefault();
    // The main useEffect will trigger a refetch due to debouncedSearchTerm changing.
    // We also need to ensure that if the user clicks "Search", it applies immediately
    // and resets to page 1.
    setPagination(prev => ({ ...prev, currentPage: 1 })); 
    // The main useEffect will pick up debouncedSearchTerm.
  };

  const handleAddToCompare = (item) => {
    setCompareItems(prevItems => {
      if (prevItems.find(i => i._id === item._id)) {
        return prevItems.filter(i => i._id !== item._id);
      } else if (prevItems.length < 4) { // Limit to 4 items
        return [...prevItems, item];
      }
      return prevItems;
    });
  };

  const isItemInCompare = (itemId) => {
    return compareItems.some(item => item._id === itemId);
  };

  const handleViewPriceHistory = (item) => {
    setCurrentItem(item);
    setPriceHistoryModal(true);
  };

  const closeModal = () => {
    setPriceHistoryModal(false);
  };

  const handleApplyFilters = () => {
    setAppliedPriceRange(pendingPriceRange);
    setAppliedSortBy(pendingSortBy);
    setAppliedInStockOnly(pendingInStockOnly);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 when applying new filters
    closeFilters(); // Close panel after applying
  };

  const handleResetFilters = () => {
    // Reset pending filters in UI
    setPendingPriceRange([0, 2000]);
    setPendingSortBy('lowest');
    setPendingInStockOnly(false);
    
    // Reset applied filters to trigger refetch with defaults
    setAppliedPriceRange([0, 2000]);
    setAppliedSortBy('lowest');
    setAppliedInStockOnly(false);
    // Also reset search term and category if desired
    setSearchTerm('');
    setSelectedCategory('All Categories');

    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const toggleFilters = () => {
    if (showFilters) {
      setIsFilterClosing(true);
      setTimeout(() => {
        setShowFilters(false);
        setIsFilterClosing(false);
      }, 300); 
    } else {
      // When opening filters, sync pending states with currently applied ones
      setPendingPriceRange(appliedPriceRange);
      setPendingSortBy(appliedSortBy);
      setPendingInStockOnly(appliedInStockOnly);
      setShowFilters(true);
    }
  };

  const closeFilters = () => {
    setIsFilterClosing(true);
    setTimeout(() => {
      setShowFilters(false);
      setIsFilterClosing(false);
    }, 300);
  };

  const toggleCompareItem = (product) => { // This seems to be a duplicate of handleAddToCompare
    handleAddToCompare(product); // Reuse existing logic
  };

  const handleOpenCompareView = () => {
    if (compareItems.length > 0) {
      setShowCompareView(true);
    }
  };

  const handleCloseCompareView = () => {
    setShowCompareView(false);
  };
  
  // REMOVE the old placeholder useEffect for fetching products (around line 288)
  // useEffect(() => { ... setProducts(fetchedProducts); ... }, []);

  // REMOVE the old client-side filtering useEffect (around line 300)
  // useEffect(() => { ... setSearchResults(filtered); ... }, [searchTerm, ...]);

  // REMOVE the old paginationSettings state and its related useEffect (around line 397)
  // const [paginationSettings, setPaginationSettings] = useState({ ... });
  // const handleItemsPerPageChange = (e) => { ... setPaginationSettings(...); };
  // useEffect(() => { ... client side filtering and pagination ... }, [..., paginationSettings.currentPage, paginationSettings.itemsPerPage]);

  // NEW: Handler for itemsPerPage change using the new `pagination` state
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page
    }));
  };


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
  // Use the new `pagination` state
  const { currentPage, totalPages, itemsPerPage, totalItems } = pagination; 
  
  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (startPage > 1) {
      pages.unshift('...');
      pages.unshift(1);
    }
    if (endPage < totalPages) {
      pages.push('...');
      pages.push(totalPages);
    }
    return pages.filter((item, index) => pages.indexOf(item) === index); // Remove duplicates if any
  };

  if (totalItems === 0) return null; // Don't show pagination if no items

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
            onChange={handleItemsPerPageChange} // Ensure this uses the new handler
            className="pagination-select"
            disabled={isLoading}
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
          disabled={currentPage === 1 || isLoading}
          className={`pagination-button ${currentPage === 1 || isLoading ? 'pagination-button-disabled' : ''}`}
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
              disabled={isLoading}
              className={`pagination-button ${page === currentPage ? 'pagination-button-active' : ''} ${isLoading ? 'pagination-button-disabled' : ''}`}
            >
              {page}
            </button>
          )
        ))}
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`pagination-button ${currentPage === totalPages || isLoading ? 'pagination-button-disabled' : ''}`}
          aria-label="Next page"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
// ... (rest of your component, including the return statement)
// Ensure all filter UI elements (price slider, sort by radio, in-stock checkbox)
// update the PENDING state variables (e.g., `pendingPriceRange`, `pendingSortBy`, `pendingInStockOnly`)
// And the "Apply Filters" button calls `handleApplyFilters`.
// For example, in your price slider:
// value={pendingPriceRange[0]}
// onChange={(e) => {
//   const newMin = parseInt(e.target.value);
//   setPendingPriceRange([Math.min(newMin, pendingPriceRange[1] - 50), pendingPriceRange[1]]);
// }}
// And for sort by:
// checked={pendingSortBy === 'lowest'} onChange={() => setPendingSortBy('lowest')}

// In your return JSX, make sure you are using `searchResults` to map and display products.
// And the loading states `isLoading` to show loading indicators.
// ...existing code...

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
                    '--left-percent': `${(pendingPriceRange[0]/2000)*100}%`,
                    '--right-percent': `${100 - (pendingPriceRange[1]/2000)*100}%` 
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={pendingPriceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      // Ensure minimum doesn't exceed maximum
                      setPendingPriceRange([Math.min(newMin, pendingPriceRange[1] - 50), pendingPriceRange[1]]);
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={pendingPriceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      // Ensure maximum isn't less than minimum
                      setPendingPriceRange([pendingPriceRange[0], Math.max(newMax, pendingPriceRange[0] + 50)]);
                    }}
                  />
                </div>
                <div className="price-range-display">
                  ${pendingPriceRange[0]} - ${pendingPriceRange[1]}
                </div>
              </div>

              <div className="filter-section">
                <h3>Sort By</h3>
                <div className="radio-group">
                  <label className="radio-container">
                    <input type="radio" name="sortBy" value="lowest" checked={pendingSortBy === 'lowest'} onChange={() => setPendingSortBy('lowest')} />
                    <span className="radio-mark"></span>
                    Lowest Price
                  </label>
                  <label className="radio-container">
                    <input 
                      type="radio" 
                      name="sortBy" 
                      value="highest" 
                      checked={pendingSortBy === 'highest'}
                      onChange={() => setPendingSortBy('highest')}
                    />
                    <span className="radio-mark"></span>
                    Highest Price
                  </label>
                  <label className="radio-container">
                    <input 
                      type="radio" 
                      name="sortBy" 
                      value="rating" 
                      checked={pendingSortBy === 'rating'}
                      onChange={() => setPendingSortBy('rating')}
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
                    checked={pendingInStockOnly}
                    onChange={() => setPendingInStockOnly(!pendingInStockOnly)}
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
        {pagination.totalItems > 0 && <PaginationControls />}

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