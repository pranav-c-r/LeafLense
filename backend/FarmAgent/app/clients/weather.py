import os, httpx, math
from datetime import datetime, timezone, timedelta

OWM_API_KEY = os.getenv("OWM_API_KEY", "")

BASE_URL = "https://api.openweathermap.org/data/3.0/onecall"

async def fetch_onecall(lat: float, lon: float):
    if not OWM_API_KEY:
        raise RuntimeError("OWM_API_KEY missing")
    params = {
        "lat": lat, "lon": lon, "appid": OWM_API_KEY,
        "units": "metric", "exclude": "minutely"
    }
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(BASE_URL, params=params)
        r.raise_for_status()
        data = r.json()
    return data

def derive_features(onecall: dict):
    hourly = onecall.get("hourly", [])[:48]
    daily = onecall.get("daily", [])[:4]
    wet_hours = 0
    rain_last24 = 0.0
    for i, h in enumerate(hourly[:24]):
        rh = h.get("humidity", 0)
        rain = (h.get("rain") or {}).get("1h", 0.0)
        if rh >= 85 or rain > 0:
            wet_hours += 1
        rain_last24 += rain or 0.0
    # basic summary
    return {
        "wet_hours_24": wet_hours,
        "rain_last24_mm": round(rain_last24, 1),
        "hourly": hourly,
        "daily": daily,
        "alerts": onecall.get("alerts", []),
    }
