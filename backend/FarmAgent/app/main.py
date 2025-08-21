from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from .scheduler import run_daily_pipeline
from .agents.weather_agent import analyze_weather
from .agents.risk_engine import calculate_risks
import asyncio
from dotenv import load_dotenv
from .models import Farmer  
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import os

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Initialize Firebase Admin
if not firebase_admin._apps:
    # FIXED: Use correct path to service account key
    service_key_path = Path(__file__).parent.parent / "serviceAccountKey.json"
    if not service_key_path.exists():
        raise RuntimeError(f"Firebase service account key not found at: {service_key_path}")
    
    cred = credentials.Certificate(str(service_key_path))
    firebase_admin.initialize_app(cred)

# Initialize FastAPI app
app = FastAPI(title="FarmAgent API", version="1.0.0")

# Add CORS middleware to allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins - change in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize scheduler
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    """Start the scheduler when the application starts"""
    # Schedule the pipeline to run every day at 6:00 AM IST
    trigger = CronTrigger(hour=6, minute=0, timezone="Asia/Kolkata")
    scheduler.add_job(run_daily_pipeline, trigger)
    scheduler.start()
    print("✅ FarmAgent scheduler started - Daily runs at 6:00 AM IST")

@app.get("/")
async def root():
    return {
        "status": "active", 
        "service": "FarmAgent Proactive Alert System",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": asyncio.get_event_loop().time(),
        "database": "firebase"
    }

@app.post("/run-now")
async def trigger_pipeline_now():
    """
    Manual trigger for the agent pipeline.
    Use this for your 'Run Now' button in the frontend.
    """
    try:
        await run_daily_pipeline()
        return {
            "status": "success", 
            "message": "Agent pipeline executed successfully",
            "action": "check_whatsapp_for_alerts"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

@app.post("/farmers")
async def register_farmer(farmer_data: Farmer):
    """
    Register a new farmer - stores data in Firebase Firestore
    """
    try:
        db = firestore.client()
        
        # Convert Pydantic model to dict
        farmer_dict = farmer_data.dict()
        
        # Add to Firebase
        doc_ref = db.collection('farmers').document()
        doc_ref.set(farmer_dict)
        
        return {
            "status": "success",
            "message": "Farmer registered successfully",
            "farmer_id": doc_ref.id,
            "data": farmer_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.get("/farmers")
async def get_all_farmers():
    """Get all registered farmers from Firebase"""
    try:
        db = firestore.client()
        farmers_ref = db.collection('farmers')
        farmers = []
        
        for doc in farmers_ref.stream():
            farmer_data = doc.to_dict()
            farmer_data['id'] = doc.id  # Include Firebase document ID
            farmers.append(farmer_data)
        
        return {
            "status": "success",
            "count": len(farmers),
            "farmers": farmers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch farmers: {str(e)}")

@app.get("/alerts")
async def get_all_alerts():
    """Get all sent alerts from Firebase"""
    try:
        db = firestore.client()
        alerts_ref = db.collection('alerts')
        alerts = []
        
        for doc in alerts_ref.stream():
            alert_data = doc.to_dict()
            alert_data['id'] = doc.id
            alerts.append(alert_data)
        
        return {
            "status": "success",
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@app.get("/alerts/{farmer_id}")
async def get_farmer_alerts(farmer_id: str):
    """Get alerts for a specific farmer"""
    try:
        db = firestore.client()
        alerts_ref = db.collection('alerts').where('farmer_id', '==', farmer_id)
        alerts = []
        
        for doc in alerts_ref.stream():
            alert_data = doc.to_dict()
            alert_data['id'] = doc.id
            alerts.append(alert_data)
        
        return {
            "status": "success",
            "farmer_id": farmer_id,
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

# NEW CHAT ENDPOINT
@app.post("/api/chat")
async def chat_with_farmer(chat_data: dict):
    """
    Chat endpoint for farmer questions
    Expects: {'farmer_id': 'abc123', 'message': 'How much to water?'}
    """
    try:
        db = firestore.client()
        
        # Get farmer data
        farmer_ref = db.collection('farmers').document(chat_data['farmer_id'])
        farmer_doc = farmer_ref.get()
        
        if not farmer_doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        
        farmer = farmer_doc.to_dict()
        
        # Get current weather and risks
        weather = await analyze_weather(farmer['lat'], farmer['lon'])
        if not weather:
            raise HTTPException(status_code=500, detail="Could not fetch weather data")
        
        risks = calculate_risks(weather, farmer.get('crop', 'default'))
        
        # Generate AI response (simple version - you'll enhance this later)
        response = await generate_chat_response(farmer, chat_data['message'], weather, risks)
        
        # Save to chat history
        chat_history = {
            'farmer_id': chat_data['farmer_id'],
            'user_message': chat_data['message'],
            'bot_response': response,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        db.collection('chat_messages').add(chat_history)
        
        return {"response": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# Simple chat response generator (you'll move this to separate file later)
async def generate_chat_response(farmer, user_question, weather_data, risk_scores):
    """Simple chat response using existing Gemini setup"""
    import google.generativeai as genai
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / '.env')
    
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
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return "I'm having trouble processing your question right now. Please try again later."

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return {
        "status": "error",
        "message": str(exc),
        "endpoint": request.url.path
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)