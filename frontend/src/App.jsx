import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CropYield from './pages/CropYield'
import DiseaseDetection from './pages/DiseaseDetection'
import FertilizerRecommendation from './pages/FertilizerRecommendation'
import Insights from './pages/Insights'
import Chatbot from './pages/Chatbot'
import LandingPage from './pages/landing'
import Signin from './pages/signin'
import Profile from './pages/profile'

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/crop-yield" element={<Layout><CropYield /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/disease-detection" element={<Layout><DiseaseDetection /></Layout>} />
        <Route path="/fertilizer" element={<Layout><FertilizerRecommendation /></Layout>} />
        <Route path="/insights" element={<Layout><Insights /></Layout>} />
        <Route path="/chat" element={<Layout><Chatbot /></Layout>} />
      </Routes>
    </div>
  )
}

export default App