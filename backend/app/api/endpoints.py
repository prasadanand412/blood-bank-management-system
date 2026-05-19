from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from app.database.session import get_db
from app.models.domain import User, Role
from app.schemas.domain import UserOut, DashboardStats, BloodStock, LoginRequest, Token
from app.config.settings import settings

# Dummy auth tools for demonstration
import jwt
from datetime import datetime, timedelta

router = APIRouter()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/auth/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    # Normally check password hash here
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Leveraging the PostgreSQL views we created!
    try:
        # Get total active donors from view
        result = db.execute(text("SELECT COUNT(*) FROM active_donors_view")).scalar()
        total_donors = result if result else 0
        
        # Get total available blood units from view
        result2 = db.execute(text("SELECT SUM(total_units) FROM available_blood_stock_view")).scalar()
        available_blood_units = result2 if result2 else 0
        
        # Get pending emergency requests
        result3 = db.execute(text("SELECT COUNT(*) FROM emergency_requests_view")).scalar()
        pending_requests = result3 if result3 else 0
        
        # Get expiring units from view
        result4 = db.execute(text("SELECT COUNT(*) FROM expiring_inventory_view")).scalar()
        expiring_soon = result4 if result4 else 0
        
        return DashboardStats(
            total_donors=total_donors,
            available_blood_units=available_blood_units,
            pending_requests=pending_requests,
            expiring_soon=expiring_soon
        )
    except Exception as e:
        # Fallback if views are not yet generated in DB
        return DashboardStats(total_donors=0, available_blood_units=0, pending_requests=0, expiring_soon=0)

@router.get("/inventory/stock", response_model=List[BloodStock])
def get_blood_stock(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT blood_group, total_units, total_ml FROM available_blood_stock_view")).fetchall()
        return [{"blood_group": row[0], "total_units": row[1], "total_ml": row[2]} for row in result]
    except Exception as e:
        return []
