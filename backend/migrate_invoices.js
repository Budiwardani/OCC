
import db from "./src/config/db.js";

const migrateInvoices = async () => {
    try {
        console.log("Migrating Invoices Table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id SERIAL PRIMARY KEY,
                ticket_code VARCHAR(50),
                customer_name VARCHAR(150),
                customer_email VARCHAR(150),
                amount DECIMAL(15, 2) DEFAULT 0,
                description TEXT,
                status VARCHAR(50) DEFAULT 'UNPAID',
                created_by INT, -- user id
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Invoices table created.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrateInvoices();
