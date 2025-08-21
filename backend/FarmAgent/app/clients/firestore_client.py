import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from pathlib import Path
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

def get_firestore_client():
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    return firestore.client()

def get_all_farmers():
    db = get_firestore_client()
    farmers_ref = db.collection('farmers')
    farmers = []
    
    for doc in farmers_ref.stream():
        farmer_data = doc.to_dict()
        farmer_data['id'] = doc.id
        farmers.append(farmer_data)
    
    return farmers

def save_alert(farmer_id: str, alert_data: dict):
    db = get_firestore_client()
    alert_data['farmer_id'] = farmer_id
    alert_data['timestamp'] = firestore.SERVER_TIMESTAMP
    db.collection('alerts').add(alert_data)