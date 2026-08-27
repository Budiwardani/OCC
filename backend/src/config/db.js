import pg from 'pg';
import env from './env.js';

const isCloudDb = env.dbUrl && !env.dbUrl.includes('localhost') && !env.dbUrl.includes('127.0.0.1') && !env.dbUrl.includes('@postgres:5432');

const pool = new pg.Pool({
    connectionString: env.dbUrl,
    ssl: isCloudDb ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    // console.log('Connected to PostgreSQL database');
});

export default {
    query: (text, params) => pool.query(text, params),
};
