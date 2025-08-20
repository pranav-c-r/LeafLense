import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import YieldPrediction from './components/YieldPrediction.jsx';
import DiseaseDetection from './components/DiseaseDetection.jsx';
import FertilizerRecommendation from './components/FertilizerRecommendation.jsx';
import Insights from './components/Insights.jsx';
import Chatbot from './components/Chatbot.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/yield" element={<YieldPrediction />} />
          <Route path="/disease" element={<DiseaseDetection />} />
          <Route path="/fertilizer" element={<FertilizerRecommendation />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
