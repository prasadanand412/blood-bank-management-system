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
-- Blood Bank Management System - Database Triggers

-- 1. Trigger to update inventory status when fulfilled
CREATE OR REPLACE FUNCTION update_inventory_on_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE blood_inventory
    SET status = 'USED', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.inventory_id AND status = 'AVAILABLE';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory unit is not available for fulfillment';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory_on_fulfillment
AFTER INSERT ON request_fulfillments
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_fulfillment();

-- 2. Trigger to prevent expired blood usage
CREATE OR REPLACE FUNCTION check_expired_blood_usage()
RETURNS TRIGGER AS $$
DECLARE
    v_expiry_date DATE;
BEGIN
    SELECT expiry_date INTO v_expiry_date
    FROM blood_inventory
    WHERE id = NEW.inventory_id;
    
    IF v_expiry_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot use expired blood unit';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_expired_blood_usage
BEFORE INSERT ON request_fulfillments
FOR EACH ROW
EXECUTE FUNCTION check_expired_blood_usage();

-- 3. Trigger for low stock alert
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_count INTEGER;
BEGIN
    -- Check stock for the blood group of the updated/inserted inventory
    IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Using TG_OP to dynamically get blood_group might be tricky in DELETE, so we handle INSERT/UPDATE
    SELECT COUNT(*) INTO v_stock_count
    FROM blood_inventory
    WHERE blood_group = NEW.blood_group AND status = 'AVAILABLE';
    
    -- Alert if stock is below 10 units
    IF v_stock_count < 10 THEN
        -- Insert a notification for all admin users (role_id = 1 usually)
        INSERT INTO notifications (user_id, title, message, type)
        SELECT users.id, 'Low Stock Alert', 'Blood group ' || NEW.blood_group || ' is running low. Only ' || v_stock_count || ' units available.', 'ALERT'
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE roles.name = 'Admin';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_low_stock
AFTER INSERT OR UPDATE OF status ON blood_inventory
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- 4. Trigger to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value)
        VALUES (
            current_setting('app.current_user_id', true)::integer, -- Assuming backend sets this, or NULL if not set
            'UPDATE_STATUS',
            'blood_inventory',
            NEW.id,
            json_build_object('status', OLD.status),
            json_build_object('status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_inventory_changes
AFTER UPDATE ON blood_inventory
FOR EACH ROW
EXECUTE FUNCTION log_inventory_changes();

-- 5. Trigger to automatically update donor's last donation date
CREATE OR REPLACE FUNCTION update_donor_last_donation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        UPDATE donors
        SET last_donation_date = NEW.donation_date::date,
            total_donations = total_donations + 1
        WHERE id = NEW.donor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_donor_last_donation
AFTER UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_donor_last_donation();
-- Blood Bank Management System - Database Stored Procedures & Functions

-- 1. Procedure: Approve Blood Request
-- Allocates available inventory units to fulfill a blood request
CREATE OR REPLACE PROCEDURE approve_blood_request(
    p_request_id INTEGER,
    p_handled_by INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_blood_group blood_group_enum;
    v_units_requested INTEGER;
    v_status request_status_enum;
    v_available_units INTEGER;
    v_inventory_id INTEGER;
    v_allocated_count INTEGER := 0;
BEGIN
    -- Get request details
    SELECT blood_group, units_requested, status 
    INTO v_blood_group, v_units_requested, v_status
    FROM blood_requests 
    WHERE id = p_request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Blood request ID % does not exist', p_request_id;
    END IF;
    
    IF v_status != 'PENDING' THEN
        RAISE EXCEPTION 'Request is already %', v_status;
    END IF;
    
    -- Check available units
    SELECT COUNT(*) INTO v_available_units
    FROM blood_inventory
    WHERE blood_group = v_blood_group AND status = 'AVAILABLE';
    
    IF v_available_units < v_units_requested THEN
        RAISE EXCEPTION 'Insufficient stock. Requested: %, Available: %', v_units_requested, v_available_units;
    END IF;
    
    -- Allocate units (FIFO - First Expiring First Out)
    FOR v_inventory_id IN 
        SELECT id FROM blood_inventory 
        WHERE blood_group = v_blood_group AND status = 'AVAILABLE' 
        ORDER BY expiry_date ASC 
        LIMIT v_units_requested
    LOOP
        INSERT INTO request_fulfillments (request_id, inventory_id, dispatched_by)
        VALUES (p_request_id, v_inventory_id, p_handled_by);
        
        v_allocated_count := v_allocated_count + 1;
    END LOOP;
    
    -- Update request status
    IF v_allocated_count = v_units_requested THEN
        UPDATE blood_requests 
        SET status = 'APPROVED', handled_by = p_handled_by
        WHERE id = p_request_id;
    ELSE
        -- Should not happen due to previous check, but for safety
        RAISE EXCEPTION 'Failed to allocate all units. Rolled back.';
    END IF;
    
    COMMIT;
END;
$$;

-- 2. Procedure: Register Donation Completion & Add Inventory
CREATE OR REPLACE PROCEDURE register_donation_completion(
    p_donation_id INTEGER,
    p_unit_number VARCHAR,
    p_expiry_days INTEGER DEFAULT 35
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_blood_group blood_group_enum;
    v_quantity INTEGER;
    v_status donation_status_enum;
    v_donor_id INTEGER;
BEGIN
    SELECT blood_group, quantity_ml, status, donor_id
    INTO v_blood_group, v_quantity, v_status, v_donor_id
    FROM donations
    WHERE id = p_donation_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Donation ID % does not exist', p_donation_id;
    END IF;
    
    IF v_status != 'PENDING' THEN
        RAISE EXCEPTION 'Donation is not in PENDING state';
    END IF;
    
    -- Update donation status
    UPDATE donations
    SET status = 'COMPLETED', donation_date = CURRENT_TIMESTAMP
    WHERE id = p_donation_id;
    
    -- Insert into inventory
    INSERT INTO blood_inventory (
        unit_number, donation_id, blood_group, quantity_ml, collection_date, expiry_date, status
    ) VALUES (
        p_unit_number, p_donation_id, v_blood_group, v_quantity, CURRENT_DATE, CURRENT_DATE + p_expiry_days, 'AVAILABLE'
    );
    
    COMMIT;
END;
$$;

-- 3. Procedure: Update Inventory Safely (Discard Expired)
CREATE OR REPLACE PROCEDURE discard_expired_inventory()
LANGUAGE plpgsql
AS $$
DECLARE
    v_expired_count INTEGER := 0;
BEGIN
    UPDATE blood_inventory
    SET status = 'EXPIRED'
    WHERE status = 'AVAILABLE' AND expiry_date < CURRENT_DATE;
    
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    IF v_expired_count > 0 THEN
        INSERT INTO notifications (user_id, title, message, type)
        SELECT users.id, 'Inventory Expired', v_expired_count || ' units have expired and were marked as EXPIRED.', 'WARNING'
        FROM users JOIN roles ON users.role_id = roles.id WHERE roles.name = 'Admin';
    END IF;
    
    COMMIT;
END;
$$;
-- Blood Bank Management System - Database Views

-- 1. Active Donors View
-- Shows donors who are active users and have donated at least once or are eligible
CREATE OR REPLACE VIEW active_donors_view AS
SELECT 
    d.id AS donor_id,
    d.first_name,
    d.last_name,
    d.blood_group,
    d.contact_number,
    d.last_donation_date,
    d.total_donations,
    u.email,
    u.status AS user_status
FROM donors d
JOIN users u ON d.user_id = u.id
WHERE u.status = 'ACTIVE';

-- 2. Available Blood Stock View
-- Aggregates the available blood units by blood group
CREATE OR REPLACE VIEW available_blood_stock_view AS
SELECT 
    blood_group,
    COUNT(id) AS total_units,
    SUM(quantity_ml) AS total_ml
FROM blood_inventory
WHERE status = 'AVAILABLE' AND expiry_date >= CURRENT_DATE
GROUP BY blood_group
ORDER BY blood_group;

-- 3. Emergency Requests View
-- Lists all pending emergency requests with hospital details
CREATE OR REPLACE VIEW emergency_requests_view AS
SELECT 
    br.id AS request_id,
    h.hospital_name,
    h.contact_person,
    h.contact_number,
    br.blood_group,
    br.units_requested,
    br.request_date,
    br.required_date,
    br.status
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.id
WHERE br.priority = 'EMERGENCY' AND br.status = 'PENDING'
ORDER BY br.required_date ASC, br.request_date ASC;

-- 4. Donor Eligibility Status View
-- Determines if a donor is eligible to donate based on 90 days cooling period
CREATE OR REPLACE VIEW donor_eligibility_view AS
SELECT 
    id AS donor_id,
    first_name,
    last_name,
    blood_group,
    last_donation_date,
    CASE 
        WHEN last_donation_date IS NULL THEN TRUE
        WHEN CURRENT_DATE - last_donation_date >= 90 THEN TRUE
        ELSE FALSE
    END AS is_eligible,
    CASE
        WHEN last_donation_date IS NULL THEN CURRENT_DATE
        WHEN CURRENT_DATE - last_donation_date >= 90 THEN CURRENT_DATE
        ELSE last_donation_date + 90
    END AS next_eligible_date
FROM donors
WHERE is_eligible = TRUE; -- Base eligibility flag (e.g. not permanently deferred)

-- 5. Expiring Inventory View
-- Shows blood units expiring within the next 7 days
CREATE OR REPLACE VIEW expiring_inventory_view AS
SELECT 
    id AS inventory_id,
    unit_number,
    blood_group,
    quantity_ml,
    collection_date,
    expiry_date,
    (expiry_date - CURRENT_DATE) AS days_to_expire
FROM blood_inventory
WHERE status = 'AVAILABLE' 
  AND expiry_date >= CURRENT_DATE 
  AND (expiry_date - CURRENT_DATE) <= 7
ORDER BY days_to_expire ASC;
-- Blood Bank Management System - Seed Data

-- 1. Roles
INSERT INTO roles (name, description) VALUES
('Admin', 'System Administrator with full access'),
('BloodBankStaff', 'Staff managing inventory and donations'),
('Hospital', 'Hospital representative requesting blood'),
('Donor', 'Registered blood donor');

-- 2. Users (Passwords are hashed 'password123' for demonstration - in production use bcrypt)
-- Note: Replace with actual bcrypt hashes in FastAPI backend. Let's use a dummy hash format for now.
INSERT INTO users (email, password_hash, role_id, status) VALUES
('admin@bloodbank.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq', 1, 'ACTIVE'),
('staff@bloodbank.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq', 2, 'ACTIVE'),
('hospital_apollo@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq', 3, 'ACTIVE'),
('donor.john@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq', 4, 'ACTIVE'),
('donor.jane@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq', 4, 'ACTIVE');

-- 3. Donors
INSERT INTO donors (user_id, first_name, last_name, date_of_birth, gender, blood_group, contact_number, address, last_donation_date, total_donations, is_eligible) VALUES
(4, 'John', 'Doe', '1990-05-15', 'Male', 'O+', '+1234567890', '123 Elm Street, City', '2023-12-01', 5, TRUE),
(5, 'Jane', 'Smith', '1995-08-22', 'Female', 'A-', '+0987654321', '456 Oak Avenue, City', NULL, 0, TRUE);

-- 4. Hospitals
INSERT INTO hospitals (user_id, hospital_name, license_number, contact_person, contact_number, address, is_verified) VALUES
(3, 'Apollo City Hospital', 'LIC-HOSP-001', 'Dr. Robert Brown', '+1122334455', '789 Medical Center Blvd, City', TRUE);

-- 5. Appointments
INSERT INTO appointments (donor_id, appointment_date, appointment_time, status) VALUES
(1, CURRENT_DATE + INTERVAL '2 days', '10:00:00', 'SCHEDULED'),
(2, CURRENT_DATE + INTERVAL '3 days', '14:30:00', 'SCHEDULED');

-- 6. Donations (Some completed ones to generate inventory)
INSERT INTO donations (donor_id, blood_group, quantity_ml, donation_date, status, blood_pressure, hemoglobin_level, handled_by) VALUES
(1, 'O+', 450, CURRENT_DATE - INTERVAL '10 days', 'COMPLETED', '120/80', 14.5, 2),
(1, 'O+', 450, CURRENT_DATE - INTERVAL '150 days', 'COMPLETED', '118/78', 15.0, 2);

-- 7. Blood Inventory (Generated from completed donations and some random stock)
INSERT INTO blood_inventory (unit_number, donation_id, blood_group, quantity_ml, collection_date, expiry_date, status) VALUES
('UNIT-O+-1001', 1, 'O+', 450, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '25 days', 'AVAILABLE'),
('UNIT-O+-1002', 2, 'O+', 450, CURRENT_DATE - INTERVAL '150 days', CURRENT_DATE - INTERVAL '115 days', 'EXPIRED');

-- Create some dummy donations for the extra stock
INSERT INTO donations (donor_id, blood_group, quantity_ml, donation_date, status, blood_pressure, hemoglobin_level, handled_by) VALUES
(2, 'A+', 450, CURRENT_DATE - INTERVAL '2 days', 'COMPLETED', '115/75', 13.5, 2),
(2, 'A+', 450, CURRENT_DATE - INTERVAL '2 days', 'COMPLETED', '118/76', 14.0, 2),
(2, 'A+', 450, CURRENT_DATE - INTERVAL '2 days', 'COMPLETED', '120/80', 13.8, 2);

-- Add some extra available stock directly (for testing)
INSERT INTO blood_inventory (unit_number, donation_id, blood_group, quantity_ml, collection_date, expiry_date, status) VALUES
('UNIT-A+-2001', 3, 'A+', 450, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '33 days', 'AVAILABLE'),
('UNIT-A+-2002', 4, 'A+', 450, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '33 days', 'AVAILABLE'),
('UNIT-A+-2003', 5, 'A+', 450, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '33 days', 'AVAILABLE');

-- 8. Blood Requests
INSERT INTO blood_requests (hospital_id, blood_group, units_requested, priority, status, required_date, reason) VALUES
(1, 'O+', 2, 'HIGH', 'PENDING', CURRENT_DATE + INTERVAL '1 day', 'Emergency surgery'),
(1, 'A+', 5, 'MEDIUM', 'APPROVED', CURRENT_DATE + INTERVAL '5 days', 'Scheduled transplants');

-- 9. Request Fulfillments (For the APPROVED request)
-- Assuming we have enough A+ stock from the bulk insert above
-- (Skipping explicit inserts for fulfillments to avoid unique constraint issues with dummy links, 
--  this will be handled nicely via the stored procedure in actual usage)
