# Database Tables Dump

## Table: `donors`

|id|user_id|first_name|last_name|date_of_birth|gender|blood_group|contact_number|address|last_donation_date|total_donations|is_eligible|
|---|---|---|---|---|---|---|---|---|---|---|---|
|1|11|John|Doe|1990-01-01|Male|O+|1234567890|123 Main St|2026-05-23|1|True|
|2|13|ABC|DEF|2004-05-05|Male|A+|9745632102||2026-05-23|1|True|
|3|14|Prasad |Anand|2006-12-04|Male|A+|9511224345||2026-05-23|1|True|
|4|27|John|Doe|2000-01-01|Male|A+|1234567890|123|2026-05-23|1|True|
|5|30|Areen|Bagwan|2006-06-24|Male|A+|9175930466||2026-05-23|1|True|
|6|33|Harshal Mahale|Mahale|2007-03-12|Male|Unknown|9876543210||2026-05-23|1|True|
|7|34|Test|cc0c|2000-01-01|Male|O+|1234567890|123|2026-05-23|1|True|
|8|35|Manthan|Gaikwad|2006-06-13|Male|A+|7418529632||2026-05-23|1|True|
|12|39|Manthan|Gaikwad|2006-06-13|Male|A+|7418529632||2026-05-23|1|True|
|13|40|Harsh|Borse|2006-09-15|Male|B+|7897531278||2026-05-23|1|True|
|14|41|Dnyaneshwari|Sabale|2006-07-19|Male|O-|9511224345||2026-05-23|1|True|

---

## Table: `users`

|id|email|password_hash|role_id|status|created_at|updated_at|
|---|---|---|---|---|---|---|
|1|admin@bloodbank.local|hashed_password_here|1|ACTIVE|2026-05-23 00:48:47.353407|2026-05-23 00:48:47.353407|
|11|donor.d860c225@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 00:50:12.390997|2026-05-23 00:50:12.390997|
|12|hospital.f057d3aa@bloodbank.local|dummy|3|ACTIVE|2026-05-23 00:50:22.246463|2026-05-23 00:50:22.246463|
|13|donor.bab44208@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 00:51:24.386071|2026-05-23 00:51:24.386071|
|14|donor.27b05861@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 00:58:27.495869|2026-05-23 00:58:27.495869|
|15|hospital.84f4c7a8@bloodbank.local|dummy|3|ACTIVE|2026-05-23 00:58:43.462694|2026-05-23 00:58:43.462694|
|27|donor.5f92d961@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 09:51:42.061331|2026-05-23 09:51:42.061331|
|30|donor.fbf1896c@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 09:54:43.408868|2026-05-23 09:54:43.408868|
|33|donor.f19e0293@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 10:06:08.625866|2026-05-23 10:06:08.625866|
|34|donor.03375229@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 10:16:15.804517|2026-05-23 10:16:15.804517|
|35|donor.20475422@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 10:26:21.498584|2026-05-23 10:26:21.498584|
|39|donor.1b15f5e7@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 10:29:25.221479|2026-05-23 10:29:25.221479|
|40|donor.50d87806@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 10:43:49.806647|2026-05-23 10:43:49.806647|
|41|donor.a4406a45@bloodbank.local|dummy_hash|4|ACTIVE|2026-05-23 10:44:51.131054|2026-05-23 10:44:51.131054|

---

## Table: `roles`

|id|name|description|
|---|---|---|
|1|Admin|System Administrator|
|2|Staff|Blood Bank Staff|
|3|Hospital|Registered Hospital|
|4|Donor|Registered Blood Donor|

---

## Table: `donations`

|id|donor_id|appointment_id|blood_group|quantity_ml|donation_date|status|blood_pressure|hemoglobin_level|medical_notes|handled_by|
|---|---|---|---|---|---|---|---|---|---|---|
|1|1|None|O+|450|2026-05-23 00:50:12.390997|COMPLETED|120/80|14.50|None|1|
|2|2|None|A+|450|2026-05-23 00:51:24.386071|COMPLETED|115/85|15.00|None|1|
|3|3|None|A+|450|2026-05-23 00:58:27.495869|COMPLETED|120/80|15.00|None|1|
|4|4|None|A+|450|2026-05-23 09:51:42.061331|COMPLETED|120/80|14.50|None|1|
|5|5|None|A+|450|2026-05-23 09:54:43.408868|COMPLETED|120/80|15.00|None|1|
|6|6|None|Unknown|450|2026-05-23 10:06:08.625866|COMPLETED|125/75|14.00|Diabetes|1|
|7|7|None|O+|450|2026-05-23 10:16:15.804517|COMPLETED|120/80|14.50|None|1|
|8|8|None|A+|450|2026-05-23 10:26:21.498584|COMPLETED|125/80|15.00|None|1|
|9|12|None|A+|450|2026-05-23 10:29:25.221479|COMPLETED|125/80|14.50|None|1|
|10|13|None|B+|450|2026-05-23 10:43:49.806647|COMPLETED|130/80|16.00|None|1|
|11|14|None|O-|525|2026-05-23 10:44:51.131054|COMPLETED|125/80|14.75|None|1|

---

## Table: `blood_requests`

|id|hospital_id|blood_group|units_requested|priority|status|request_date|required_date|reason|handled_by|
|---|---|---|---|---|---|---|---|---|---|
|2|2|A+|1|MEDIUM|COMPLETED|2026-05-23 00:58:43.462694|2026-05-23|Emergency|1|
|1|1|O+|2|HIGH|COMPLETED|2026-05-23 00:50:22.246463|2026-05-24|Surgery|1|

---

## Table: `audit_logs`

|id|user_id|action|table_name|record_id|old_value|new_value|ip_address|created_at|
|---|---|---|---|---|---|---|---|---|
|1|None|UPDATE_STATUS|blood_inventory|1|{'status': 'AVAILABLE'}|{'status': 'DISCARDED'}|None|2026-05-23 00:51:31.529670|
|2|None|UPDATE_STATUS|blood_inventory|1|{'status': 'DISCARDED'}|{'status': 'AVAILABLE'}|None|2026-05-23 00:51:34.687654|
|3|None|UPDATE_STATUS|blood_inventory|2|{'status': 'AVAILABLE'}|{'status': 'USED'}|None|2026-05-23 00:58:47.685270|
|4|None|UPDATE_STATUS|blood_inventory|1|{'status': 'AVAILABLE'}|{'status': 'USED'}|None|2026-05-23 10:35:24.251173|
|5|None|UPDATE_STATUS|blood_inventory|7|{'status': 'AVAILABLE'}|{'status': 'USED'}|None|2026-05-23 10:35:24.251173|

---

## Table: `notifications`

|id|user_id|title|message|type|is_read|created_at|
|---|---|---|---|---|---|---|
|1|1|Low Stock Alert|Blood group O+ is running low. Only 1 units available.|ALERT|False|2026-05-23 00:50:12.390997|
|2|1|Low Stock Alert|Blood group A+ is running low. Only 1 units available.|ALERT|False|2026-05-23 00:51:24.386071|
|3|1|Low Stock Alert|Blood group O+ is running low. Only 0 units available.|ALERT|False|2026-05-23 00:51:31.529670|
|4|1|Low Stock Alert|Blood group O+ is running low. Only 1 units available.|ALERT|False|2026-05-23 00:51:34.687654|
|5|1|Low Stock Alert|Blood group A+ is running low. Only 2 units available.|ALERT|False|2026-05-23 00:58:27.495869|
|6|1|Low Stock Alert|Blood group A+ is running low. Only 1 units available.|ALERT|False|2026-05-23 00:58:47.685270|
|7|1|Low Stock Alert|Blood group A+ is running low. Only 2 units available.|ALERT|False|2026-05-23 09:51:42.061331|
|8|1|Low Stock Alert|Blood group A+ is running low. Only 3 units available.|ALERT|False|2026-05-23 09:54:43.408868|
|9|1|Low Stock Alert|Blood group Unknown is running low. Only 1 units available.|ALERT|False|2026-05-23 10:06:08.625866|
|10|1|Low Stock Alert|Blood group O+ is running low. Only 2 units available.|ALERT|False|2026-05-23 10:16:15.804517|
|11|1|Low Stock Alert|Blood group A+ is running low. Only 4 units available.|ALERT|False|2026-05-23 10:26:21.498584|
|12|1|Low Stock Alert|Blood group A+ is running low. Only 5 units available.|ALERT|False|2026-05-23 10:29:25.221479|
|13|1|Low Stock Alert|Blood group O+ is running low. Only 1 units available.|ALERT|False|2026-05-23 10:35:24.251173|
|14|1|Low Stock Alert|Blood group O+ is running low. Only 0 units available.|ALERT|False|2026-05-23 10:35:24.251173|
|15|1|Low Stock Alert|Blood group B+ is running low. Only 1 units available.|ALERT|False|2026-05-23 10:43:49.806647|
|16|1|Low Stock Alert|Blood group O- is running low. Only 1 units available.|ALERT|False|2026-05-23 10:44:51.131054|

---

## Table: `request_fulfillments`

|id|request_id|inventory_id|dispatched_at|dispatched_by|
|---|---|---|---|---|
|1|2|2|2026-05-23 00:58:47.685270|1|
|2|1|1|2026-05-23 10:35:24.251173|1|
|3|1|7|2026-05-23 10:35:24.251173|1|

---

## Table: `blood_inventory`

|id|unit_number|donation_id|blood_group|quantity_ml|collection_date|expiry_date|status|created_at|
|---|---|---|---|---|---|---|---|---|
|3|UNIT-A+-ECFE8E|3|A+|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 00:58:27.495869|
|2|UNIT-A+-1BF911|2|A+|450|2026-05-23|2026-06-27|USED|2026-05-23 00:51:24.386071|
|4|UNIT-A+-8432F6|4|A+|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 09:51:42.061331|
|5|UNIT-A+-4ACD73|5|A+|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 09:54:43.408868|
|6|UNIT-Unknown-D1CF88|6|Unknown|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 10:06:08.625866|
|8|UNIT-A+-60FD1F|8|A+|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 10:26:21.498584|
|9|UNIT-A+-4319C7|9|A+|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 10:29:25.221479|
|1|UNIT-O+-24EE38|1|O+|450|2026-05-23|2026-06-27|USED|2026-05-23 00:50:12.390997|
|7|UNIT-O+-FC904A|7|O+|450|2026-05-23|2026-06-27|USED|2026-05-23 10:16:15.804517|
|10|UNIT-B+-59CF64|10|B+|450|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 10:43:49.806647|
|11|UNIT-O--4F8D6A|11|O-|525|2026-05-23|2026-06-27|AVAILABLE|2026-05-23 10:44:51.131054|

---

## Table: `appointments`

|id|donor_id|appointment_date|appointment_time|status|created_at|
|---|---|---|---|---|---|
| No data in this table ||||||

---

## Table: `hospitals`

|id|user_id|hospital_name|license_number|contact_person|contact_number|address|is_verified|
|---|---|---|---|---|---|---|---|
|1|12|Test Hospital|d7f67e46c1|Dr. Default|1234567890|123 Hospital Way|False|
|2|15|ABC hospital|4f58237d9d|Dr. Default|1234567890|123 Hospital Way|False|

---

