import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => (
  <div className="dashboard">
    <h1>AI Agri-Advisor Dashboard</h1>
    <div className="dashboard-links">
      <Link to="/yield">Crop Yield Prediction</Link>
      <Link to="/disease">Crop Disease Detection</Link>
      <Link to="/fertilizer">Fertilizer Recommendation</Link>
      <Link to="/insights">Insights</Link>
      <Link to="/chatbot">Conversational Assistant</Link>
    </div>
  </div>
);

export default Dashboard;
