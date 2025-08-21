import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the correct location (FarmAgent folder)
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

PERISKOPE_API_KEY = os.getenv("PERISKOPE_API_KEY")
PERISKOPE_PHONE_ID = os.getenv("PERISKOPE_PHONE_ID", "")
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:3000")

def send_whatsapp_alert(phone_number: str, message: str) -> bool:
    """
    Send a WhatsApp message via Periskope MCP Server.
    - phone_number: recipient's WhatsApp number with country code (e.g., "+919876543210")
    - message: text content to send
    Returns True on success, False on failure.
    """
    if not PERISKOPE_API_KEY:
        print("❌ ERROR: PERISKOPE_API_KEY missing in .env")
        return False

    if not PERISKOPE_PHONE_ID:
        print("❌ ERROR: PERISKOPE_PHONE_ID missing in .env (get from Periskope dashboard)")
        return False

    # Clean phone number (remove spaces, keep + and digits)
    clean_phone = ''.join(filter(lambda x: x in '+0123456789', phone_number))
    if not clean_phone.startswith('+'):
        print(f"❌ ERROR: Phone number must include country code: {phone_number}")
        return False

    # MCP Server endpoint
    url = f"{MCP_SERVER_URL}/messages/send"
    
    headers = {
        "Authorization": f"Bearer {PERISKOPE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "to": clean_phone,      # Full international format: "+919876543210"
        "message": message,     # The message content
        "phone_id": PERISKOPE_PHONE_ID  # Your Periskope phone identifier
    }

    try:
        print(f"📤 Sending WhatsApp to {clean_phone} via MCP server...")
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        
        # Check for successful response
        if resp.status_code == 200:
            print(f"✅ WhatsApp sent successfully to {clean_phone}")
            print(f"📨 Response: {resp.text}")
            return True
        else:
            print(f"❌ Periskope API Error: Status {resp.status_code}")
            print(f"📄 Response: {resp.text}")
            return False
            
    except requests.ConnectionError:
        print(f"❌ Connection failed: MCP server not running at {MCP_SERVER_URL}")
        print("💡 Start MCP server with: npx -y @periskope/whatsapp-mcp")
        return False
        
    except requests.Timeout:
        print(f"❌ Request timeout: MCP server not responding at {MCP_SERVER_URL}")
        return False
        
    except requests.RequestException as e:
        print(f"❌ WhatsApp send failed for {clean_phone}: {e}")
        return False

# Test function to verify MCP server connection
def test_mcp_connection():
    """Test if MCP server is running and accessible"""
    try:
        test_url = f"{MCP_SERVER_URL}/health"
        response = requests.get(test_url, timeout=5)
        if response.status_code == 200:
            print("✅ MCP Server is running and accessible")
            return True
        else:
            print(f"❌ MCP Server returned status: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ MCP Server not available: {e}")
        print("💡 Start it with: npx -y @periskope/whatsapp-mcp")
        return False

# Quick test if run directly
if __name__ == "__main__":
    print("🧪 Testing Periskope MCP connection...")
    if test_mcp_connection():
        print("✅ MCP connection test passed!")
    else:
        print("❌ MCP connection test failed!")