# agents/weather_agent.py
import aiohttp
import os, httpx, math
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(env_path)  
API_KEY = os.getenv("OWM_API_KEY")
async def analyze_weather(lat: float, lon: float) -> dict:
    """
    Fetch weather data from API and ensure all required keys exist.
    Returns a dict with defaults if missing.
    """
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as resp:
                data = await resp.json()
        except Exception as e:
            print(f"Weather API error: {e}")
            data = {}

    weather = {
        'current_temp': data.get('current_temp', data.get('avg_temp', 25)),
        'avg_temp': data.get('avg_temp', 25),
        'total_rainfall': data.get('total_rainfall', 0),
        'wet_hours': data.get('wet_hours', 0),
        'max_wind_speed': data.get('max_wind_speed', 0),
        'humidity': data.get('humidity', 50),
        'conditions': data.get('conditions', "Unknown")
    }

    return weather
