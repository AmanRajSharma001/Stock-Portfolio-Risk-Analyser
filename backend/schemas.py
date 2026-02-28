from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PortfolioBase(BaseModel):
    ticker: str
    quantity: float

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    firebase_uid: str
    email: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    portfolios: List[PortfolioResponse] = []
    
    class Config:
        from_attributes = True
