
import db from "./src/config/db.js";

const createTables = async () => {
    try {
        console.log("Creating missing tables...");

        await db.query(`
      CREATE TABLE IF NOT EXISTS master_files (
        id SERIAL PRIMARY KEY,
        file_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255),
        file_path TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("- master_files created");

        await db.query(`
      CREATE TABLE IF NOT EXISTS surat_kuasa (
        id SERIAL PRIMARY KEY,
        ticket_code VARCHAR(50),
        file_path TEXT,
        uploaded_by VARCHAR(50), -- 'ADMIN' or 'CUSTOMER'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("- surat_kuasa created");

        await db.query(`
      CREATE TABLE IF NOT EXISTS official_emails (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("- official_emails created");

        await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("- categories created");

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

createTables();
