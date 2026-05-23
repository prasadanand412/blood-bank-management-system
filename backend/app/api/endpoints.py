from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from app.database.session import get_db
from app.models.domain import User, Role, BloodInventory, Donor, Donation, Hospital, BloodRequest
from app.schemas.domain import UserOut, DashboardStats, BloodStock, LoginRequest, Token, BloodInventoryOut, BloodInventoryUpdate, DonorCreate, DonorOut, BloodRequestCreate, BloodRequestOut, BloodRequestStatusUpdate
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
        
        # Get total available blood ml from view
        result_ml = db.execute(text("SELECT SUM(total_ml) FROM available_blood_stock_view")).scalar()
        available_blood_ml = result_ml if result_ml else 0
        
        # Get all pending requests
        result3 = db.execute(text("SELECT COUNT(*) FROM blood_requests WHERE status = 'PENDING'")).scalar()
        pending_requests = result3 if result3 else 0
        
        # Get expiring units from view
        result4 = db.execute(text("SELECT COUNT(*) FROM expiring_inventory_view")).scalar()
        expiring_soon = result4 if result4 else 0
        
        # Get accepted requests
        result5 = db.execute(text("SELECT COUNT(*) FROM blood_requests WHERE status = 'APPROVED'")).scalar()
        accepted_requests = result5 if result5 else 0
        
        # Get fulfilled requests
        result6 = db.execute(text("SELECT COUNT(*) FROM blood_requests WHERE status = 'COMPLETED'")).scalar()
        fulfilled_requests = result6 if result6 else 0
        
        return DashboardStats(
            total_donors=total_donors,
            available_blood_units=available_blood_units,
            available_blood_ml=available_blood_ml,
            pending_requests=pending_requests,
            expiring_soon=expiring_soon,
            accepted_requests=accepted_requests,
            fulfilled_requests=fulfilled_requests
        )
    except Exception as e:
        # Fallback if views are not yet generated in DB
        return DashboardStats(total_donors=0, available_blood_units=0, available_blood_ml=0, pending_requests=0, expiring_soon=0, accepted_requests=0, fulfilled_requests=0)

@router.get("/dashboard/recent-requests")
def get_recent_requests(db: Session = Depends(get_db)):
    try:
        # Query blood_requests joined with hospitals
        sql = text("""
            SELECT h.hospital_name, r.blood_group, r.units_requested, r.request_date
            FROM blood_requests r
            JOIN hospitals h ON r.hospital_id = h.id
            WHERE r.priority = 'EMERGENCY'
            ORDER BY r.request_date DESC
            LIMIT 5
        """)
        result = db.execute(sql).fetchall()
        
        requests = []
        for row in result:
            requests.append({
                "hospital": row[0],
                "blood": row[1],
                "units": row[2],
                "time": str(row[3])
            })
        return requests
    except Exception as e:
        return []

@router.get("/inventory/stock", response_model=List[BloodStock])
def get_blood_stock(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT blood_group, total_units, total_ml FROM available_blood_stock_view")).fetchall()
        return [{"blood_group": row[0], "total_units": row[1], "total_ml": row[2]} for row in result]
    except Exception as e:
        return []

@router.get("/inventory/units", response_model=List[BloodInventoryOut])
def get_inventory_units(db: Session = Depends(get_db)):
    units = db.query(BloodInventory).all()
    return units

@router.patch("/inventory/units/{unit_id}", response_model=BloodInventoryOut)
def update_inventory_unit(unit_id: int, request: BloodInventoryUpdate, db: Session = Depends(get_db)):
    unit = db.query(BloodInventory).filter(BloodInventory.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Inventory unit not found")
    
    unit.status = request.status
    db.commit()
    db.refresh(unit)
    return unit

@router.get("/donors", response_model=List[DonorOut])
def get_donors(db: Session = Depends(get_db)):
    from datetime import datetime
    donors = db.query(Donor).order_by(Donor.id.desc()).all()
    result = []
    for d in donors:
        latest_donation = db.query(Donation).filter(Donation.donor_id == d.id).order_by(Donation.donation_date.desc()).first()
        notes = latest_donation.medical_notes if latest_donation and latest_donation.medical_notes else "None"
        
        donation_dt_str = "Never"
        time_to_expiry = "N/A"
        if latest_donation and latest_donation.donation_date:
            donation_dt_str = latest_donation.donation_date.strftime("%Y-%m-%d %H:%M")
            inventory = db.query(BloodInventory).filter(BloodInventory.donation_id == latest_donation.id).first()
            if inventory and inventory.expiry_date:
                delta = inventory.expiry_date - datetime.now().date()
                if delta.days < 0:
                    time_to_expiry = "Expired"
                elif delta.days == 0:
                    time_to_expiry = "Expires today"
                else:
                    time_to_expiry = f"{delta.days} days"
        
        result.append(DonorOut(
            id=d.id,
            name=f"{d.first_name} {d.last_name}",
            bloodGroup=d.blood_group,
            donationDateTime=donation_dt_str,
            timeToExpiry=time_to_expiry,
            status="Eligible" if d.is_eligible else "Deferred",
            medicalNotes=notes
        ))
    return result

from sqlalchemy.exc import IntegrityError

@router.post("/donors", response_model=DonorOut)
def register_donor_and_donation(request: DonorCreate, db: Session = Depends(get_db)):
    import uuid
    # Create Dummy User for Donor
    dummy_email = f"donor.{uuid.uuid4().hex[:8]}@bloodbank.local"
    new_user = User(
        email=dummy_email,
        password_hash="dummy_hash",
        role_id=4 # Donor role
    )
    db.add(new_user)
    db.flush()
    
    try:
        # Create Donor
        new_donor = Donor(
            user_id=new_user.id,
            first_name=request.firstName,
            last_name=request.lastName,
            date_of_birth=request.dob,
            gender=request.gender,
            blood_group=request.bloodGroup,
            contact_number=request.contact,
            address=request.address,
            last_donation_date=request.donationDateTime.date(),
            total_donations=0,
            is_eligible=True
        )
        db.add(new_donor)
        db.flush()
        
        # Create Donation (as PENDING)
        new_donation = Donation(
            donor_id=new_donor.id,
            blood_group=request.bloodGroup,
            quantity_ml=request.quantity,
            status="PENDING",
            blood_pressure=request.bloodPressure,
            hemoglobin_level=request.hemoglobin,
            medical_notes=request.medicalNotes,
            handled_by=1 # Assuming admin user ID 1
        )
        db.add(new_donation)
        db.flush()
        
        # Call stored procedure to complete donation and add to inventory
        unit_number = f"UNIT-{request.bloodGroup}-{uuid.uuid4().hex[:6].upper()}"
        db.execute(
            text("CALL register_donation_completion(:don_id, CAST(:unit_no AS VARCHAR), 35)"),
            {"don_id": new_donation.id, "unit_no": unit_number}
        )
        db.commit()
        db.refresh(new_donor)
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e)
        if "chk_age" in error_msg:
            raise HTTPException(status_code=400, detail="Donor must be at least 18 years old.")
        raise HTTPException(status_code=400, detail="Database constraint violated. Please check the provided data.")
    
    return DonorOut(
        id=new_donor.id,
        name=f"{new_donor.first_name} {new_donor.last_name}",
        bloodGroup=new_donor.blood_group,
        donationDateTime=request.donationDateTime.strftime("%Y-%m-%d %H:%M"),
        timeToExpiry="35 days",
        status="Eligible",
        medicalNotes=request.medicalNotes or "None"
    )

@router.delete("/donors/{donor_id}")
def delete_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    # Because of cascade constraints or restrictions, deleting a donor might fail if they have donations/inventory.
    # In a real app we'd archive them. For now, try deleting the associated user which cascades down to donor.
    try:
        db.delete(donor)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete donor due to existing records (e.g. donations).")
    return {"message": "Donor deleted successfully"}

@router.get("/requests", response_model=List[BloodRequestOut])
def get_requests(db: Session = Depends(get_db)):
    requests = db.query(BloodRequest).order_by(BloodRequest.id.desc()).all()
    result = []
    for r in requests:
        hospital_name = r.hospital.hospital_name if r.hospital else "Unknown Hospital"
        result.append(BloodRequestOut(
            id=r.id,
            hospital=hospital_name,
            bloodGroup=r.blood_group,
            units=r.units_requested,
            priority=r.priority.capitalize() if r.priority else "Medium",
            date=str(r.required_date),
            status=r.status.capitalize() if r.status else "Pending"
        ))
    return result

@router.post("/requests", response_model=BloodRequestOut)
def create_request(request: BloodRequestCreate, db: Session = Depends(get_db)):
    import uuid
    # Create Dummy Hospital User if not exists
    # To keep it simple, we create a new user and hospital for each request unless matched
    dummy_email = f"hospital.{uuid.uuid4().hex[:8]}@bloodbank.local"
    new_user = User(email=dummy_email, password_hash="dummy", role_id=3) # Hospital role
    db.add(new_user)
    db.flush()
    
    new_hospital = Hospital(
        user_id=new_user.id,
        hospital_name=request.hospitalName,
        license_number=uuid.uuid4().hex[:10],
        contact_person="Dr. Default",
        contact_number="1234567890",
        address="123 Hospital Way"
    )
    db.add(new_hospital)
    db.flush()
    
    new_request = BloodRequest(
        hospital_id=new_hospital.id,
        blood_group=request.bloodGroup,
        units_requested=request.units,
        priority=request.priority.upper(),
        required_date=request.requiredDate,
        reason=request.reason,
        status="PENDING"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return BloodRequestOut(
        id=new_request.id,
        hospital=new_hospital.hospital_name,
        bloodGroup=new_request.blood_group,
        units=new_request.units_requested,
        priority=new_request.priority.capitalize(),
        date=str(new_request.required_date),
        status="Pending"
    )

@router.patch("/requests/{request_id}/status", response_model=BloodRequestOut)
def update_request_status(request_id: int, update: BloodRequestStatusUpdate, db: Session = Depends(get_db)):
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    new_status = update.status.upper()
    
    # If the new status is APPROVED, call the stored procedure to allocate inventory!
    if new_status == "APPROVED" and req.status == "PENDING":
        try:
            db.execute(text("CALL approve_blood_request(:req_id, 1)"), {"req_id": req.id})
            db.commit()
        except Exception as e:
            db.rollback()
            error_str = str(e)
            clean_error = "An unexpected error occurred while allocating inventory."
            if "Insufficient stock" in error_str:
                # Extract just the "Insufficient stock..." part
                parts = error_str.split("CONTEXT:")[0].split(")")
                clean_error = parts[-1].strip() if len(parts) > 1 else "Not enough blood units in inventory to fulfill this request!"
            
            raise HTTPException(status_code=400, detail=clean_error)
    else:
        # Just update status manually
        req.status = new_status
        db.commit()
        
    db.refresh(req)
    hospital_name = req.hospital.hospital_name if req.hospital else "Unknown Hospital"
    return BloodRequestOut(
        id=req.id,
        hospital=hospital_name,
        bloodGroup=req.blood_group,
        units=req.units_requested,
        priority=req.priority.capitalize(),
        date=str(req.required_date),
        status=req.status.capitalize()
    )
