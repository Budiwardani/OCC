import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'occ',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const runFix = async () => {
    try {
        const sqlPath = path.join(__dirname, 'migration_fix_timestamp.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running fix...');
        await pool.query(sql);
        console.log('Fix applied successfully.');
    } catch (err) {
        console.error('Fix failed:', err);
    } finally {
        await pool.end();
    }
};

runFix();
