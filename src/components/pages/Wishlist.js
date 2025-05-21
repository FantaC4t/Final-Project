import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingCart, FiArrowRight, FiEdit, FiCheck, FiExternalLink } from 'react-icons/fi';
import '../../styles/pages/wishlist.css';

const Wishlist = () => {
  // Get wishlist from localStorage with better error handling
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      // Log for debugging
      console.log('Retrieved wishlist from localStorage:', savedWishlist);
      
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        
        // Verify we have a valid array
        if (Array.isArray(parsedWishlist)) {
          return parsedWishlist;
        } else {
          console.warn('Wishlist in localStorage is not an array:', parsedWishlist);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  });
  
  const [configurations, setConfigurations] = useState(() => {
    try {
      const savedConfigs = localStorage.getItem('configurations');
      if (savedConfigs) {
        return JSON.parse(savedConfigs);
      }
      return [{ id: 'default', name: 'My Build', items: [] }];
    } catch (error) {
      console.error('Error loading configurations from localStorage:', error);
      return [{ id: 'default', name: 'My Build', items: [] }];
    }
  });
  
  const [activeConfig, setActiveConfig] = useState('default');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      // Ensure wishlistItems is an array before saving
      if (!Array.isArray(wishlistItems)) {
        console.error('Attempted to save non-array wishlist:', wishlistItems);
        return;
      }
      
      // Only save if there are items or we explicitly want to clear it
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      console.log('Saved wishlist to localStorage:', wishlistItems);
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems]);
  
  // Save configurations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('configurations', JSON.stringify(configurations));
    } catch (error) {
      console.error('Error saving configurations to localStorage:', error);
    }
  }, [configurations]);

  // Remove item from wishlist
  const removeItem = (id) => {
    console.log('Removing item with ID:', id);
    setWishlistItems(prev => {
      const newWishlist = prev.filter(item => item._id !== id);
      console.log('New wishlist after removal:', newWishlist);
      return newWishlist;
    });
    
    // Also remove from any configurations
    setConfigurations(prev => 
      prev.map(config => ({
        ...config,
        items: config.items.filter(itemId => itemId !== id)
      }))
    );
  };

  // Add item to configuration
  const toggleItemInConfiguration = (configId, itemId) => {
    setConfigurations(prev => 
      prev.map(config => {
        if (config.id === configId) {
          // Check if item is already in this config
          const isInConfig = config.items.includes(itemId);
          
          return {
            ...config,
            items: isInConfig 
              ? config.items.filter(id => id !== itemId) // Remove if already there
              : [...config.items, itemId]                // Add if not there
          };
        }
        return config;
      })
    );
  };

  // Create a new configuration
  const addNewConfiguration = () => {
    const newId = `config-${Date.now()}`;
    setConfigurations(prev => [
      ...prev, 
      { id: newId, name: `Configuration ${prev.length + 1}`, items: [] }
    ]);
    setActiveConfig(newId);
  };

  // Delete a configuration
  const deleteConfiguration = (configId) => {
    if (configurations.length <= 1) {
      // Don't delete the last configuration
      alert("You need at least one configuration.");
      return;
    }
    
    setConfigurations(prev => prev.filter(config => config.id !== configId));
    
    // If the active config was deleted, set active to the first available
    if (activeConfig === configId) {
      setActiveConfig(configurations.find(c => c.id !== configId)?.id || 'default');
    }
  };

  // Start editing configuration name
  const startEditingName = (configId, currentName) => {
    setIsEditingName(true);
    setNewConfigName(currentName);
    setActiveConfig(configId);
  };

  // Save the edited configuration name
  const saveConfigName = () => {
    if (newConfigName.trim()) {
      setConfigurations(prev => 
        prev.map(config => 
          config.id === activeConfig 
            ? { ...config, name: newConfigName.trim() } 
            : config
        )
      );
    }
    setIsEditingName(false);
  };

  // Calculate total price of a configuration
  const calculateConfigTotal = (configId) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return 0;
    
    return config.items.reduce((total, itemId) => {
      const item = wishlistItems.find(i => i._id === itemId);
      return total + (item?.lowestPrice || 0);
    }, 0);
  };

  // Function to truncate text (since this might be used in image placeholders)
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  // Group wishlist items by category
  const itemsByCategory = wishlistItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get current configuration
  const currentConfig = configurations.find(c => c.id === activeConfig) || configurations[0];

  // This is a helper to manually add an item for debugging
  const addDebugItem = () => {
    const debugItem = {
      _id: `debug-${Date.now()}`,
      name: `Debug Item ${wishlistItems.length + 1}`,
      category: 'Debug',
      lowestPrice: 99.99
    };
    setWishlistItems(prev => [...prev, debugItem]);
  };

  return (
    <div className="pyro-page wishlist-page">
      <div className="page-header">
        <h1>My Wishlist {wishlistItems.length > 0 ? `(${wishlistItems.length})` : ''}</h1>
        <div className="header-actions">
          <button 
            className="pyro-button secondary" 
            onClick={addDebugItem}
            style={{ marginRight: '10px' }}
          >
            Add Debug Item
          </button>
          <Link to="/compare" className="pyro-button outline">
            <FiArrowRight className="mr-2" /> Continue Shopping
          </Link>
        </div>
      </div>
      
      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-wishlist-message">
            <h2>Your wishlist is empty</h2>
            <p>Add products to your wishlist to save them for later or create a PC build configuration.</p>
            <Link to="/compare" className="pyro-button primary">
              Explore Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="wishlist-container">
          {/* Configurations panel */}
          <div className="configurations-panel">
            <div className="configurations-header">
              <h2>My Configurations</h2>
              <button 
                className="add-config-btn" 
                onClick={addNewConfiguration}
              >
                + New Configuration
              </button>
            </div>
            
            <div className="configurations-list">
              {configurations.map(config => (
                <div 
                  key={config.id} 
                  className={`configuration-item ${activeConfig === config.id ? 'active' : ''}`}
                  onClick={() => setActiveConfig(config.id)}
                >
                  <div className="config-details">
                    {isEditingName && activeConfig === config.id ? (
                      <div className="config-name-edit">
                        <input
                          type="text"
                          value={newConfigName}
                          onChange={(e) => setNewConfigName(e.target.value)}
                          autoFocus
                          onBlur={saveConfigName}
                          onKeyPress={(e) => e.key === 'Enter' && saveConfigName()}
                        />
                        <button onClick={saveConfigName}>
                          <FiCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="config-name" onClick={() => startEditingName(config.id, config.name)}>
                        {config.name} <FiEdit className="edit-icon" />
                      </div>
                    )}
                    <div className="config-meta">
                      <span>{config.items.length} items</span>
                      <span>${calculateConfigTotal(config.id).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {configurations.length > 1 && (
                    <button 
                      className="delete-config" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConfiguration(config.id);
                      }}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wishlist items */}
          <div className="wishlist-items-container">
            <div className="active-config-header">
              <h2>
                {currentConfig?.name || 'My Build'} 
                <span className="config-total">
                  Total: ${calculateConfigTotal(activeConfig).toFixed(2)}
                </span>
              </h2>
            </div>
            
            {Object.entries(itemsByCategory).length > 0 ? (
              Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="wishlist-category">
                  <h3>{category}</h3>
                  <div className="wishlist-grid">
                    {items.map(item => {
                      const isInActiveConfig = currentConfig?.items.includes(item._id);
                      
                      return (
                        <div key={item._id} className="wishlist-card">
                          <div className="wishlist-card-header">
                            <div className="wishlist-category-badge">{item.category}</div>
                            <button 
                              className="remove-wishlist-item" 
                              onClick={() => removeItem(item._id)}
                            >
                              <FiX />
                            </button>
                          </div>
                          
                          <div className="wishlist-card-image">
                            <img 
                              src={item.image || `https://via.placeholder.com/200x150/777777/FFFFFF?text=${encodeURIComponent(truncateText(item.name, 15))}`} 
                              alt={item.name} 
                            />
                          </div>
                          
                          <div className="wishlist-card-content">
                            <h4 className="wishlist-item-name">{item.name}</h4>
                            <div className="wishlist-item-price">${item.lowestPrice}</div>
                            
                            <div className="wishlist-item-actions">
                              <button 
                                className={`add-to-config ${isInActiveConfig ? 'in-config' : ''}`}
                                onClick={() => toggleItemInConfiguration(activeConfig, item._id)}
                              >
                                {isInActiveConfig ? 
                                  'Remove from Configuration' : 
                                  'Add to Configuration'
                                }
                              </button>
                              
                              <a 
                                href={item.buyUrl || '#'} 
                                className="wishlist-buy-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FiExternalLink /> Buy
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items-message">
                <p>There are no items in your wishlist yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
