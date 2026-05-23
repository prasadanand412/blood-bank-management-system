import sys
import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings
from app.schemas.domain import DonorCreate
from app.api.endpoints import register_donor_and_donation
from datetime import datetime, date

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

payload = {
    "firstName": "Manthan",
    "lastName": "Gaikwad",
    "dob": "2026-05-23",
    "gender": "Male",
    "bloodGroup": "A+",
    "contact": "7418529632",
    "address": "",
    "bloodPressure": "125/80",
    "hemoglobin": 14.5,
    "quantity": 450,
    "donationDateTime": "2026-05-23T10:27",
    "medicalNotes": "None"
}

try:
    req = DonorCreate(**payload)
    res = register_donor_and_donation(req, db)
    print("Success:", res)
except Exception as e:
    print("Exception:")
    traceback.print_exc()
