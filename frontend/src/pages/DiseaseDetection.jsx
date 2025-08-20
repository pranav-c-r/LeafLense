import React from 'react';

const DiseaseDetection = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Crop Disease Detection</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-300">
          This is the Crop Disease Detection page. Upload an image of a crop leaf, and the AI will analyze it
          to detect any signs of disease.
        </p>
        <div className="mt-4 p-4 bg-gray-700 rounded-md">
          {/* Placeholder for image upload interface */}
          <p className="text-center text-gray-400">Image Upload Interface Goes Here</p>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
