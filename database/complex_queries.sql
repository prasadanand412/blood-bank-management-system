-- Blood Bank Management System - Complex SQL Queries

-- 1. Top 10 Donors by Total Volume Donated
SELECT 
    d.id AS donor_id,
    d.first_name || ' ' || d.last_name AS donor_name,
    d.blood_group,
    COUNT(don.id) AS total_donations,
    SUM(don.quantity_ml) AS total_volume_ml,
    MAX(don.donation_date) AS latest_donation
FROM donors d
JOIN donations don ON d.id = don.donor_id
WHERE don.status = 'COMPLETED'
GROUP BY d.id
ORDER BY total_volume_ml DESC
LIMIT 10;

-- 2. Blood Usage Statistics by Hospital (Last 30 Days)
SELECT 
    h.hospital_name,
    COUNT(br.id) AS total_requests,
    SUM(br.units_requested) AS total_units_requested,
    COUNT(rf.id) AS total_units_supplied,
    ROUND((COUNT(rf.id)::DECIMAL / NULLIF(SUM(br.units_requested), 0)) * 100, 2) AS fulfillment_rate_percentage
FROM hospitals h
LEFT JOIN blood_requests br ON h.id = br.hospital_id AND br.request_date >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN request_fulfillments rf ON br.id = rf.request_id
GROUP BY h.id, h.hospital_name
ORDER BY total_units_requested DESC;

-- 3. Most Requested Blood Groups vs Available Stock
SELECT 
    bg.blood_group,
    COALESCE(req.requested_units, 0) AS requested_units_last_30_days,
    COALESCE(inv.available_units, 0) AS currently_available_units,
    CASE 
        WHEN COALESCE(inv.available_units, 0) < COALESCE(req.requested_units, 0) * 0.5 THEN 'CRITICAL SHORTAGE'
        WHEN COALESCE(inv.available_units, 0) < COALESCE(req.requested_units, 0) THEN 'LOW STOCK'
        ELSE 'SUFFICIENT'
    END AS status_indicator
FROM (
    SELECT unnest(enum_range(NULL::blood_group_enum)) AS blood_group
) bg
LEFT JOIN (
    SELECT blood_group, SUM(units_requested) AS requested_units
    FROM blood_requests
    WHERE request_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY blood_group
) req ON bg.blood_group = req.blood_group
LEFT JOIN (
    SELECT blood_group, COUNT(*) AS available_units
    FROM blood_inventory
    WHERE status = 'AVAILABLE'
    GROUP BY blood_group
) inv ON bg.blood_group = inv.blood_group
ORDER BY req.requested_units DESC NULLS LAST;

-- 4. Monthly Donation Trends (Current Year)
SELECT 
    TO_CHAR(donation_date, 'Month') AS month_name,
    EXTRACT(MONTH FROM donation_date) AS month_number,
    COUNT(id) AS number_of_donations,
    SUM(quantity_ml) AS total_volume_ml,
    COUNT(DISTINCT donor_id) AS unique_donors
FROM donations
WHERE EXTRACT(YEAR FROM donation_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND status = 'COMPLETED'
GROUP BY month_name, month_number
ORDER BY month_number;

-- 5. Inventory Spoilage Report (Discarded/Expired Units)
SELECT 
    blood_group,
    COUNT(*) AS spoiled_units,
    SUM(quantity_ml) AS lost_volume_ml,
    ROUND(AVG(expiry_date - collection_date), 0) AS avg_shelf_life_days
FROM blood_inventory
WHERE status IN ('EXPIRED', 'DISCARDED')
  AND expiry_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY blood_group
ORDER BY spoiled_units DESC;

-- 6. Donor Retention and Return Rate
WITH donor_stats AS (
    SELECT 
        donor_id,
        MIN(donation_date) AS first_donation,
        MAX(donation_date) AS last_donation,
        COUNT(id) AS donation_count
    FROM donations
    WHERE status = 'COMPLETED'
    GROUP BY donor_id
)
SELECT 
    COUNT(donor_id) AS total_donors,
    SUM(CASE WHEN donation_count = 1 THEN 1 ELSE 0 END) AS one_time_donors,
    SUM(CASE WHEN donation_count > 1 THEN 1 ELSE 0 END) AS repeat_donors,
    ROUND((SUM(CASE WHEN donation_count > 1 THEN 1 ELSE 0 END)::DECIMAL / COUNT(donor_id)) * 100, 2) AS retention_rate_percentage
FROM donor_stats;
