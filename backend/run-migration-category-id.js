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

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'migration_category_id_varchar.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running category ID migration...');
        await pool.query(sql);
        console.log('Category ID migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

runMigration();
