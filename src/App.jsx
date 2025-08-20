import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CropYield from './pages/CropYield'
import DiseaseDetection from './pages/DiseaseDetection'
import FertilizerRecommendation from './pages/FertilizerRecommendation'
import Insights from './pages/Insights'
import Chatbot from './pages/Chatbot'

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crop-yield" element={<CropYield />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/fertilizer" element={<FertilizerRecommendation />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/chat" element={<Chatbot />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
