import pool from "../config/db.js";
import logger from "../utils/logger.js";

export const getCompanies = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM companies ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "getCompanies" });
        res.status(500).send("Server Error");
    }
};

export const createCompany = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Company name is required" });
        }

        const result = await pool.query(
            "INSERT INTO companies (name) VALUES ($1) RETURNING *",
            [name]
        );
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createCompany" });
        res.status(500).send("Server Error");
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Company name is required" });
        }

        const result = await pool.query(
            "UPDATE companies SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "updateCompany" });
        res.status(500).send("Server Error");
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if company has users or complaints? 
        // For now, let's just try delete. Foreign keys might restrict it, enabling 'ON DELETE RESTRICT' behavior by default if not specified.
        // Assuming we want to allow delete.

        const result = await pool.query("DELETE FROM companies WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.json({ message: "Company deleted successfully" });
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "deleteCompany" });
        // Handle FK violation
        if (err.code === '23503') {
            return res.status(400).json({ message: "Cannot delete company because it has associated users or complaints." });
        }
        res.status(500).send("Server Error");
    }
};
