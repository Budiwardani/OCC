import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // Hash the admin password
        const passwordHash = await bcrypt.hash('superadmin123', 10);

        // Update the admin user with the hashed password
        const result = await pool.query(
            `UPDATE users SET password_hash = $1 WHERE email = 'admin@occ.com'`,
            [passwordHash]
        );

        if (result.rowCount > 0) {
            console.log('✅ Admin user password updated successfully');
            console.log('Admin Credentials:');
            console.log('Email: admin@occ.com');
            console.log('Password: superadmin123');
        } else {
            console.log('No admin user found to update');
        }

        await pool.end();
        console.log('Database setup complete!');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
