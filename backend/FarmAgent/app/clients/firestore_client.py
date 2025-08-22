import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / '.env'
if not env_path.exists():
    raise FileNotFoundError(f".env file not found at {env_path}")
load_dotenv(env_path)

def get_firebase_cred_dict():
    required_keys = ["PRIVATE_KEY_ID", "PRIVATE_KEY", "CLIENT_EMAIL", "CLIENT_ID", "CLIENT_X509_CERT_URL"]
    for key in required_keys:
        if not os.getenv(key):
            raise EnvironmentError(f"Missing required env var: {key}")

    return {
        "type": "service_account",
        "project_id": "medsense-a43ee",
        "private_key_id": os.getenv("PRIVATE_KEY_ID"),
        "private_key": os.getenv("PRIVATE_KEY").replace('\\n', '\n'),
        "client_email": os.getenv("CLIENT_EMAIL"),
        "client_id": os.getenv("CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("CLIENT_X509_CERT_URL"),
        "universe_domain": "googleapis.com"
    }

def get_firestore_client():
    if not firebase_admin._apps:
        try:
            cred_dict = get_firebase_cred_dict()
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin initialized")
        except Exception as e:
            raise RuntimeError(f"Firebase initialization failed: {e}")


def get_all_farmers():
    db = get_firestore_client()
    farmers_ref = db.collection('farmers')
    farmers = []

    try:
        for doc in farmers_ref.stream():
            farmer_data = doc.to_dict()
            farmer_data['id'] = doc.id
            farmers.append(farmer_data)
    except Exception as e:
        print(f"Error fetching farmers: {e}")


    return farmers

def save_alert(farmer_id: str, alert_data: dict):
    db = get_firestore_client()
    try:
        alert_data = alert_data.copy()  # avoid mutating input
        alert_data['farmer_id'] = farmer_id
        alert_data['timestamp'] = firestore.SERVER_TIMESTAMP
        db.collection('alerts').add(alert_data)
    except Exception as e:
        print(f"Failed to save alert for {farmer_id}: {e}")

