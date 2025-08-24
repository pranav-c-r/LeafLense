// API Configuration for LeafLense Application

// Base URL for the price prediction service
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  PRICE_SERVICE_BASE: '/price',
  TIMEOUT: 10000, // 10 seconds
}

// API Endpoints
export const ENDPOINTS = {
  PRICE_PREDICTION: {
    PREDICT: `${API_CONFIG.PRICE_SERVICE_BASE}/predict`,
    COMMODITIES: `${API_CONFIG.PRICE_SERVICE_BASE}/commodities`,
    STATES: `${API_CONFIG.PRICE_SERVICE_BASE}/states`,
    STATUS: `${API_CONFIG.PRICE_SERVICE_BASE}/`,
  }
}

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
}

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
}
