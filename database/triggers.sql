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
