
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'occ' // Ensure this matches your DB name
});

async function migrate() {
    try {
        console.log('🔄 Starting migration: Add fields to complaints table...');

        // Check if columns exist, if not add them
        const queries = [
            "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location TEXT;",
            "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS city VARCHAR(100);",
            "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS phone VARCHAR(50);",
            // Note: phone might already exist in schema.sql but maybe not in running DB? 
            // In the file read previously, phone was in the INSERT of public.controller.js but NOT in schema.sql!
            // Wait, let's check schema.sql again.
            // schema.sql: customer_name, customer_email, category, subject, description, priority, status, assigned_to
            // phone is MISSING in schema.sql.
            // So I definitely need to add phone.
        ];

        for (const query of queries) {
            await pool.query(query);
            console.log(`✅ Executed: ${query}`);
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
