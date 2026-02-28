import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Header, HTTPException
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "frontend", ".env"))

# Firebase admin initialization
try:
    auth_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
    if os.path.exists(auth_path):
        cred = credentials.Certificate(auth_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Firebase service account file not found at {auth_path}. JWT verification disabled for dev.")
except ValueError:
    pass # Already initialized

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Invalid authorization header')
    
    token = authorization.split(' ')[1]
    
    # Check if Firebase is actualy initialized
    if not len(firebase_admin._apps):
        # Mock auth for dev if no Firebase configs present
        if token == "dev-token-xyz":
            return {"uid": "test_user_123", "email": "test@marketplay.ai"}
        raise HTTPException(status_code=401, detail='Firebase not initialized. Provide actual credentials.')
        
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f'Invalid token: {str(e)}')
