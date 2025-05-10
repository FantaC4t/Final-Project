import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/pages/recommendations.css';
import Navigation from '../Navigation';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Try to fetch recommendations, fall back to mock data if it fails
        try {
          const response = await axios.get('/api/products/popular');
          setRecommendations(response.data);
        } catch (fetchError) {
          console.error('API error, using mock data instead', fetchError);
          // Use mock data as fallback
          setRecommendations([
            {
              _id: 'mock1',
              name: 'RTX 4070',
              image: '/assets/hardware/gpu.png',
              category: 'Graphics Cards',
              specs: ['12GB GDDR6X', '7680 CUDA Cores'],
              lowestPrice: 599.99
            },
            {
              _id: 'mock2',
              name: 'Ryzen 7 7800X3D',
              image: '/assets/hardware/cpu.png', 
              category: 'Processors',
              specs: ['8 Cores', '16 Threads'],
              lowestPrice: 449.99
            }
          ]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in recommendation component:', error);
        setError('Failed to load recommendations');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="recommendations-page">
      <div className="page-content">
        <h1>Recommended Products</h1>
        
        {loading ? (
          <div className="loading">Loading recommendations...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map(product => (
              <div key={product._id} className="product-card">
                <img 
                  src={product.image || `/assets/placeholder-${product.category?.toLowerCase() || 'component'}.png`} 
                  alt={product.name} 
                />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-specs">
                    {Array.isArray(product.specs) ? 
                      product.specs.slice(0, 2).map((spec, index) => (
                        <span key={index} className="spec-tag">{spec}</span>
                      ))
                      :
                      Object.entries(product.specs || {}).slice(0, 2).map(([key, value], index) => (
                        <span key={index} className="spec-tag">{key}: {value}</span>
                      ))
                    }
                  </div>
                  <p className="price">
                    ${product.lowestPrice || 
                      (product.prices && product.prices[0] && product.prices[0].price 
                        ? product.prices[0].price.toFixed(2) 
                        : 'N/A')}
                  </p>
                  <button className="view-details-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
