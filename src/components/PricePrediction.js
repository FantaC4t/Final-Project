import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import '../styles/components/pricePrediction.css';

const PricePrediction = ({ productId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!productId) return;
    
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        console.log(`Fetching prediction for product ID: ${productId}`);
        
        // Use absolute URL
        const response = await fetch(`http://localhost:5000/api/ml/price-prediction/${productId}?days=${days}`);
        console.log('Response status:', response.status);
        
        // Debug the response content
        const responseText = await response.text();
        console.log('Raw prediction response:', responseText.substring(0, 100));
        
        // Try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          console.log("Prediction data:", data);
          setPrediction(data);
          setError(null);
        } catch (parseError) {
          console.error('Failed to parse prediction response as JSON:', parseError);
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching price prediction:', err);
        setError('Could not load price prediction');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrediction();
  }, [productId, days]);

  const handleDaysChange = (e) => {
    setDays(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div className="price-prediction-container loading">
        <div className="prediction-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing price data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="price-prediction-container error">
        <div className="prediction-error">
          <FiAlertCircle />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const priceChange = prediction.predictedPrice - prediction.currentPrice;
  const percentChange = (priceChange / prediction.currentPrice) * 100;
  const isIncrease = priceChange > 0;

  return (
    <div className="price-prediction-container">
      <h3>Price Prediction</h3>
      
      <div className="prediction-timeframe">
        <label htmlFor="prediction-days">Prediction timeframe:</label>
        <select 
          id="prediction-days" 
          value={days} 
          onChange={handleDaysChange}
          className="prediction-select"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
        </select>
      </div>
      
      <div className="prediction-result">
        <div className={`prediction-change ${isIncrease ? 'increase' : 'decrease'}`}>
          {isIncrease ? <FiTrendingUp /> : <FiTrendingDown />}
          <span className="prediction-percent">
            {isIncrease ? '+' : ''}{percentChange.toFixed(2)}%
          </span>
        </div>
        
        <div className="prediction-prices">
          <div className="price-current">
            <span className="price-label">Current</span>
            <span className="price-value">${prediction.currentPrice}</span>
          </div>
          <div className="price-arrow">→</div>
          <div className="price-predicted">
            <span className="price-label">Predicted</span>
            <span className="price-value">${prediction.predictedPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="prediction-confidence">
        <div className="confidence-bar">
          <div 
            className="confidence-level" 
            style={{width: `${prediction.confidence * 100}%`}}
          ></div>
        </div>
        <span className="confidence-text">
          {Math.round(prediction.confidence * 100)}% confidence
        </span>
      </div>
      
      <div className="prediction-note">
        <p>Based on historical data analysis and market trends</p>
      </div>
    </div>
  );
};

export default PricePrediction;