import requests
import os

# Test if the API is working
api_url = "http://127.0.0.1:8000/plant/disease/predict"

# Check if image file exists
image_path = "rust_fungus-min_1024x1024.png"
if not os.path.exists(image_path):
    print(f"❌ Image file not found: {image_path}")
    print("📝 Available files in current directory:")
    for file in os.listdir("."):
        if file.endswith(('.png', '.jpg', '.jpeg')):
            print(f"   - {file}")
else:
    print(f"✅ Image file found: {image_path}")
    
    try:
        # Test the API
        with open(image_path, 'rb') as f:
            files = {'file': (image_path, f, 'image/png')}
            response = requests.post(api_url, files=files)
            
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Error testing API: {e}")

# Also test basic API health
try:
    health_response = requests.get("http://127.0.0.1:8000/")
    print(f"📊 Health check status: {health_response.status_code}")
except Exception as e:
    print(f"❌ Server not responding: {e}")
