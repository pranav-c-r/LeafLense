from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from FarmAgent.routes import router as farm_router
from Plant_Disease.routes import router as plant_router

# Load environment variables from .env in backend root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Create FastAPI app
app = FastAPI(
    title="Unified Backend",
    description="Single backend server for FarmAgent, Plant_Disease and other services",
    version="1.0.0"
)

# CORS setup (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ In production, replace with frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefixes
app.include_router(farm_router, prefix="/farm", tags=["FarmAgent"])
app.include_router(plant_router, prefix="/plant", tags=["Plant_Disease"])
# app.include_router(another_router, prefix="/other", tags=["Other"])

@app.get("/")
def root():
    return {"message": "Unified Backend running successfully"}

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
