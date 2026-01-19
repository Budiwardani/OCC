import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const pool = new pg.Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'occ',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const checkRoles = async () => {
    try {
        console.log("Checking roles...");
        const res = await pool.query('SELECT id, name, role FROM users');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

checkRoles();
