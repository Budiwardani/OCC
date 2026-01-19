-- 1. Standardize existing roles (Title Case)
UPDATE users SET role = 'Superadmin' WHERE role ILIKE 'superadmin';
UPDATE users SET role = 'Agent' WHERE role ILIKE 'agent';
UPDATE users SET role = 'Customer' WHERE role ILIKE 'customer';

-- 2. Handle any unexpected values (Fallback to Customer)
UPDATE users 
SET role = 'Customer' 
WHERE role NOT IN ('Superadmin', 'Agent', 'Customer', 'Manager');

-- 3. Now apply the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('Superadmin', 'Agent', 'Customer', 'Manager'));
