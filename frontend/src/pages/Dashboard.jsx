import React from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/dashboard/DashboardCard';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Welcome, Farmer! 🌱</h1>
      <p className="text-md sm:text-lg text-center mb-8 text-gray-400 dark:text-gray-500">
        Select a tool to get started.
      </p>

      {/* Grid of dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/yield">
          <DashboardCard
            title="Crop Yield Prediction"
            description="Predict your crop yield based on soil and weather data."
            icon="📈"
          />
        </Link>
        <Link to="/disease">
          <DashboardCard
            title="Crop Disease Detection"
            description="Upload a leaf image to detect potential plant diseases."
            icon="🔍"
          />
        </Link>
        <Link to="/fertilizer">
          <DashboardCard
            title="Fertilizer Recommendation"
            description="Get personalized fertilizer suggestions based on soil nutrients."
            icon="🧪"
          />
        </Link>
        <Link to="/insights">
          <DashboardCard
            title="Actionable Insights"
            description="Get combined advice from all AI models."
            icon="💡"
          />
        </Link>
        <Link to="/chat">
          <DashboardCard
            title="Conversational Assistant"
            description="Chat with the AI to understand predictions and get guidance."
            icon="🤖"
          />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
