from math import exp

def sigmoid(x: float) -> float:
    return 1 / (1 + exp(-x))

def compute_fdi(wet_hours_24: int, temp_window_ok: bool, rain_recent_mm: float) -> float:
    score = 0.5 * (wet_hours_24/24) + 0.3 * (1 if temp_window_ok else 0) + 0.2 * (1 if rain_recent_mm >= 5 else 0)
    return round(sigmoid(4*(score-0.5)), 3)  # sharpen

def compute_ior(temp_window_ok: bool, rain_recent: bool, dry_spell: bool, wind_ok: bool) -> float:
    x = 0.4*(1 if temp_window_ok else 0) + 0.3*(1 if rain_recent else 0) + 0.2*(1 if dry_spell else 0) + 0.1*(1 if wind_ok else 0)
    return round(sigmoid(4*(x-0.5)), 3)

def irrigation_action(rain_next48_prob: float, water_need_proxy: float) -> str:
    if rain_next48_prob >= 0.6:
        return "skip"
    if water_need_proxy > 0.5:
        return "irrigate"
    return "monitor"
