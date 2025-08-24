from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# --- ADD THIS BLOCK ---
# Load environment variables from the .env file in the same directory
load_dotenv() 
# Add a debug print to confirm it's working
print(f"DEBUG from main.py: PRIVATE_KEY has been loaded. Value starts with: {str(os.getenv('PRIVATE_KEY'))[:25]}...")
# --- END BLOCK ---
from FarmAgent.routes import router as farm_router
from Plant_Disease.routes import router as plant_router
from FertilizerSuggestor.routes import router as fert_router
<<<<<<< Updated upstream
from Yield_Prediction.routes import router as yield_router
=======
from PricePrediction.routes import router as price_router
>>>>>>> Stashed changes

# Load environment variables (from .env inside backend/)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Create FastAPI app
app = FastAPI(
    title="Unified Backend",
    description="Single backend server for FarmAgent, Plant_Disease and other services",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(farm_router, prefix="/farm", tags=["FarmAgent"])
app.include_router(plant_router, prefix="/plant", tags=["Plant_Disease"])
app.include_router(fert_router, prefix="/fertilizer", tags=["FertilizerSuggestor"])
<<<<<<< Updated upstream
app.include_router(yield_router, prefix="/yield", tags=["YieldPredictor"])
=======
app.include_router(price_router, prefix="/price", tags=["PricePrediction"])
>>>>>>> Stashed changes

@app.get("/")
def root():
    return {"message": "Unified Backend running successfully"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",   # ✅ correct for backend/main.py
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
