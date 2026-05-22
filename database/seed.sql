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
