
import os, asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlmodel import Session, select
from .models import Farmer, Alert
from .clients.weather import fetch_onecall, derive_features
from .agents.risk_engine import compute_fdi, compute_ior, irrigation_action
from .agents.reasoner import compose_advisory
from .agents.notifier import send_whatsapp_text

def _temp_window_ok(crop: str, hourly: list) -> bool:
    temps = [h.get("temp", 0) for h in hourly[:24]]
    if not temps:
        return False
    t = sorted(temps)[len(temps)//2]
    ranges = {"tomato": (10, 25), "potato": (10, 25), "rice": (20, 32), "maize": (20, 34)}
    lo, hi = ranges.get(crop.lower(), (18, 32))
    return lo <= t <= hi

def _rain_recent(hourly: list) -> bool:
    return any(((h.get("rain") or {}).get("1h", 0) or 0) > 0 for h in hourly[:24])

def _dry_spell_upcoming(hourly: list) -> bool:
    return all(((h.get("rain") or {}).get("1h", 0) or 0) == 0 for h in hourly[24:48])

def _wind_ok(hourly: list) -> bool:
    return any((h.get("wind_speed", 0) or 0) >= 5 for h in hourly[:48])

def _rain_next48_prob(hourly: list) -> float:
    rainy = sum(1 for h in hourly[:48] if ((h.get("rain") or {}).get("1h", 0) or 0) > 0)
    return rainy/48.0

def _water_need_proxy(daily: list) -> float:
    if not daily:
        return 0.3
    tmax = daily[0].get("temp", {}).get("max", 30)
    pop = daily[0].get("pop", 0.0)  # 0..1
    val = 0.2 + max(0, (tmax-30))/20.0 - pop*0.3
    return max(0.0, min(1.0, val))

def init_scheduler(engine):
    sched = BackgroundScheduler(timezone=os.getenv("TZ", "Asia/Kolkata"))
    # run at 06:00 IST daily
    sched.add_job(lambda: asyncio.run(run_pipeline_once(engine)), CronTrigger(hour=6, minute=0))
    sched.start()

async def _process_farmer(session, farmer: Farmer):
    onecall = await fetch_onecall(farmer.lat, farmer.lon)
    feats = derive_features(onecall)
    hourly, daily = feats["hourly"], feats["daily"]
    fdi = compute_fdi(feats["wet_hours_24"], _temp_window_ok(farmer.crop, hourly), feats["rain_last24_mm"])
    ior = compute_ior(_temp_window_ok(farmer.crop, hourly), _rain_recent(hourly), _dry_spell_upcoming(hourly), _wind_ok(hourly))
    irr = irrigation_action(_rain_next48_prob(hourly), _water_need_proxy(daily))
    signals = {"fdi": fdi, "ior": ior, "irrigation_action": irr}
    adv = compose_advisory(farmer.model_dump(), signals)
    # Build text
    text_lines = [adv["headline"], f"Risk -> {adv['rationale']}"]
    for a in adv["actions"]:
        text_lines.append(f"- {a['what']} ({a['when']})")
    text = "\n".join(text_lines)
    # Send
    res = await send_whatsapp_text(text, to=farmer.phone if farmer.whatsapp_opt_in else None)
    # Log alert
    alert = Alert(farmer_id=farmer.id, risk_json=str(signals), message=text, channel="whatsapp", status=res.get("status", "sent"))
    session.add(alert)
    session.commit()

def run_pipeline_once(engine) -> int:
    from sqlmodel import Session, select
    # APScheduler expects sync; we create a loop to run async parts
    async def _run():
        count = 0
        with Session(engine) as session:
            farmers = session.exec(select(Farmer)).all()
            for f in farmers:
                try:
                    await _process_farmer(session, f)
                    count += 1
                except Exception as e:
                    # You might want to log errors here
                    pass
        return count
    return asyncio.get_event_loop().run_until_complete(_run())
