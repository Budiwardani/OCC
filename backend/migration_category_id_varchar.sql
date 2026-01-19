-- 1. Drop the default value (sequence linkage)
ALTER TABLE categories ALTER COLUMN id DROP DEFAULT;

-- 2. Convert the column type to VARCHAR(10)
-- Casting existing integers to text
ALTER TABLE categories ALTER COLUMN id TYPE VARCHAR(10) USING id::VARCHAR;

-- 3. (Optional) If you want to drop the sequence entirely:
-- DROP SEQUENCE IF EXISTS categories_id_seq; 
-- (Usually okay to keep or ignore)
