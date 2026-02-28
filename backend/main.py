from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db
from auth import verify_token
import yfinance as yf
from typing import List
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin using service account JSON
try:
    if not len(firebase_admin._apps):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Firebase Admin init failed - {e}")
# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Stock Analyzer API", description="Institutional Portfolio SaaS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "MarketPlay AI Backend"}

class TokenRequest(schemas.BaseModel):
    token: str

@app.post("/auth/verify")
def verify_firebase_token(request: TokenRequest):
    import firebase_admin.auth
    try:
        decoded_token = firebase_admin.auth.verify_id_token(request.token)
        return {
            "status": "success",
            "user": {
                "uid": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name", ""),
                "picture": decoded_token.get("picture", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.post("/portfolio/connect")
def connect_portfolio(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Simulates Plaid Connection capturing User's broker data."""
    uid = token_data.get("uid")
    user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Simulated Plaid Data Response
    dummy_assets = [
        {"ticker": "AAPL", "quantity": 15.5},
        {"ticker": "MSFT", "quantity": 10.0},
        {"ticker": "GOOGL", "quantity": 25.0}
    ]
    
    # Wipe old portofolio for demo replacing flow
    db.query(models.Portfolio).filter(models.Portfolio.user_id == user.id).delete()
    
    for asset in dummy_assets:
        item = models.Portfolio(user_id=user.id, ticker=asset["ticker"], quantity=asset["quantity"])
        db.add(item)
        
    db.commit()
    return {"message": "Portfolio connected via Plaid Sandbox", "assets": dummy_assets}

@app.get("/portfolio", response_model=List[schemas.PortfolioResponse])
def get_portfolio(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    uid = token_data.get("uid")
    user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    assets = db.query(models.Portfolio).filter(models.Portfolio.user_id == user.id).all()
    return assets

@app.delete("/portfolio")
def clear_portfolio(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    uid = token_data.get("uid")
    user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.query(models.Portfolio).filter(models.Portfolio.user_id == user.id).delete()
    db.commit()
    return {"message": "Portfolio disconnected successfully"}
