import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import '../styles/components/pricePrediction.css'; // CSS import remains

const PricePrediction = ({ productId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const fetchPredictionData = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      setPrediction(null);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/ml/price-prediction/${productId}?days=${days}`);
      const data = await response.json().catch(() => {
        throw new Error(`HTTP error! status: ${response.status}. Server sent non-JSON response.`);
      });

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.prediction) {
        setPrediction(data.prediction);
      } else {
        throw new Error(data.message || 'Prediction data not found or error in response.');
      }
    } catch (err) {
      console.error("Failed to fetch price prediction:", err.message);
      setError(err.message);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [productId, days]);

  useEffect(() => {
    fetchPredictionData();
  }, [fetchPredictionData]);

  const handleDaysChange = (e) => {
    setDays(parseInt(e.target.value, 10));
  };

  if (!productId) {
    return null; 
  }

  if (loading) {
    // Using classes from pricePrediction.css for loading state
    return (
      <div className="prediction-loading">
        {/* You might want to add a spinner element if your CSS defines one for .loading-spinner */}
        {/* <div className="loading-spinner"></div> */}
        Loading prediction...
      </div>
    );
  }

  if (error) {
    // Basic error styling, can be enhanced with specific CSS classes if needed
    return (
      <div className="prediction-error p-2 text-red-500"> {/* Added a generic error class + Tailwind for color */}
        <FiAlertCircle className="inline mr-1" /> Error: {error}
      </div>
    );
  }
  
  if (prediction) {
    const currentPrice = parseFloat(prediction.currentPrice);
    const predictedPrice = parseFloat(prediction.predictedPrice);
    
    if (isNaN(currentPrice) || isNaN(predictedPrice)) {
        setError('Invalid price data received.');
        return (
             <div className="prediction-error p-2 text-red-500"> {/* Added a generic error class + Tailwind for color */}
                <FiAlertCircle className="inline mr-1" /> Error: Invalid price data.
             </div>
        );
    }

    const priceChange = predictedPrice - currentPrice;
    const percentChange = currentPrice !== 0 ? (priceChange / currentPrice) * 100 : 0;
    const isIncrease = priceChange >= 0;

    // Applying classes from pricePrediction.css
    return (
      <div className="price-prediction-container"> {/* Root container class */}
        {/* Timeframe selection */}
        <div className="prediction-timeframe">
            <label htmlFor={`prediction-days-${productId}`}>Prediction ({days} days):</label> {/* Added htmlFor for accessibility */}
            <select 
                id={`prediction-days-${productId}`} // Added id for label association
                value={days} 
                onChange={handleDaysChange} 
                className="prediction-select" // CSS class for select
                aria-label="Select prediction timeframe"
            >
              <option value="7">7D</option>
              <option value="30">30D</option>
              <option value="90">90D</option>
            </select>
        </div>

        {/* Prediction result display */}
        {/* The CSS has .prediction-result which might wrap .prediction-change and .prediction-prices separately.
            Here, we're adapting .prediction-change to display the main result.
            If you have a more complex structure in mind for current vs predicted, you'd add .prediction-prices here.
        */}
        <div className={`prediction-change ${isIncrease ? 'increase' : 'decrease'}`}>
          {isIncrease ? <FiTrendingUp className="mr-1"/> : <FiTrendingDown className="mr-1"/>}
          {/* The CSS might expect separate .price-value for the price itself */}
          <span className="price-value">${predictedPrice.toFixed(2)}</span>
          <span className="text-xs ml-1"> {/* This part might need its own class or be part of .prediction-change styling */}
            ({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}, {percentChange.toFixed(1)}%)
          </span>
        </div>
        
        {/* Confidence display */}
        {prediction.confidence != null && (
            <div className="prediction-confidence">
                {/* The CSS has .confidence-bar and .confidence-level. 
                    This implementation just shows text. If you want a bar,
                    you'd need to add JSX for those elements.
                */}
                <span className="confidence-text"> {/* Added .confidence-text class */}
                    Confidence: {(prediction.confidence * 100).toFixed(0)}% 
                    {prediction.method && ` (${prediction.method})`}
                </span>
            </div>
        )}
        {/* If there's a prediction note in your CSS, you can add it here */}
        {/* <p className="prediction-note">Predictions are not financial advice.</p> */}
      </div>
    );
  }

  // Fallback for no prediction data
  return <div className="prediction-note p-2">No prediction data available.</div>; {/* Used .prediction-note as a generic class */}
};

export default PricePrediction;