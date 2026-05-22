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
    
END;
$$;
