import db from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migration_official_emails.sql'), 'utf8');
        await db.query(sql);
        console.log("Migration official_emails applied successfully");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
};

runMigration();
