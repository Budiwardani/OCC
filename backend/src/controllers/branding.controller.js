import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const getBranding = async (req, res) => {
    try {
        // Assuming single company mode for now, or fetch by ID if multi-tenant
        const result = await pool.query("SELECT name, address, phone, email_support, maps_location, social_media, logo_url FROM companies LIMIT 1");
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "getBranding" });
        res.status(500).send("Server Error");
    }
};

export const updateBranding = async (req, res) => {
    try {
        const { name, address, phone, email_support, maps_location, social_media, logo_url } = req.body;

        // Ensure social_media is a valid object or null, PG handles object -> jsonb automatic stringify usually
        // but explicit JSON.stringify can sometimes be safer if driver issues.
        // However, pg usually handles JS objects fine for JSONB.

        const query = `
            UPDATE companies 
            SET name = COALESCE($1, name),
                address = COALESCE($2, address),
                phone = COALESCE($3, phone),
                email_support = COALESCE($4, email_support),
                maps_location = COALESCE($5, maps_location),
                social_media = COALESCE($6, social_media),
                logo_url = COALESCE($7, logo_url),
                updated_at = NOW()
            WHERE id = (SELECT id FROM companies LIMIT 1)
            RETURNING *
        `;

        const result = await pool.query(query, [name, address, phone, email_support, maps_location, social_media, logo_url]);

        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "updateBranding" });
        // Send the error message to the client for debugging purposes (since we are in DEV mode practically)
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
