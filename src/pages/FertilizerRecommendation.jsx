import { useState } from 'react'
import { Beaker, Zap, Brain, AlertCircle, TrendingUp } from 'lucide-react'

const FertilizerRecommendation = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    soilType: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    soilPh: '',
    organic: ''
  })
  
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)

  const crops = [
    'Wheat', 'Rice', 'Maize', 'Barley', 'Soybeans', 'Cotton', 'Potato', 'Tomato', 'Sugarcane'
  ]

  const soilTypes = [
    'Clay', 'Sandy', 'Loamy', 'Silt', 'Peaty', 'Chalky'
  ]

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockRecommendation = {
        npkRatio: '20-10-10',
        applicationRate: '150 kg/ha',
        totalCost: '$120',
        nutrients: {
          nitrogen: { current: formData.nitrogen, recommended: parseInt(formData.nitrogen) + 30, unit: 'kg/ha' },
          phosphorus: { current: formData.phosphorus, recommended: parseInt(formData.phosphorus) + 15, unit: 'kg/ha' },
          potassium: { current: formData.potassium, recommended: parseInt(formData.potassium) + 10, unit: 'kg/ha' }
        },
        products: [
          { name: 'NPK Complex 20-10-10', amount: '100 kg', cost: '$80', timing: 'Base application' },
          { name: 'Urea (46-0-0)', amount: '50 kg', cost: '$25', timing: 'Top dressing' },
          { name: 'Organic Compost', amount: '200 kg', cost: '$15', timing: 'Pre-planting' }
        ],
        timeline: [
          { stage: 'Pre-planting', action: 'Apply organic matter and phosphorus', timing: '2 weeks before planting' },
          { stage: 'Planting', action: 'Apply base NPK fertilizer', timing: 'At planting time' },
          { stage: 'Vegetative', action: 'First nitrogen top-dressing', timing: '4-6 weeks after planting' },
          { stage: 'Flowering', action: 'Second nitrogen application', timing: '8-10 weeks after planting' }
        ]
      }
      setRecommendation(mockRecommendation)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-soil-500 to-soil-600 rounded-xl flex items-center justify-center">
            <Beaker className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Fertilizer Recommendation</h1>
            <p className="text-slate-400">AI-powered NPK optimization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-soil-400" />
          <span className="text-sm">500+ Crop Types</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Soil Analysis Input</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Crop Type
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select crop</option>
                    {crops.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Soil Type
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map(soil => (
                      <option key={soil} value={soil}>{soil}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-4">Current Nutrient Levels (kg/ha)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nitrogen (N)
                  </label>
                  <input
                    type="number"
                    name="nitrogen"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    placeholder="120"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phosphorus (P)
                  </label>
                  <input
                    type="number"
                    name="phosphorus"
                    value={formData.phosphorus}
                    onChange={handleInputChange}
                    placeholder="60"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Potassium (K)
                  </label>
                  <input
                    type="number"
                    name="potassium"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    placeholder="40"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Soil pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="soilPh"
                    value={formData.soilPh}
                    onChange={handleInputChange}
                    placeholder="6.5"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Organic Matter (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="organic"
                    value={formData.organic}
                    onChange={handleInputChange}
                    placeholder="2.5"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full button-primary mt-6 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Get Recommendations</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {recommendation ? (
            <>
              {/* Main Recommendation */}
              <div className="bg-gradient-to-br from-soil-500/20 to-soil-600/10 backdrop-blur-sm rounded-2xl p-6 border border-soil-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">NPK Recommendation</h2>
                  <TrendingUp className="h-5 w-5 text-soil-400" />
                </div>
                
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-gradient mb-2">
                    {recommendation.npkRatio}
                  </div>
                  <div className="text-lg text-slate-300 mb-4">NPK Ratio</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-soil-400">{recommendation.applicationRate}</div>
                      <div className="text-sm text-slate-400">Application Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-emerald-400">{recommendation.totalCost}</div>
                      <div className="text-sm text-slate-400">Estimated Cost</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrient Analysis */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Nutrient Analysis</h3>
                
                <div className="space-y-4">
                  {Object.entries(recommendation.nutrients).map(([nutrient, data]) => (
                    <div key={nutrient} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white capitalize">{nutrient}</span>
                        <span className="text-sm text-slate-400">{data.unit}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="text-sm text-slate-400 mb-1">Current</div>
                          <div className="text-lg font-bold text-red-400">{data.current}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-400 mb-1">Recommended</div>
                          <div className="text-lg font-bold text-green-400">{data.recommended}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400 mb-1">Deficit</div>
                          <div className="text-lg font-bold text-yellow-400">+{data.recommended - data.current}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Recommendations */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Recommended Products</h3>
                
                <div className="space-y-3">
                  {recommendation.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-slate-400">{product.timing}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-300">{product.amount}</div>
                        <div className="text-sm font-medium text-green-400">{product.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <Beaker className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Analyze</h3>
              <p className="text-slate-500">Enter your soil test results to get personalized fertilizer recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FertilizerRecommendation
