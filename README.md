# Blood Bank Management System

A production-level full-stack Blood Bank Management System designed for hospitals, blood banks, and donors. It features a clean, minimalist, and professional UI to emulate a realistic healthcare SaaS dashboard.

## Overview
This platform allows administrators and staff to efficiently manage blood inventory, handle emergency hospital requests, and track donor eligibility. It implements proper relational database principles and strict normalization up to 3NF/BCNF.

## Key Features
- **Donor Management**: Track donors, donations, and 90-day eligibility rules.
- **Blood Inventory Management**: Advanced inventory management with automated expiry tracking and low-stock alerts.
- **Hospital Blood Requests**: Priority-based request workflows (Emergency, High, Medium, Low).
- **Analytics Dashboard**: Real-time insights, bar charts, and KPI cards.
- **Role-Based Access**: Specialized interfaces and routing for Admins, Staff, Hospitals, and Donors.

## Technology Stack
- **Frontend**: React + Vite, TailwindCSS v3, shadcn/ui, Recharts.
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Pydantic validation, JWT.
- **Database**: PostgreSQL (heavy focus on Triggers, Views, and Procedures).

## Project Structure
- `database/` - Contains all raw SQL files, schemas, triggers, and documentation.
- `backend/` - The FastAPI backend application.
- `frontend/` - The React/Vite frontend application.

Please refer to `setup_guide.md` for running the project locally.
