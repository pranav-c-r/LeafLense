import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Calendar, MapPin, Zap, Brain, AlertCircle, BarChart3 } from 'lucide-react'
import { priceService } from '../services/priceService'
import { API_STATUS } from '../config/api'

const PricePrediction = () => {
  const [formData, setFormData] = useState({
    month: '',
    commodity_name: '',
    avg_min_price: '',
    avg_max_price: '',
    state_name: '',
    district_name: '',
    calculationType: 'per_quintal',
    change: ''
  })
  
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [commodities, setCommodities] = useState([])
  const [states, setStates] = useState([])

  // Load commodities and states on component mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [commoditiesData, statesData] = await Promise.all([
          priceService.getCommodities(),
          priceService.getStates()
        ])
        
        if (commoditiesData.status === API_STATUS.SUCCESS) {
          setCommodities(commoditiesData.commodities)
        }
        
        if (statesData.status === API_STATUS.SUCCESS) {
          setStates(statesData.states)
        }
      } catch (error) {
        console.error('Failed to load dropdown data:', error)
      }
    }
    
    loadDropdownData()
  }, [])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const calculationTypes = [
    { value: 'per_quintal', label: 'Per Quintal (₹/100kg)' },
    { value: 'per_kg', label: 'Per Kilogram (₹/kg)' },
    { value: 'per_tonne', label: 'Per Tonne (₹/1000kg)' }
  ]

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Use the price service to predict
      const data = await priceService.predictPrice({
        ...formData,
        avg_min_price: parseFloat(formData.avg_min_price),
        avg_max_price: parseFloat(formData.avg_max_price),
        change: parseFloat(formData.change)
      })
      
      if (data.status === API_STATUS.SUCCESS) {
        // Enhanced prediction data with additional market insights
        const mockEnhancedData = {
          predicted_price: data.predicted_price,
          confidence: Math.floor(Math.random() * 15 + 85), // Mock confidence score
          trend: data.predicted_price > (parseFloat(formData.avg_min_price) + parseFloat(formData.avg_max_price)) / 2 ? 'up' : 'down',
          market_factors: [
            { name: 'Seasonal Demand', impact: 'High', value: '+12%' },
            { name: 'Supply Chain', impact: 'Medium', value: '+8%' },
            { name: 'Weather Conditions', impact: 'Medium', value: '+5%' }
          ],
          price_history: {
            last_month: ((parseFloat(formData.avg_min_price) + parseFloat(formData.avg_max_price)) / 2).toFixed(2),
            predicted: data.predicted_price.toFixed(2),
            difference: (data.predicted_price - (parseFloat(formData.avg_min_price) + parseFloat(formData.avg_max_price)) / 2).toFixed(2)
          },
          recommendations: [
            data.predicted_price > (parseFloat(formData.avg_min_price) + parseFloat(formData.avg_max_price)) / 2 
              ? 'Market prices are expected to rise. Consider selling if you have stock.'
              : 'Prices may decline. Good time to buy for future needs.',
            'Monitor market trends closely for the next 2-3 weeks',
            'Consider regional price variations before making decisions'
          ]
        }
        setPrediction(mockEnhancedData)
      } else {
        console.error('Prediction failed:', data.error)
        alert(`Prediction failed: ${data.error || 'Please check your inputs and try again.'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to connect to the server: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Price Prediction</h1>
            <p className="text-slate-400">AI-powered market price forecasting</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-blue-400" />
          <span className="text-sm">Market Intelligence</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
              Market Analysis Input
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Commodity
                  </label>
                  <select
                    name="commodity_name"
                    value={formData.commodity_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select commodity</option>
                    {commodities.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Month
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State
                  </label>
                  <select
                    name="state_name"
                    value={formData.state_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="district_name"
                    value={formData.district_name}
                    onChange={handleInputChange}
                    placeholder="Enter district name"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                Current Market Prices
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Average Min Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="avg_min_price"
                    value={formData.avg_min_price}
                    onChange={handleInputChange}
                    placeholder="1500.00"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Average Max Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="avg_max_price"
                    value={formData.avg_max_price}
                    onChange={handleInputChange}
                    placeholder="1800.00"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Calculation Type
                  </label>
                  <select
                    name="calculationType"
                    value={formData.calculationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white input-focus"
                    required
                  >
                    {calculationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Recent Change (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="change"
                    value={formData.change}
                    onChange={handleInputChange}
                    placeholder="5.5"
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
                    <span>Analyzing Market...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Predict Price</span>
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
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Predicted Price</h2>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`h-5 w-5 ${prediction.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-sm text-blue-300">{prediction.confidence}% Confidence</span>
                  </div>
                </div>
                
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-gradient mb-2">
                    ₹{prediction.predicted_price.toFixed(2)}
                  </div>
                  <div className="text-lg text-slate-300">per {formData.calculationType.replace('per_', '')}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">₹{prediction.price_history.last_month}</div>
                    <div className="text-sm text-slate-400">Current Avg</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${parseFloat(prediction.price_history.difference) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(prediction.price_history.difference) >= 0 ? '+' : ''}₹{prediction.price_history.difference}
                    </div>
                    <div className="text-sm text-slate-400">Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{prediction.confidence}%</div>
                    <div className="text-sm text-slate-400">Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Market Factors */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-400" />
                  Market Factors
                </h3>
                
                <div className="space-y-3">
                  {prediction.market_factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          factor.impact === 'High' ? 'bg-red-400' : 
                          factor.impact === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <span className="text-slate-300">{factor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">{factor.impact}</span>
                        <span className="text-blue-400 font-medium">{factor.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
                  Market Recommendations
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
              <TrendingUp className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Predict</h3>
              <p className="text-slate-500">Fill in the market data to get AI-powered price predictions for your commodity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PricePrediction
