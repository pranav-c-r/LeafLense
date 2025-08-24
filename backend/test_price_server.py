#!/usr/bin/env python3
"""
Simple test server for Price Prediction only
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from PricePrediction.routes import router as price_router

# Create FastAPI app
app = FastAPI(
    title="LeafLense Price Prediction Test Server",
    description="Test server for price prediction model",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include only price prediction router
app.include_router(price_router, tags=["Price Prediction"])

@app.get("/")
def root():
    return {
        "message": "LeafLense Price Prediction Test Server",
        "status": "running",
        "endpoints": {
            "price_status": "/price/",
            "predict": "/price/predict",
            "commodities": "/price/commodities",
            "states": "/price/states",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Price Prediction Test Server"
    }

if __name__ == "__main__":
    print("🌿 LeafLense Price Prediction Test Server")
    print("=" * 50)
    print("🚀 Starting server on http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        "test_price_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
