from fastapi import APIRouter, HTTPException, Request
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from FarmAgent.app.scheduler import run_daily_pipeline
from FarmAgent.app.agents.weather_agent import analyze_weather
from FarmAgent.app.agents.risk_engine import calculate_risks

import asyncio
from dotenv import load_dotenv
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
import os



# Define router with prefix and tags
router = APIRouter(prefix="/farmagent", tags=["FarmAgent"])

# Initialize scheduler
scheduler = AsyncIOScheduler()

@router.on_event("startup")
async def startup_event():
    if not scheduler.running:
        trigger = CronTrigger(hour=6, minute=0, timezone="Asia/Kolkata")
        scheduler.add_job(run_daily_pipeline, trigger)
        scheduler.start()
        print("✅ FarmAgent scheduler started - Daily runs at 6:00 AM IST")
    else:
        print("⚠️ FarmAgent scheduler already running")

@router.get("/")
async def root():
    return {
        "status": "active",
        "service": "FarmAgent Proactive Alert System",
        "version": "1.0.0"
    }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": asyncio.get_event_loop().time(),
        "database": "firebase"
    }

@router.post("/run-now")
async def trigger_pipeline_now():
    try:
        await run_daily_pipeline()
        return {
            "status": "success",
            "message": "Agent pipeline executed successfully",
            "action": "check_whatsapp_for_alerts"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

@router.post("/farmers")
async def register_farmer(farmer_data: dict):
    try:
        db = firestore.client()
        doc_ref = db.collection("farmers").document()
        doc_ref.set(farmer_data)
        return {
            "status": "success",
            "message": "Farmer registered successfully",
            "farmer_id": doc_ref.id,
            "data": farmer_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.get("/farmers")
async def get_all_farmers():
    try:
        db = firestore.client()
        farmers_ref = db.collection("farmers")
        farmers = []
        for doc in farmers_ref.stream():
            farmer_data = doc.to_dict()
            farmer_data["id"] = doc.id
            farmers.append(farmer_data)
        return {
            "status": "success",
            "count": len(farmers),
            "farmers": farmers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch farmers: {str(e)}")

@router.get("/alerts")
async def get_all_alerts():
    try:
        db = firestore.client()
        alerts_ref = db.collection("alerts")
        alerts = []
        for doc in alerts_ref.stream():
            alert_data = doc.to_dict()
            alert_data["id"] = doc.id
            alerts.append(alert_data)
        return {
            "status": "success",
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@router.get("/alerts/{farmer_id}")
async def get_farmer_alerts(farmer_id: str):
    try:
        db = firestore.client()
        alerts_ref = db.collection("alerts").where("farmer_id", "==", farmer_id)
        alerts = []
        for doc in alerts_ref.stream():
            alert_data = doc.to_dict()
            alert_data["id"] = doc.id
            alerts.append(alert_data)
        return {
            "status": "success",
            "farmer_id": farmer_id,
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@router.post("/api/chat")
async def chat_with_farmer(chat_data: dict):
    try:
        db = firestore.client()
        farmer_ref = db.collection("farmers").document(chat_data["farmer_id"])
        farmer_doc = farmer_ref.get()
        if not farmer_doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")

        farmer = farmer_doc.to_dict()
        weather = await analyze_weather(farmer["lat"], farmer["lon"])
        if not weather:
            raise HTTPException(status_code=500, detail="Could not fetch weather data")

        risks = calculate_risks(weather, farmer.get("crop", "default"))
        response = await generate_chat_response(farmer, chat_data["message"], weather, risks)

        chat_history = {
            "farmer_id": chat_data["farmer_id"],
            "user_message": chat_data["message"],
            "bot_response": response,
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        db.collection("chat_messages").add(chat_history)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

async def generate_chat_response(farmer, user_question, weather_data, risk_scores):
    import google.generativeai as genai
    prompt = f"""
You are FarmAI, an agricultural expert assistant for {farmer.get('name', 'the farmer')}.

CONTEXT:
- Location: {farmer.get('district', 'Unknown district')}
- Crop: {farmer.get('crop', 'Unknown crop')} ({farmer.get('growth_stage', 'Unknown stage')})
- Current temp: {weather_data.get('current_temp', 'N/A')}°C, Humidity: {weather_data.get('humidity', 'N/A')}%
- Conditions: {weather_data.get('conditions', 'N/A')}
- Disease risk: {risk_scores.get('disease_risk', 0)*100}%

QUESTION: {user_question}

Answer specifically for this farmer's situation. Be practical and actionable.
Keep response under 200 characters. Use simple language.
"""
    try:
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return "I'm having trouble processing your question right now. Please try again later."
