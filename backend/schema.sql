-- Database Schema for OCC System

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 👤 users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash TEXT,
  role VARCHAR(50), -- 'Agent', 'Supervisor', 'Admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📩 complaints
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
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
  breached BOOLEAN DEFAULT FALSE
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

-- Seed Initial Data
INSERT INTO companies (name) VALUES ('OCC Default Company');
-- Password is 'admin123' (hashed) - placeholder
INSERT INTO users (company_id, name, email, password_hash, role) 
VALUES (1, 'Super Admin', 'admin@occ.com', '$2b$10$YourHashedPasswordHere', 'Admin');
