# Setup Guide

Follow these steps to run the Blood Bank Management System locally.

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL (14+)

## 1. Database Setup
1. Create a PostgreSQL database named `bloodbank`.
2. Execute the raw SQL files located in the `database/` folder in the following order:
   - `schema.sql` (Creates tables)
   - `triggers.sql` (Creates triggers)
   - `procedures.sql` (Creates stored procedures)
   - `views.sql` (Creates views)
   - `seed.sql` (Populates dummy data)

## 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/MacOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `POSTGRES_USER` and `POSTGRES_PASSWORD` in `.env`.
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.

## 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.
