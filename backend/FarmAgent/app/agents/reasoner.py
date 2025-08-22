import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

# Go up 3 levels: agents -> app -> FarmAgent -> backend
env_path = Path(__file__).parents[2] / '.env'
load_dotenv(env_path)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

async def generate_advice(farmer: dict, weather: dict, risks: dict) -> str:
    prompt = f"""
    Create urgent weather advisory for farmer. MAX 160 CHARACTERS.

    FARMER: {farmer.get('name')} - {farmer.get('crop')} ({farmer.get('growth_stage')})
    LOCATION: {farmer.get('district')}
    
    WEATHER: {weather['current_temp']}°C, {weather['humidity']}% humidity, {weather['conditions']}
    RAIN: {weather['total_rainfall']}mm last 24h, {weather['wet_hours']} humid hours
    
    RISKS: Disease {risks['disease_risk']*100}%, Pests {risks['pest_risk']*100}%
    ACTION: {risks['irrigation_action'].upper()} irrigation

    Write direct, urgent message in English. No greetings. Just critical actions.
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip().replace('*', '').replace('#', '')[:160]
    except Exception as e:
        print(f"Gemini API failed: {e}")
        return f"URGENT: {risks['disease_risk']*100}% disease risk. {risks['irrigation_action'].upper()} irrigation for {farmer.get('crop')}."
