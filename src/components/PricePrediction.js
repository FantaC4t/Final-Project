import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import '../styles/components/pricePrediction.css'; // Make sure this CSS file exists and path is correct

const PricePrediction = ({ productId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const fetchPredictionData = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      setPrediction(null);
      setError(null); // Clear previous errors if productId becomes null
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // console.log(`Fetching prediction for product ID: ${productId}, days: ${days}`); // Already present, good for debugging
      const response = await fetch(`http://localhost:5000/api/ml/price-prediction/${productId}?days=${days}`);
      
      // Try to parse JSON regardless of response.ok to get error messages from backend
      const data = await response.json().catch(() => {
        // If .json() fails (e.g. non-JSON response for a network error or severe server issue)
        throw new Error(`HTTP error! status: ${response.status}. Server sent non-JSON response.`);
      });

      if (!response.ok) {
        // Use message from backend JSON if available, otherwise use status
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // At this point, response.ok is true
      if (data.success && data.prediction) {
        setPrediction(data.prediction);
      } else {
        // Handle cases where response.ok is true, but backend indicates failure (e.g. success:false)
        throw new Error(data.message || 'Prediction data not found or error in response.');
      }
    } catch (err) {
      console.error("Failed to fetch price prediction:", err.message); // Log only err.message for cleaner console
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
    return <div className="text-xs text-gray-500 p-2">Loading prediction...</div>;
  }

  if (error) {
    return (
      <div className="text-xs text-red-500 p-2">
        <FiAlertCircle className="inline mr-1" /> Error: {error}
        {/* <button onClick={fetchPredictionData} className="ml-2 text-xs underline">Retry</button> */}
      </div>
    );
  }
  
  if (prediction) {
    const currentPrice = parseFloat(prediction.currentPrice);
    const predictedPrice = parseFloat(prediction.predictedPrice);
    
    if (isNaN(currentPrice) || isNaN(predictedPrice)) {
        setError('Invalid price data received.'); // Set error state
        return ( // Render error message
             <div className="text-xs text-red-500 p-2">
                <FiAlertCircle className="inline mr-1" /> Error: Invalid price data.
             </div>
        );
    }

    const priceChange = predictedPrice - currentPrice;
    const percentChange = currentPrice !== 0 ? (priceChange / currentPrice) * 100 : 0;
    const isIncrease = priceChange >= 0;

    return (
      <div className="price-prediction-display p-2 border-t border-gray-200 mt-2">
        <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-gray-600">Prediction ({days} days):</span>
            <select 
                value={days} 
                onChange={handleDaysChange} 
                className="text-xs border rounded p-0.5 bg-gray-50"
                aria-label="Select prediction timeframe"
            >
              <option value="7">7D</option>
              <option value="30">30D</option>
              <option value="90">90D</option>
            </select>
        </div>
        <div className={`text-sm font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
          {isIncrease ? <FiTrendingUp className="inline mr-1"/> : <FiTrendingDown className="inline mr-1"/>}
          ${predictedPrice.toFixed(2)}
          <span className="text-xs ml-1">({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}, {percentChange.toFixed(1)}%)</span>
        </div>
        {prediction.confidence != null && ( // Check for null or undefined
            <div className="text-xs text-gray-500 mt-0.5">
                Confidence: {(prediction.confidence * 100).toFixed(0)}% 
                {prediction.method && ` (${prediction.method})`} {/* Changed from predictionType to method */}
            </div>
        )}
      </div>
    );
  }

  return <div className="text-xs text-gray-500 p-2">No prediction data available.</div>;
};

export default PricePrediction;