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
