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
    available_blood_ml: int
    pending_requests: int
    expiring_soon: int
    accepted_requests: int
    fulfilled_requests: int

class BloodStock(BaseModel):
    blood_group: str
    total_units: int
    total_ml: int

# Auth Login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Blood Inventory
class BloodInventoryOut(BaseModel):
    id: int
    unit_number: str
    blood_group: str
    quantity_ml: int
    collection_date: date
    expiry_date: date
    status: str
    
    class Config:
        from_attributes = True

class BloodInventoryUpdate(BaseModel):
    status: str

# Donors
class DonorCreate(BaseModel):
    firstName: str
    lastName: str
    dob: date
    gender: str
    bloodGroup: str
    contact: str
    address: Optional[str] = None
    bloodPressure: str
    hemoglobin: float
    quantity: int
    donationDateTime: datetime
    medicalNotes: Optional[str] = None

class DonorOut(BaseModel):
    id: int
    name: str
    bloodGroup: str
    donationDateTime: Optional[str] = None
    timeToExpiry: Optional[str] = None
    unitNumber: Optional[str] = None
    status: str
    medicalNotes: Optional[str] = None

# Blood Requests
class BloodRequestCreate(BaseModel):
    hospitalName: str
    bloodGroup: str
    units: int
    priority: str
    requiredDate: date
    reason: str

class BloodRequestOut(BaseModel):
    id: int
    hospital: str
    bloodGroup: str
    units: int
    priority: str
    date: str
    status: str

class BloodRequestStatusUpdate(BaseModel):
    status: str
