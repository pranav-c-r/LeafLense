// Price Prediction Service - API Layer for Model Communication using Axios
import axios from 'axios'
import { API_CONFIG, ENDPOINTS, API_STATUS } from '../config/api.js'

/**
 * Configure Axios instance with interceptors and defaults
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and token attachment
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response.data // Return only the data
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.message)
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - Please check your connection and try again')
    }
    
    if (error.response?.status === 404) {
      throw new Error('Service endpoint not found. Please check if the backend is running.')
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error occurred. Please try again later.')
    }
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Unable to connect to the price prediction service. Please ensure the backend is running.')
    }
    
    // Return the original error for specific handling
    throw error
  }
)

/**
 * Price Prediction Service Class
 * Handles all API calls related to crop price prediction
 */
class PriceService {
  
  /**
   * Get the status of the price prediction service
   * @returns {Promise<object>} - Service status
   */
  async getServiceStatus() {
    try {
      return await apiClient.get(ENDPOINTS.PRICE_PREDICTION.STATUS)
    } catch (error) {
      console.error('Failed to get service status:', error)
      return {
        status: API_STATUS.ERROR,
        error: error.message,
        service: 'Price Prediction Service',
        model_loaded: false
      }
    }
  }

  /**
   * Get list of supported commodities
   * @returns {Promise<object>} - List of commodities
   */
  async getCommodities() {
    try {
      return await apiClient.get(ENDPOINTS.PRICE_PREDICTION.COMMODITIES)
    } catch (error) {
      console.error('Failed to fetch commodities:', error)
      return {
        status: API_STATUS.ERROR,
        error: error.message,
        commodities: [],
        count: 0
      }
    }
  }

  /**
   * Get list of supported states
   * @returns {Promise<object>} - List of states
   */
  async getStates() {
    try {
      return await apiClient.get(ENDPOINTS.PRICE_PREDICTION.STATES)
    } catch (error) {
      console.error('Failed to fetch states:', error)
      return {
        status: API_STATUS.ERROR,
        error: error.message,
        states: [],
        count: 0
      }
    }
  }

  /**
   * Predict crop price based on input data
   * @param {object} predictionData - Prediction input data
   * @param {string} predictionData.month - Month name
   * @param {string} predictionData.commodity_name - Commodity name
   * @param {number} predictionData.avg_min_price - Average minimum price
   * @param {number} predictionData.avg_max_price - Average maximum price
   * @param {string} predictionData.state_name - State name
   * @param {string} predictionData.district_name - District name
   * @param {string} predictionData.calculationType - Calculation type (per_quintal, per_kg, etc.)
   * @param {number} predictionData.change - Recent price change percentage
   * @returns {Promise<object>} - Prediction result
   */
  async predictPrice(predictionData) {
    try {
      // Validate required fields
      const requiredFields = [
        'month', 'commodity_name', 'avg_min_price', 'avg_max_price',
        'state_name', 'district_name', 'calculationType', 'change'
      ]
      
      const missingFields = requiredFields.filter(field => {
        const value = predictionData[field]
        return value === null || value === undefined || value === ''
      })
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Ensure numeric fields are properly formatted
      const processedData = {
        ...predictionData,
        avg_min_price: parseFloat(predictionData.avg_min_price),
        avg_max_price: parseFloat(predictionData.avg_max_price),
        change: parseFloat(predictionData.change)
      }

      // Validate numeric values
      if (isNaN(processedData.avg_min_price) || isNaN(processedData.avg_max_price) || isNaN(processedData.change)) {
        throw new Error('Price values and change percentage must be valid numbers')
      }

      if (processedData.avg_min_price < 0 || processedData.avg_max_price < 0) {
        throw new Error('Price values cannot be negative')
      }

      if (processedData.avg_min_price > processedData.avg_max_price) {
        throw new Error('Minimum price cannot be greater than maximum price')
      }

      return await apiClient.post(ENDPOINTS.PRICE_PREDICTION.PREDICT, processedData)

    } catch (error) {
      console.error('Price prediction failed:', error)
      return {
        status: API_STATUS.ERROR,
        error: error.message,
        predicted_price: null
      }
    }
  }

  /**
   * Health check for the entire price prediction system
   * @returns {Promise<object>} - System health status
   */
  async healthCheck() {
    try {
      const [status, commodities, states] = await Promise.all([
        this.getServiceStatus(),
        this.getCommodities(),
        this.getStates()
      ])

      return {
        status: API_STATUS.SUCCESS,
        service_health: {
          api_accessible: status.status !== API_STATUS.ERROR,
          model_loaded: status.model_loaded || false,
          commodities_available: commodities.count > 0,
          states_available: states.count > 0,
        },
        last_checked: new Date().toISOString(),
        endpoints: {
          status: status.status || API_STATUS.ERROR,
          commodities: commodities.status || API_STATUS.ERROR,
          states: states.status || API_STATUS.ERROR,
        }
      }
    } catch (error) {
      return {
        status: API_STATUS.ERROR,
        error: error.message,
        service_health: {
          api_accessible: false,
          model_loaded: false,
          commodities_available: false,
          states_available: false,
        },
        last_checked: new Date().toISOString(),
      }
    }
  }
}

// Export singleton instance
export const priceService = new PriceService()

// Export the class for testing purposes
export { PriceService }

// Export the configured Axios client for advanced usage
export { apiClient }
