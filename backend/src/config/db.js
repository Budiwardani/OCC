import pg from 'pg';
import env from './env.js';

const pool = new pg.Pool({
    connectionString: env.dbUrl,
});

pool.on('connect', () => {
    // console.log('Connected to PostgreSQL database');
});

export default {
    query: (text, params) => pool.query(text, params),
};
