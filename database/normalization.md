# Database Normalization

The Blood Bank Management System database schema is designed following normalization rules up to the Third Normal Form (3NF) / Boyce-Codd Normal Form (BCNF) to minimize redundancy and prevent data anomalies.

## First Normal Form (1NF)
**Rule:** Every attribute must be atomic (indivisible), and each record must be unique.
- All columns in our tables (`users`, `donors`, `blood_inventory`, etc.) contain single, atomic values. 
- Composite attributes like `address` could theoretically be split (street, city, state, zip), but for this scope, a single text block is atomic in the context of the application's needs.
- Every table has a primary key (`id SERIAL PRIMARY KEY`), ensuring each row is uniquely identifiable.

## Second Normal Form (2NF)
**Rule:** It is in 1NF, and all non-key attributes are fully functionally dependent on the primary key (no partial dependency).
- We use surrogate primary keys (`id` in all tables). Since surrogate keys are a single column, partial dependency (where an attribute depends on only part of a composite primary key) is inherently avoided.
- For example, in `donors`, attributes like `first_name`, `last_name`, and `blood_group` depend entirely on `id` (or the candidate key `user_id`), not just a part of it.

## Third Normal Form (3NF)
**Rule:** It is in 2NF, and there are no transitive dependencies (non-key attributes depend only on the primary key, not on other non-key attributes).
- In the `users` table, `role_name` is not stored directly. Instead, `role_id` is a foreign key to the `roles` table. Storing `role_name` in `users` would cause a transitive dependency (`users.id -> users.role_id -> roles.name`).
- We separated `hospitals` and `donors` from `users`. If we stored `hospital_name` and `donor_blood_group` in `users`, it would create nullable, non-dependent fields based on user type, violating 3NF.
- In `blood_inventory`, we do not store `donor_name`. Instead, we reference `donation_id`, which references `donor_id`, which references `donors`. This prevents data anomalies if a donor updates their name.

## Boyce-Codd Normal Form (BCNF)
**Rule:** For every non-trivial functional dependency X -> Y, X must be a superkey.
- By strictly using surrogate primary keys and defining `UNIQUE` constraints on natural candidate keys (like `users.email`, `donors.user_id`, `hospitals.license_number`), we ensure that any determinant is a candidate key.
- In `request_fulfillments`, `inventory_id` is UNIQUE. Thus `inventory_id -> request_id` is a valid dependency where the determinant is a superkey for the tuple.

## Additional Integrity Measures
- **ENUMs**: We use custom PostgreSQL `ENUM` types (e.g., `blood_group_enum`, `request_status_enum`) to restrict domains and avoid inconsistent text entries.
- **Constraints**: 
  - `CHECK` constraints ensure valid data states (e.g., `quantity_ml > 0`, `expiry_date > collection_date`).
  - `FOREIGN KEY` constraints enforce referential integrity between tables (`ON DELETE CASCADE` / `RESTRICT`).
