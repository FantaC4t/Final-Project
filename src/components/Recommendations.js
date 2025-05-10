import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components/Recommendations.css';

const Recommendations = ({ userId, currentBuild }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Use popular products endpoint for now - will be replaced with real recommendations
        const response = await axios.get('/api/products/popular');
        
        setRecommendations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to load recommendations');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);
  
  const handleAddToBuild = (product) => {
    // Logic to add component to the build
    console.log('Adding to build:', product);
    // You can implement the actual functionality to add to the current build
  };

  if (loading) return <div className="loading-spinner">Loading recommendations...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (recommendations.length === 0) return null;

  return (
    <div className="recommendations-container">
      <h2>Recommended Components</h2>
      <div className="recommendations-grid">
        {recommendations.slice(0, 4).map(product => (
          <div key={product._id} className="recommendation-card">
            <img 
              src={product.image || `/assets/placeholder-${product.category?.toLowerCase() || 'component'}.png`} 
              alt={product.name} 
            />
            <div className="recommendation-details">
              <h3>{product.name}</h3>
              <div className="recommendation-specs">
                {Array.isArray(product.specs) ? 
                  product.specs.slice(0, 2).map((spec, index) => (
                    <span key={index}>{spec}</span>
                  ))
                  :
                  Object.entries(product.specs || {}).slice(0, 2).map(([key, value], index) => (
                    <span key={index}>{key}: {value}</span>
                  ))
                }
              </div>
              <div className="recommendation-price">
                ${product.lowestPrice || 
                   (product.prices && product.prices[0] && product.prices[0].price 
                     ? product.prices[0].price.toFixed(2) 
                     : 'N/A')}
              </div>
              <button 
                className="add-to-build-btn"
                onClick={() => handleAddToBuild(product)}
              >
                Add to Build
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
