-- Blood Bank Management System - Database Schema
-- PostgreSQL Implementation

-- Enums
CREATE TYPE blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
CREATE TYPE inventory_status_enum AS ENUM ('AVAILABLE', 'RESERVED', 'USED', 'EXPIRED', 'DISCARDED');
CREATE TYPE request_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');
CREATE TYPE request_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE donation_status_enum AS ENUM ('PENDING', 'TESTING', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE appointment_status_enum AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- 1. Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- 2. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status user_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Donors Table (1-to-1 with Users)
CREATE TABLE donors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    blood_group blood_group_enum NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT,
    last_donation_date DATE,
    total_donations INTEGER DEFAULT 0,
    is_eligible BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
);

-- 4. Hospitals Table (1-to-1 with Users)
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE
);

-- 5. Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status appointment_status_enum DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_future_date CHECK (appointment_date >= CURRENT_DATE)
);

-- 6. Donations Table
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES donors(id) ON DELETE RESTRICT,
    appointment_id INTEGER UNIQUE REFERENCES appointments(id) ON DELETE SET NULL,
    blood_group blood_group_enum NOT NULL,
    quantity_ml INTEGER NOT NULL CHECK (quantity_ml > 0 AND quantity_ml <= 600),
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status donation_status_enum DEFAULT 'PENDING',
    blood_pressure VARCHAR(20),
    hemoglobin_level DECIMAL(5,2),
    medical_notes TEXT,
    handled_by INTEGER REFERENCES users(id) -- Staff member who handled it
);

-- 7. Blood Inventory Table (Tracks individual bags/units)
CREATE TABLE blood_inventory (
    id SERIAL PRIMARY KEY,
    unit_number VARCHAR(100) UNIQUE NOT NULL,
    donation_id INTEGER UNIQUE NOT NULL REFERENCES donations(id) ON DELETE RESTRICT,
    blood_group blood_group_enum NOT NULL,
    quantity_ml INTEGER NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status inventory_status_enum DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_expiry CHECK (expiry_date > collection_date)
);

-- 8. Blood Requests Table
CREATE TABLE blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group blood_group_enum NOT NULL,
    units_requested INTEGER NOT NULL CHECK (units_requested > 0),
    priority request_priority_enum DEFAULT 'MEDIUM',
    status request_status_enum DEFAULT 'PENDING',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    required_date DATE NOT NULL,
    reason TEXT,
    handled_by INTEGER REFERENCES users(id), -- Admin/Staff who approved
    CONSTRAINT chk_required_date CHECK (required_date >= CURRENT_DATE)
);

-- 9. Request Fulfillments Table (Mapping requests to specific inventory units)
CREATE TABLE request_fulfillments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    inventory_id INTEGER NOT NULL UNIQUE REFERENCES blood_inventory(id) ON DELETE RESTRICT,
    dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispatched_by INTEGER REFERENCES users(id)
);

-- 10. Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_inventory_status_bg ON blood_inventory(status, blood_group);
CREATE INDEX idx_requests_status ON blood_requests(status);
CREATE INDEX idx_requests_hospital ON blood_requests(hospital_id);
