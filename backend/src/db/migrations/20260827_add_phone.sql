ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

CREATE INDEX IF NOT EXISTS complaints_phone_idx ON complaints (phone);