CREATE TABLE IF NOT EXISTS master_files (
  id SERIAL PRIMARY KEY,
  file_key VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'surat_kuasa_template'
  name VARCHAR(255),
  file_path TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
