import React from 'react';

const YieldPrediction = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Crop Yield Prediction</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-300">
          This is the Crop Yield Prediction page. Here, you can input data like soil type,
          weather patterns, and historical crop data to get an estimated yield.
        </p>
        <div className="mt-4 p-4 bg-gray-700 rounded-md">
          {/* Placeholder for the input form */}
          <p className="text-center text-gray-400">Input Form Goes Here</p>
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;
