from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import joblib
import pandas as pd
from pydantic import BaseModel
import os

# ✅ Router for Price Prediction
router = APIRouter(prefix="/price", tags=["Price Prediction"])

# ✅ Path to trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_price_model_2.pkl")

# ✅ Load model with fallback
try:
    print(f"\n🔄 Loading price prediction model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    print("\n✅ Price prediction model loaded successfully")
    model_loaded = True
except Exception as e:
    print(f"\n❌ Failed to load price prediction model: {e}")
    model = None
    model_loaded = False

# Input schema for request body
class CropPriceData(BaseModel):
    month: str
    commodity_name: str
    avg_min_price: float
    avg_max_price: float
    state_name: str
    district_name: str
    calculationType: str
    change: float

@router.get("/")
def price_prediction_status():
    """Get price prediction service status"""
    return {
        "status": "active",
        "service": "Crop Price Prediction",
        "version": "1.0.0",
        "model_loaded": model is not None
    }

@router.post("/predict")
def predict_price(data: CropPriceData):
    """Predict crop price based on input data"""
    if model is None:
        return {"error": "Price prediction model not loaded"}
    
    try:
        # Convert input to DataFrame (model expects same features as training)
        df = pd.DataFrame([data.dict()])
        
        # Predict
        pred = model.predict(df)[0]
        
        return {
            "predicted_price": float(pred),
            "status": "success",
            "input_data": data.dict()
        }
    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}",
            "status": "error"
        }

@router.get("/commodities")
def get_supported_commodities():
    """Get list of supported commodities"""
    # Common commodities that the model might support
    commodities = [
        "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut",
        "Soybean", "Turmeric", "Coriander", "Chili", "Onion", "Potato",
        "Tomato", "Banana", "Mango", "Orange", "Apple", "Grapes",
        "Tea", "Coffee", "Rubber", "Coconut", "Areca nut", "Cardamom",
        "Black pepper", "Ginger", "Garlic", "Lemon", "Jowar", "Bajra",
        "Ragi", "Barley", "Gram", "Tur", "Moong", "Urad", "Linseed",
        "Castor seed", "Sesamum", "Safflower", "Nigerseed", "Sunflower"
    ]
    
    return {
        "commodities": sorted(commodities),
        "count": len(commodities),
        "status": "success"
    }

@router.get("/states")
def get_supported_states():
    """Get list of supported Indian states"""
    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal", "Delhi", "Chandigarh", "Dadra and Nagar Haveli",
        "Daman and Diu", "Lakshadweep", "Puducherry"
    ]
    
    return {
        "states": sorted(states),
        "count": len(states),
        "status": "success"
    }
