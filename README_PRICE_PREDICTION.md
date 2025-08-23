# LeafLense Price Prediction System

This document explains how to connect your trained crop price prediction model with the React frontend.

## 🏗️ Architecture Overview

The system consists of:
- **Frontend**: React application with a service layer for API communication
- **Backend**: FastAPI server serving your trained ML model (`crop_price_model_2.pkl`)
- **API Layer**: Clean abstraction for all model interactions

## 📁 File Structure

```
LeafLense/
├── frontend/src/
│   ├── config/
│   │   └── api.js                 # API configuration
│   ├── services/
│   │   └── priceService.js        # API service layer
│   └── pages/
│       └── PricePrediction.jsx    # Updated to use new service
└── backend/PricePrediction/
    ├── server.py                  # FastAPI server
    ├── routes.py                  # API routes
    ├── app.py                     # Original FastAPI app
    ├── requirements.txt           # Python dependencies
    ├── start_server.bat           # Windows startup script
    └── crop_price_model_2.pkl     # Your trained model
```

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd "backend/PricePrediction"
   ```

2. **Option A: Use the Windows batch file (Recommended for Windows)**:
   ```bash
   start_server.bat
   ```
   This will:
   - Create a virtual environment
   - Install dependencies
   - Check for your model file
   - Start the server

3. **Option B: Manual setup**:
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the server
   python server.py
   ```

4. **Verify the server is running**:
   - Open http://localhost:8000 in your browser
   - Check API documentation at http://localhost:8000/docs
   - Health check at http://localhost:8000/health

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open http://localhost:5173 (or your configured port)
   - Navigate to the "Price Prediction" page

## 🔌 API Endpoints

The backend provides the following endpoints:

- `GET /price/` - Service status
- `POST /price/predict` - Make price predictions
- `GET /price/commodities` - Get supported commodities
- `GET /price/states` - Get supported states
- `GET /health` - Health check

## 📊 Using the Price Prediction

1. **Fill in the form**:
   - Select commodity (Rice, Wheat, etc.)
   - Choose month
   - Select state and enter district
   - Enter current min/max prices
   - Set calculation type (per quintal/kg/tonne)
   - Enter recent price change percentage

2. **Get predictions**:
   - Click "Predict Price"
   - View the AI-powered price prediction
   - See market factors and recommendations

## 🛠️ New Features Added

### Service Layer (`frontend/src/services/priceService.js`)
- **Centralized API calls**: All backend communication in one place
- **Error handling**: Proper timeout and error management
- **Input validation**: Validates data before sending to backend
- **Health checks**: Monitor backend service status

### Configuration (`frontend/src/config/api.js`)
- **API endpoints**: Centralized endpoint management
- **Base URLs**: Easy to change backend URL
- **Status constants**: Consistent status handling

### Enhanced Error Handling
- **Connection errors**: Clear messages when backend is down
- **Validation errors**: Client-side input validation
- **Timeout handling**: Prevents hanging requests
- **User feedback**: Better error messages for users

## 🔧 Customization

### Adding New Features

1. **New API endpoints**: Add to `backend/PricePrediction/routes.py`
2. **Frontend services**: Extend `priceService.js`
3. **Configuration**: Update `api.js` for new endpoints

### Model Updates

1. Replace `crop_price_model_2.pkl` with your new model
2. Ensure the new model accepts the same input format
3. Update the commodity/state lists in `routes.py` if needed

## 🐛 Troubleshooting

### Backend Issues

1. **Model not loading**:
   - Ensure `crop_price_model_2.pkl` is in the `backend/PricePrediction/` directory
   - Check file permissions
   - Verify the model was saved with the same Python/scikit-learn versions

2. **Server won't start**:
   - Check if port 8000 is available
   - Verify Python installation
   - Check dependency installation

3. **CORS errors**:
   - Ensure frontend URL is in the CORS whitelist in `server.py`

### Frontend Issues

1. **Connection refused**:
   - Verify backend server is running on port 8000
   - Check browser console for detailed errors

2. **Prediction fails**:
   - Verify all form fields are filled
   - Check if the backend model supports the selected commodity/state

## 📝 Development Notes

### File Modifications Made

1. **Created new files**:
   - `frontend/src/config/api.js`
   - `frontend/src/services/priceService.js`
   - `backend/PricePrediction/server.py`
   - `backend/PricePrediction/requirements.txt`
   - `backend/PricePrediction/start_server.bat`

2. **Modified existing files**:
   - `frontend/src/pages/PricePrediction.jsx` - Updated to use the new service layer

### Why This Architecture?

- **Separation of concerns**: API logic separated from UI components
- **Maintainability**: Easy to update API endpoints without touching UI code
- **Error handling**: Centralized error management
- **Reusability**: Service can be used by other components
- **Testing**: Services can be easily unit tested

## 🚀 Next Steps

1. **Test the connection** by running both frontend and backend
2. **Verify predictions** with known data
3. **Monitor performance** and add logging if needed
4. **Add authentication** if required for production
5. **Deploy to production** when ready

---

**Note**: This setup maintains your existing frontend files while adding a clean service layer for backend communication. Your original `PricePrediction.jsx` now uses the new service architecture for better maintainability and error handling.
