from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    role = relationship("Role")

class Donor(Base):
    __tablename__ = "donors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20))
    blood_group = Column(String(10), nullable=False)
    contact_number = Column(String(20), nullable=False)
    address = Column(Text)
    last_donation_date = Column(Date)
    total_donations = Column(Integer, default=0)
    is_eligible = Column(Boolean, default=True)

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    hospital_name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    contact_person = Column(String(100), nullable=False)
    contact_number = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=False)

class BloodInventory(Base):
    __tablename__ = "blood_inventory"
    id = Column(Integer, primary_key=True, index=True)
    unit_number = Column(String(100), unique=True, nullable=False)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="RESTRICT"), unique=True, nullable=False)
    blood_group = Column(String(10), nullable=False)
    quantity_ml = Column(Integer, nullable=False)
    collection_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    status = Column(String, default="AVAILABLE")
    created_at = Column(DateTime, server_default=func.now())

class BloodRequest(Base):
    __tablename__ = "blood_requests"
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    blood_group = Column(String(10), nullable=False)
    units_requested = Column(Integer, nullable=False)
    priority = Column(String, default="MEDIUM")
    status = Column(String, default="PENDING")
    request_date = Column(DateTime, server_default=func.now())
    required_date = Column(Date, nullable=False)
    reason = Column(Text)
    handled_by = Column(Integer, ForeignKey("users.id"))
    
    hospital = relationship("Hospital")

class Donation(Base):
    __tablename__ = "donations"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="RESTRICT"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), unique=True)
    blood_group = Column(String(10), nullable=False)
    quantity_ml = Column(Integer, nullable=False)
    donation_date = Column(DateTime, server_default=func.now())
    status = Column(String, default="PENDING")
    blood_pressure = Column(String(20))
    hemoglobin_level = Column(Numeric(5,2))
    medical_notes = Column(Text)
    handled_by = Column(Integer, ForeignKey("users.id"))

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(20), nullable=False) # TIME maps to String for simplicity in FastAPI
    status = Column(String, default="SCHEDULED")
    created_at = Column(DateTime, server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
