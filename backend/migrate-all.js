import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/occ";
const isCloudDb = dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1") && !dbUrl.includes("@postgres:5432");

const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

const statements = [
    "CREATE TABLE IF NOT EXISTS companies (id SERIAL PRIMARY KEY, name VARCHAR(150), address TEXT, phone VARCHAR(50), email_support VARCHAR(255), maps_location TEXT, social_media JSONB DEFAULT '{}', logo_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "INSERT INTO companies (name) VALUES ('OCC Default Company') ON CONFLICT DO NOTHING",
    "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, company_id INT REFERENCES companies(id), name VARCHAR(150), email VARCHAR(150) UNIQUE, password_hash TEXT, role VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS complaints (id SERIAL PRIMARY KEY, company_id INT REFERENCES companies(id) DEFAULT 1, ticket_code VARCHAR(50) UNIQUE, public_token VARCHAR(100), customer_name VARCHAR(150), customer_email VARCHAR(150), category VARCHAR(100), subject VARCHAR(200), description TEXT, location TEXT, city VARCHAR(100), phone VARCHAR(50), priority VARCHAR(20) DEFAULT 'Medium', status VARCHAR(30) DEFAULT 'OPEN', assigned_to INT REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS complaint_attachments (id SERIAL PRIMARY KEY, complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE, file_path TEXT, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_support VARCHAR(255)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS maps_location TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT",
    "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NOT NULL DEFAULT ''",
    "ALTER TABLE complaints ALTER COLUMN phone TYPE VARCHAR(20) USING LEFT(phone, 20)",
    "ALTER TABLE complaints ALTER COLUMN phone SET DEFAULT ''",
    "ALTER TABLE complaints ALTER COLUMN phone SET NOT NULL",
    "CREATE INDEX IF NOT EXISTS complaints_phone_idx ON complaints (phone)",
    "ALTER TABLE complaints ALTER COLUMN company_id SET DEFAULT 1",
    "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(10) PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS sequences (name VARCHAR(50) PRIMARY KEY, current_value INTEGER NOT NULL DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS official_emails (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE)",
    "ALTER TABLE official_emails ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) DEFAULT 1",
    "UPDATE official_emails SET company_id = 1 WHERE company_id IS NULL",
    "CREATE TABLE IF NOT EXISTS master_files (id SERIAL PRIMARY KEY, file_key VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(255), file_path TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS surat_kuasa (id SERIAL PRIMARY KEY, ticket_code VARCHAR(50) REFERENCES complaints(ticket_code) ON DELETE CASCADE, file_path TEXT NOT NULL, uploaded_by VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS invoices (id SERIAL PRIMARY KEY, ticket_code VARCHAR(50), customer_name VARCHAR(150), customer_email VARCHAR(150), amount DECIMAL(15, 2) DEFAULT 0, description TEXT, status VARCHAR(50) DEFAULT 'UNPAID', created_by INT REFERENCES users(id), company_id INT REFERENCES companies(id) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) DEFAULT 1",
    "UPDATE invoices SET company_id = 1 WHERE company_id IS NULL",
    "CREATE TABLE IF NOT EXISTS complaint_responses (id SERIAL PRIMARY KEY, complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE, responder_id INT REFERENCES users(id) ON DELETE SET NULL, message TEXT NOT NULL, is_internal BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS complaint_sla (id SERIAL PRIMARY KEY, complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE, response_deadline TIMESTAMP, resolution_deadline TIMESTAMP, breached BOOLEAN DEFAULT FALSE)",
    "CREATE UNIQUE INDEX IF NOT EXISTS complaint_sla_complaint_id_idx ON complaint_sla (complaint_id)",
    "CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, user_id INT, action TEXT, entity VARCHAR(50), entity_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "INSERT INTO sequences (name, current_value) VALUES ('ticket_seq', 0) ON CONFLICT DO NOTHING",
    "INSERT INTO categories (id, name) VALUES ('PROD', 'Product Quality'), ('SERV', 'Customer Service'), ('BILL', 'Billing Issue'), ('DELV', 'Delivery Problem'), ('OTHER', 'Other') ON CONFLICT DO NOTHING",
    "INSERT INTO official_emails (name, email, company_id) VALUES ('Support Team', 'support@occ.com', 1) ON CONFLICT (email) DO NOTHING",
    "INSERT INTO users (company_id, name, email, password_hash, role) VALUES (1, 'Super Admin', 'admin@occ.com', '$2b$10$gqxp14mTpFgRKUxxbxSppel5APUVmdfv5T78ymZBhNIfYZJyJeVTi', 'Superadmin') ON CONFLICT (email) DO UPDATE SET role = 'Superadmin', password_hash = EXCLUDED.password_hash",
];

try {
    for (const statement of statements) {
        await pool.query(statement);
    }
    console.log("Database migrations completed");
} finally {
    await pool.end();
}
