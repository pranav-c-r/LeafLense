from fastapi import FastAPI
import joblib
import pandas as pd
from pydantic import BaseModel

# Load model at startup
import os
model_path = os.path.join(os.path.dirname(__file__), "crop_price_model_2.pkl")
model = joblib.load(model_path)

app = FastAPI()

# Input schema for request body
class CropData(BaseModel):
    month: str
    commodity_name: str
    avg_min_price: float
    avg_max_price: float
    state_name: str
    district_name: str
    calculationType: str
    change: float

@app.post("/predict")
def predict(data: CropData):
    # Convert input to DataFrame (model expects same features as training)
    df = pd.DataFrame([data.dict()])
    
    # Predict
    pred = model.predict(df)[0]
    
    return {"predicted_price": float(pred)}
