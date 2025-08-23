import { useState } from 'react'
import { Beaker, Zap, Brain, AlertCircle, TrendingUp } from 'lucide-react'

const FertilizerRecommendation = () => {
  const [formData, setFormData] = useState({
    Crop_Type: '',
    Soil_Type: '',
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    Temperature: '',
    Humidity: '',
    Moisture: ''
  })

  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const crops = ['Ground Nuts', 'Cotton', 'Sugarcane', 'Wheat', 'Tobacco', 'Barley', 'Millets',
    'Pulses', 'Oil seeds', 'Maize', 'Paddy']

  const soilTypes = ['Red', 'Black', 'Sandy', 'Loamy', 'Clayey']

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/fertilizer/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()

      // Backend returns { prediction: ... }
      const pred = data.prediction ?? data

      // If prediction is a simple string, wrap into a minimal object so UI can render
      if (typeof pred === 'string' || typeof pred === 'number') {
        setRecommendation({
          npkRatio: String(pred),
          applicationRate: '—',
          totalCost: '—',
          nutrients: {
            nitrogen: { current: Number(formData.Nitrogen) || 0, recommended: (Number(formData.Nitrogen) || 0) + 30, unit: 'kg/ha' },
            phosphorus: { current: Number(formData.Phosphorus) || 0, recommended: (Number(formData.Phosphorus) || 0) + 15, unit: 'kg/ha' },
            potassium: { current: Number(formData.Potassium) || 0, recommended: (Number(formData.Potassium) || 0) + 10, unit: 'kg/ha' }
          },
          products: []
        })
      } else if (typeof pred === 'object') {
        // If it's an object matching expected structure, use it directly
        setRecommendation(pred)
      } else {
        setRecommendation({ npkRatio: String(pred) })
      }
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!recommendation) return
    const text = recommendation.npkRatio ?? JSON.stringify(recommendation)
    try {
      await navigator.clipboard.writeText(String(text))
    } catch (e) {
      // ignore clipboard failures silently
    }
  }

  const handleReset = () => {
    setFormData({ Crop_Type: '', Soil_Type: '', Nitrogen: '', Phosphorus: '', Potassium: '', Temperature: '', Humidity: '', Moisture: '' })
    setRecommendation(null)
    setError(null)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
            <Beaker className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Fertilizer Recommendation</h1>
            <p className="text-gray-400">AI-powered NPK optimization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Brain className="h-5 w-5 animate-pulse text-green-400" />
          <span className="text-sm">Accurate NPK levels</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Soil Analysis Input</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Crop Type
                  </label>
                  <select
                    name="Crop_Type"
                    value={formData.Crop_Type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select crop</option>
                    {crops.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Soil Type
                  </label>
                  <select
                    name="Soil_Type"
                    value={formData.Soil_Type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nitrogen (N)
                  </label>
                  <input
                    type="number"
                    name="Nitrogen"
                    value={formData.Nitrogen}
                    onChange={handleInputChange}
                    placeholder="120"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phosphorus (P)
                  </label>
                  <input
                    type="number"
                    name="Phosphorus"
                    value={formData.Phosphorus}
                    onChange={handleInputChange}
                    placeholder="60"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Potassium (K)
                  </label>
                  <input
                    type="number"
                    name="Potassium"
                    value={formData.Potassium}
                    onChange={handleInputChange}
                    placeholder="40"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="Temperature"
                    value={formData.Temperature}
                    onChange={handleInputChange}
                    placeholder="6.5"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="Humidity"
                    value={formData.Humidity}
                    onChange={handleInputChange}
                    placeholder="2.5"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Moisture
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="Moisture"
                    value={formData.Moisture}
                    onChange={handleInputChange}
                    placeholder="6.5"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white input-focus"
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
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 text-red-300 rounded-lg p-3">{error}</div>
          )}
          {recommendation ? (
            <>
              {/* Main Recommendation */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">NPK Recommendation</h2>
                  <div className="flex items-center space-x-2">
                    <button onClick={handleCopy} className="px-3 py-1 bg-green-600/30 text-sm rounded-md text-white">Copy</button>
                    <button onClick={handleReset} className="px-3 py-1 bg-gray-700/40 text-sm rounded-md text-white">Reset</button>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>

                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-gradient mb-2">
                    {recommendation.npkRatio}
                  </div>
                  <div className="text-lg text-gray-300 mb-4">NPK Ratio</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{recommendation.applicationRate}</div>
                      <div className="text-sm text-gray-400">Application Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{recommendation.totalCost}</div>
                      <div className="text-sm text-gray-400">Estimated Cost</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrient Analysis */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Nutrient Analysis</h3>

                <div className="space-y-4">
                  {Object.entries(recommendation.nutrients).map(([nutrient, data]) => (
                    <div key={nutrient} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white capitalize">{nutrient}</span>
                        <span className="text-sm text-gray-400">{data.unit}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="text-sm text-gray-400 mb-1">Current</div>
                          <div className="text-lg font-bold text-red-400">{data.current}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-400 mb-1">Recommended</div>
                          <div className="text-lg font-bold text-green-400">{data.recommended}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Deficit</div>
                          <div className="text-lg font-bold text-yellow-400">+{data.recommended - data.current}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Recommendations */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Recommended Products</h3>

                <div className="space-y-3">
                  {recommendation.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">{product.timing}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">{product.amount}</div>
                        <div className="text-sm font-medium text-green-400">{product.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
              <Beaker className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Analyze</h3>
              <p className="text-gray-500">Enter your soil test results to get personalized fertilizer recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FertilizerRecommendation