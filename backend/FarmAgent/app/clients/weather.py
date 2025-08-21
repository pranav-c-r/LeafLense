import requests
import os, httpx, math
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(env_path)  
API_KEY = os.getenv("OWM_API_KEY")  
BASE_URL = "https://api.tomorrow.io/v4/weather/realtime"

def get_weather(city):
    try:
        # Build request
        params = {
            "location": city,
            "apikey": API_KEY
        }
        response = requests.get(BASE_URL, params=params)

        if response.status_code != 200:
            return {"error": f"API error: {response.status_code} {response.text}"}

        data = response.json()

        # Extract weather data
        values = data.get("data", {}).get("values", {})
        if not values:
            return {"error": "No weather data available"}

        weather_info = {
            "temperature": values.get("temperature"),
            "humidity": values.get("humidity"),
            "wind_speed": values.get("windSpeed"),
            "cloud_cover": values.get("cloudCover"),
            "rain_intensity": values.get("rainIntensity"),
            "city": city
        }

        return weather_info

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    city = input("Enter city name: ")
    weather = get_weather(city)
    print(weather)
