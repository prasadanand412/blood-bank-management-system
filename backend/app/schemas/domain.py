from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: int

class UserOut(UserBase):
    id: int
    role_id: int
    status: str
    
    class Config:
        from_attributes = True

# Dashboard Stats (Custom Schema)
class DashboardStats(BaseModel):
    total_donors: int
    available_blood_units: int
    pending_requests: int
    expiring_soon: int

class BloodStock(BaseModel):
    blood_group: str
    total_units: int
    total_ml: int

# Auth Login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
