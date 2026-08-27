-- Database Schema for OCC System

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS surat_kuasa;
DROP TABLE IF EXISTS master_files;
DROP TABLE IF EXISTS official_emails;
DROP TABLE IF EXISTS sequences;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS complaint_sla;
DROP TABLE IF EXISTS complaint_attachments;
DROP TABLE IF EXISTS complaint_responses;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;

-- 🏢 companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  address TEXT,
  phone VARCHAR(50),
  email_support VARCHAR(255),
  maps_location TEXT,
  social_media JSONB DEFAULT '{}',
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 👤 users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) DEFAULT 1,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash TEXT,
  role VARCHAR(50) CHECK (role IN ('Superadmin', 'Admin', 'Manager', 'Agent', 'Customer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📩 complaints
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) DEFAULT 1,
  ticket_code VARCHAR(50) UNIQUE,
  public_token VARCHAR(100),
  customer_name VARCHAR(150),
  customer_email VARCHAR(150),
  category VARCHAR(100),
  subject VARCHAR(200),
  description TEXT,
  location TEXT,
  city VARCHAR(100),
  phone VARCHAR(50),
  priority VARCHAR(20), -- 'Low', 'Medium', 'High', 'Critical'
  status VARCHAR(30),   -- 'OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'
  assigned_to INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💬 complaint_responses
CREATE TABLE complaint_responses (
  id SERIAL PRIMARY KEY,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  responder_id INT REFERENCES users(id),
  message TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📎 complaint_attachments
CREATE TABLE complaint_attachments (
  id SERIAL PRIMARY KEY,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  file_path TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ⏱️ complaint_sla
CREATE TABLE complaint_sla (
  id SERIAL PRIMARY KEY,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  response_deadline TIMESTAMP,
  resolution_deadline TIMESTAMP,
  breached BOOLEAN DEFAULT FALSE,
  UNIQUE (complaint_id)
);

-- 📝 audit_logs
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action TEXT,
  entity VARCHAR(50),
  entity_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sequences (
  name VARCHAR(50) PRIMARY KEY,
  current_value INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE official_emails (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  company_id INT REFERENCES companies(id) DEFAULT 1
);

CREATE TABLE master_files (
  id SERIAL PRIMARY KEY,
  file_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255),
  file_path TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE surat_kuasa (
  id SERIAL PRIMARY KEY,
  ticket_code VARCHAR(50) REFERENCES complaints(ticket_code) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_by VARCHAR(20) CHECK (uploaded_by IN ('ADMIN', 'CUSTOMER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  ticket_code VARCHAR(50),
  customer_name VARCHAR(150),
  customer_email VARCHAR(150),
  amount DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  status VARCHAR(50) DEFAULT 'UNPAID',
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
INSERT INTO companies (name) VALUES ('OCC Default Company');
-- Password is 'superadmin123'. Change it after first login.
INSERT INTO users (company_id, name, email, password_hash, role) 
VALUES (1, 'Super Admin', 'admin@occ.com', '$2b$10$gqxp14mTpFgRKUxxbxSppel5APUVmdfv5T78ymZBhNIfYZJyJeVTi', 'Superadmin');

INSERT INTO categories (id, name) VALUES
  ('PROD', 'Product Quality'),
  ('SERV', 'Customer Service'),
  ('BILL', 'Billing Issue'),
  ('DELV', 'Delivery Problem'),
  ('OTHER', 'Other')
ON CONFLICT DO NOTHING;

INSERT INTO sequences (name, current_value)
VALUES ('ticket_seq', 0)
ON CONFLICT DO NOTHING;

INSERT INTO official_emails (name, email)
VALUES ('Support Team', 'support@occ.com')
ON CONFLICT DO NOTHING;
