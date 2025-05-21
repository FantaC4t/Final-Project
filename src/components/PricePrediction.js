import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import '../styles/components/pricePrediction.css'; // Ensure this path is correct

const PricePrediction = ({ productId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading as true
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
      console.log(`Fetching prediction for product ID: ${productId}, days: ${days}`);
      const response = await fetch(`http://localhost:5000/api/ml/price-prediction/${productId}?days=${days}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setPrediction(data.prediction);
      } else {
        throw new Error(data.message || 'Prediction data not found or error in response.');
      }
    } catch (err) {
      console.error("Failed to fetch price prediction:", err);
      setError(err.message);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [productId, days]); // useCallback dependencies

  useEffect(() => {
    fetchPredictionData();
  }, [fetchPredictionData]); // Effect runs when fetchPredictionData changes (due to productId or days)

  const handleDaysChange = (e) => {
    setDays(parseInt(e.target.value, 10));
    // The useEffect above will trigger a refetch because 'days' is a dependency of fetchPredictionData
  };

  if (!productId) {
    // You might want to render nothing or a placeholder if no productId is given
    return null; 
  }

  if (loading) {
    return <div className="text-xs text-gray-500 p-2">Loading prediction...</div>;
  }

  if (error) {
    return (
      <div className="text-xs text-red-500 p-2">
        <FiAlertCircle className="inline mr-1" /> Error: {error}
        {/* Consider adding a simple retry mechanism if desired */}
        {/* <button onClick={fetchPredictionData} className="ml-2 text-xs underline">Retry</button> */}
      </div>
    );
  }
  
  if (prediction) {
    const currentPrice = parseFloat(prediction.currentPrice);
    const predictedPrice = parseFloat(prediction.predictedPrice);
    
    if (isNaN(currentPrice) || isNaN(predictedPrice)) {
        return <div className="text-xs text-red-500 p-2">Invalid price data.</div>;
    }

    const priceChange = predictedPrice - currentPrice;
    const percentChange = currentPrice !== 0 ? (priceChange / currentPrice) * 100 : 0;
    const isIncrease = priceChange >= 0; // Treat 0 change as neutral or slight increase visually

    return (
      <div className="price-prediction-display p-2 border-t border-gray-200 mt-2"> {/* Added some basic styling classes */}
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
          <span className="text-xs ml-1">(${priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}, {percentChange.toFixed(1)}%)</span>
        </div>
        {prediction.confidence && (
            <div className="text-xs text-gray-500 mt-0.5">
                Confidence: {(prediction.confidence * 100).toFixed(0)}% 
                {prediction.predictionType && ` (${prediction.predictionType})`}
            </div>
        )}
      </div>
    );
  }

  // Fallback if not loading, no error, but no prediction (e.g. API returned success:false without specific error message)
  return <div className="text-xs text-gray-500 p-2">No prediction data available.</div>;
};

export default PricePrediction;