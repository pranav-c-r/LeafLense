import os, httpx

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID", "")
DEFAULT_TO = os.getenv("DEFAULT_TO_NUMBER", "")

GRAPH_URL = "https://graph.facebook.com/v21.0"

async def send_whatsapp_text(text: str, to: str | None = None) -> dict:
    if not (WHATSAPP_TOKEN and WHATSAPP_PHONE_ID):
        return {"status": "skipped", "reason": "missing_whatsapp_config"}
    to = to or DEFAULT_TO
    url = f"{GRAPH_URL}/{WHATSAPP_PHONE_ID}/messages"
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}", "Content-Type": "application/json"}
    payload = {"messaging_product": "whatsapp", "to": to, "type": "text", "text": {"body": text}}
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(url, headers=headers, json=payload)
        try:
            r.raise_for_status()
            return {"status": "sent", "response": r.json()}
        except Exception:
            return {"status": "failed", "response": r.text}
