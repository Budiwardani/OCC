import fs from 'fs';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
    // First, connect to postgres database to create occ database
    const adminPool = new pg.Pool({
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'postgres'
    });

    try {
        console.log('🔍 Checking if OCC database exists...');

        // Terminate active connections
        await adminPool.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'occ'
            AND pid <> pg_backend_pid()
        `);
        console.log('🔌 Terminated active connections to OCC database');

        // Drop and recreate database
        try {
            await adminPool.query('DROP DATABASE IF EXISTS occ');
            console.log('✅ Dropped existing OCC database (if any)');
        } catch (err) {
            console.error('⚠️ Warning during drop:', err.message);
        }

        try {
            await adminPool.query('CREATE DATABASE occ');
            console.log('✅ Created OCC database');
        } catch (err) {
            if (err.code === '42P04') { // duplicate_database
                console.log('ℹ️  Database already exists, skipping creation');
            } else {
                throw err;
            }
        }

        await adminPool.end();

        // Now connect to the occ database to create tables
        const occPool = new pg.Pool({
            user: 'postgres',
            password: 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'occ'
        });

        console.log('\n📋 Creating database tables...');

        // Read and execute schema.sql
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        await occPool.query(schema);
        console.log('✅ All tables created successfully');

        // Hash admin password and update
        console.log('\n🔐 Setting up admin user...');
        const passwordHash = await bcrypt.hash('superadmin123', 10);

        const result = await occPool.query(
            `UPDATE users SET password_hash = $1 WHERE email = 'admin@occ.com'`,
            [passwordHash]
        );

        if (result.rowCount > 0) {
            console.log('✅ Admin user password configured');
        }

        // Verify setup
        const { rows: companies } = await occPool.query('SELECT * FROM companies');
        const { rows: users } = await occPool.query('SELECT id, name, email, role FROM users');

        console.log('\n📊 Database initialized successfully!');
        console.log('\n--- Companies ---');
        console.table(companies);
        console.log('\n--- Users ---');
        console.table(users);

        console.log('\n✨ Default Admin Credentials:');
        console.log('   Email: admin@occ.com');
        console.log('   Password: superadmin123');
        console.log('\n🚀 You can now run: npm start');

        await occPool.end();

    } catch (error) {
        console.error('\n❌ Error initializing database:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure PostgreSQL is installed and running');
        console.error('2. Verify postgres user password is "postgres" (or update this script)');
        console.error('3. Check if port 5432 is available');
        process.exit(1);
    }
}

initializeDatabase();
