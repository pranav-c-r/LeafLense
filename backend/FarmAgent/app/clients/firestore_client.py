import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from pathlib import Path



def get_firestore_client():
    if not firebase_admin._apps:
        try:
            # This will automatically find the GOOGLE_APPLICATION_CREDENTIALS
            # environment variable and use the JSON file it points to.
            # No need to build a dictionary manually.

            # Build the absolute path to the json file in the backend folder
            backend_dir = Path(__file__).resolve().parents[3]
            cred_path = backend_dir / os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin initialized successfully from JSON file.")

        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            # Re-raise the exception to stop the application if Firebase fails
            raise RuntimeError(f"Firebase initialization failed: {e}")

    return firestore.client()



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

