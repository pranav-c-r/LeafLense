import { useState } from 'react'
import { Wheat, TrendingUp, Calendar, Thermometer, Droplets, Wind, MapPin, Zap, Brain, AlertCircle } from 'lucide-react'

const CropYield = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    area: '',
    soilType: '',
    soilPh: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    sunshine: ''
  })
  
  const [prediction, setPrediction] = useState(null)
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
      const mockPrediction = {
        yield: (Math.random() * 5 + 2).toFixed(1),
        confidence: Math.floor(Math.random() * 15 + 85),
        factors: [
          { name: 'Soil Quality', impact: 'High', value: '+15%' },
          { name: 'Weather Conditions', impact: 'Medium', value: '+8%' },
          { name: 'Nutrient Balance', impact: 'High', value: '+12%' }
        ],
        recommendations: [
          'Consider increasing nitrogen application by 10kg/hectare',
          'Monitor moisture levels closely during flowering stage',
          'Apply organic matter to improve soil structure'
        ]
      }
      setPrediction(mockPrediction)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-agri-500 to-agri-600 rounded-xl flex items-center justify-center">
            <Wheat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Crop Yield Prediction</h1>
            <p className="text-slate-400">AI-powered harvest forecasting</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-agri-400" />
          <span className="text-sm">94.2% Accuracy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-agri-400" />
              Farm & Crop Details
            </h2>
            
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
                    Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-blue-400" />
                Soil Nutrients (kg/ha)
              </h3>
              
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

              <h3 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-orange-400" />
                Weather Conditions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      placeholder="25"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      name="humidity"
                      value={formData.humidity}
                      onChange={handleInputChange}
                      placeholder="65"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      name="rainfall"
                      value={formData.rainfall}
                      onChange={handleInputChange}
                      placeholder="800"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sunshine (hrs)
                    </label>
                    <input
                      type="number"
                      name="sunshine"
                      value={formData.sunshine}
                      onChange={handleInputChange}
                      placeholder="2200"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                      required
                    />
                  </div>
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
                    <span>Predict Yield</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {prediction ? (
            <>
              {/* Main Prediction */}
              <div className="bg-gradient-to-br from-agri-500/20 to-agri-600/10 backdrop-blur-sm rounded-2xl p-6 border border-agri-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Predicted Yield</h2>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-agri-400" />
                    <span className="text-sm text-agri-300">{prediction.confidence}% Confidence</span>
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-gradient mb-2">
                    {prediction.yield}
                  </div>
                  <div className="text-lg text-slate-300">tons per hectare</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-agri-400">{(prediction.yield * parseFloat(formData.area || 1)).toFixed(1)}</div>
                    <div className="text-sm text-slate-400">Total Yield (tons)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{prediction.confidence}%</div>
                    <div className="text-sm text-slate-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">+{((prediction.yield - 3) / 3 * 100).toFixed(0)}%</div>
                    <div className="text-sm text-slate-400">vs Average</div>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-400" />
                  Impact Factors
                </h3>
                
                <div className="space-y-3">
                  {prediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          factor.impact === 'High' ? 'bg-agri-400' : 
                          factor.impact === 'Medium' ? 'bg-yellow-400' : 'bg-slate-400'
                        }`}></div>
                        <span className="text-slate-300">{factor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">{factor.impact}</span>
                        <span className="text-agri-400 font-medium">{factor.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                  AI Recommendations
                </h3>
                
                <div className="space-y-3">
                  {prediction.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <Wheat className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Predict</h3>
              <p className="text-slate-500">Fill in the form to get AI-powered yield predictions for your crops.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CropYield
