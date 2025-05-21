import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components/Recommendations.css'; // Path to your component-specific CSS

// Assuming you have a way to get userId (e.g., from context, props, or redux store)
// For this example, `userId` will be a prop.

const Recommendations = ({ userId, currentBuild }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      let response; // Declare response here
      let urlToFetch;
      let method = 'GET'; // Default method
      const requestBody = { wishlistProductIds: [] }; // Initialize requestBody

      try {
        let wishlistProductIds = [];
        try {
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            const parsedWishlist = JSON.parse(savedWishlist);
            if (Array.isArray(parsedWishlist)) {
              wishlistProductIds = parsedWishlist.map(item => item._id).filter(id => id);
            }
          }
        } catch (e) {
          console.error("Error reading wishlist from localStorage:", e);
        }
        
        requestBody.wishlistProductIds = wishlistProductIds; // Update requestBodys

        if (userId) { // Logged-in user
          urlToFetch = '/api/recommendations';
          method = 'POST';
          console.log('[Recommendations] Attempting to fetch:', method, urlToFetch, 'with body:', requestBody);
          response = await axios.post(urlToFetch, requestBody);
        } else { // Guest user
          if (wishlistProductIds.length > 0) {
            urlToFetch = '/api/recommendations/guest';
            method = 'POST';
            console.log('[Recommendations] Attempting to fetch:', method, urlToFetch, 'with body:', requestBody);
            response = await axios.post(urlToFetch, requestBody);
          } else {
            // Guest with no wishlist, fetch popular
            urlToFetch = '/api/recommendations/popular';
            method = 'GET';
            console.log('[Recommendations] Attempting to fetch:', method, urlToFetch);
            response = await axios.get(urlToFetch);
          }
        }
        setRecommendations(response.data || []);
      } catch (err) {
        console.error('[Recommendations] Error fetching recommendations. Config URL:', err.config?.url, 'Config Method:', err.config?.method, err);
        setError(err.response?.data?.message || 'Failed to load recommendations');
        
        // Attempt to load popular products as a fallback if the primary fetch failed
        // Check if the error was NOT for the popular endpoint already, to avoid infinite loops on error
        if (!err.config?.url?.includes('/api/recommendations/popular')) {
            try {
                const fallbackUrl = '/api/recommendations/popular';
                console.log('[Recommendations] Attempting to fetch fallback:', fallbackUrl);
                const popularResponse = await axios.get(fallbackUrl);
                setRecommendations(popularResponse.data || []);
                setError(null); // Clear previous error if fallback succeeds
            } catch (popularErr) {
                console.error('[Recommendations] Error fetching popular fallback. Config URL:', popularErr.config?.url, popularErr);
                setError('Failed to load recommendations, and fallback also failed.');
                setRecommendations([]); // Ensure recommendations are empty on complete failure
            }
        } else {
            console.error('[Recommendations] Fallback not attempted or failed for /popular, original error URL:', err.config?.url);
            setRecommendations([]); // Ensure recommendations are empty if popular itself failed
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]); // Re-fetch if userId changes (e.g., user logs in/out)

  const handleAddToBuild = (product) => {
    // Implement your logic to add the product to the current PC build
    console.log('Adding to build:', product);
    // This function would typically interact with a state management system or context
    // for the PC Builder page.
  };

  if (loading) return <div className="loading-spinner" style={{ padding: '2rem', textAlign: 'center' }}>Loading recommendations...</div>;
  if (error && recommendations.length === 0) return <div className="error-message" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!loading && recommendations.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No recommendations available at the moment.</div>;

  return (
    <div className="recommendations-container">
      <h2>{userId || (localStorage.getItem('wishlist') && JSON.parse(localStorage.getItem('wishlist')).length > 0) ? "Recommended For You" : "Popular Products"}</h2>
      <div className="recommendations-grid">
        {recommendations.slice(0, 4).map(product => ( // Displaying up to 4 recommendations
          <div key={product._id} className="recommendation-card">
            <img
              src={product.image || `/assets/placeholder-${product.category?.toLowerCase().replace(/\s+/g, '-') || 'component'}.png`}
              alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src=`/assets/placeholder-component.png`; }}
            />
            <div className="recommendation-details">
              <h3>{product.name}</h3>
              <div className="recommendation-specs">
                {product.specs && typeof product.specs === 'object' ?
                  (Array.isArray(product.specs) ?
                    product.specs.slice(0, 2).map((spec, index) => (
                      <span key={index}>{spec}</span>
                    )) :
                    Object.entries(product.specs).slice(0, 2).map(([key, value], index) => (
                      <span key={index}>{`${key}: ${value}`}</span>
                    ))
                  ) : (typeof product.specs === 'string' ? <span>{product.specs}</span> : null)
                }
              </div>
              <div className="recommendation-price">
                ${product.lowestPrice?.toFixed(2) || (product.prices && product.prices[0] ? product.prices[0].price.toFixed(2) : 'N/A')}
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
