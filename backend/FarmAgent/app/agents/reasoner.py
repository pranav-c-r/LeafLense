import os, json
from datetime import datetime

# Placeholder reasoner that formats a concise advisory from inputs.
# Replace with an LLM call (DeepSeek/Gemini) during integration.
def compose_advisory(farmer: dict, signals: dict) -> dict:
    fdi = signals.get("fdi", 0.0)
    ior = signals.get("ior", 0.0)
    irr = signals.get("irrigation_action", "monitor")
    district = farmer.get("district") or "your area"
    crop = farmer.get("crop")
    lang = farmer.get("language", "en")
    headline = f"{crop.title()} advisory for {district}"
    actions = []
    if irr == "skip":
        actions.append({"what": "Skip irrigation", "when": "today", "how_much": "-", "caution": "Rain likely in next 48h"})
    elif irr == "irrigate":
        actions.append({"what": "Irrigate field", "when": "today evening or early morning", "how_much": "Light irrigation (2–3 cm)", "caution": "Avoid waterlogging"})
    if fdi >= 0.7:
        actions.append({"what": "Fungal disease risk high: inspect lower leaves, remove infected parts", "when": "today", "how_much": "-", "caution": "Prefer IPM/organic options where possible"})
    if ior >= 0.7:
        actions.append({"what": "Insect risk high: install pheromone/sticky traps, monitor twice daily", "when": "next 48h", "how_much": "5–8 traps/acre", "caution": "Targeted spray only if threshold crossed"})
    if not actions:
        actions.append({"what": "Conditions normal", "when": "this week", "how_much": "-", "caution": "Keep monitoring weather updates"})
    advisory = {
        "language": lang,
        "headline": headline,
        "actions": actions,
        "rationale": f"disease={fdi}, insect={ior}, irrigation={irr}",
        "urgency": "high" if max(fdi, ior) >= 0.7 else ("medium" if max(fdi, ior) >= 0.4 else "low")
    }
    return advisory
