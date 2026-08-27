import db from './src/config/db.js';
import bcrypt from 'bcryptjs';

const fixAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);

        console.log("Updating admin user...");

        // Check if exists
        const check = await db.query("SELECT * FROM users WHERE email = 'admin@occ.com'");

        if (check.rows.length > 0) {
            await db.query(
                "UPDATE users SET password_hash = $1, role = 'Superadmin' WHERE email = 'admin@occ.com'",
                [hashedPassword]
            );
            console.log("Admin user updated to Superadmin with password 'superadmin123'");
        } else {
            // Create company if needed
            const compCheck = await db.query("SELECT id FROM companies LIMIT 1");
            let compId;
            if (compCheck.rows.length === 0) {
                const newComp = await db.query("INSERT INTO companies (name) VALUES ('Default Company') RETURNING id");
                compId = newComp.rows[0].id;
            } else {
                compId = compCheck.rows[0].id;
            }

            await db.query(
                "INSERT INTO users (company_id, name, email, password_hash, role) VALUES ($1, 'Super Admin', 'admin@occ.com', $2, 'Superadmin')",
                [compId, hashedPassword]
            );
            console.log("Admin user created.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
};

fixAdmin();
