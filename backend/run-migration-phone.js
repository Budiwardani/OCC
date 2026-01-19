import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log("Running migration: migration_phone_surat.sql");
        const sql = fs.readFileSync(path.join(__dirname, 'migration_phone_surat.sql'), 'utf8');
        await client.query(sql);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
