-- Add phone number to complaints
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Create Surat Kuasa table
CREATE TABLE IF NOT EXISTS surat_kuasa (
  id SERIAL PRIMARY KEY,
  ticket_code VARCHAR(50) REFERENCES complaints(ticket_code) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_by VARCHAR(20), -- 'ADMIN' or 'CUSTOMER'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
