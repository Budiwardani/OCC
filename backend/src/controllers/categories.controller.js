import pool from "../config/db.js";
import logger from "../utils/logger.js";

// Public: Get all active categories
export const getCategories = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories WHERE is_active = TRUE ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "getCategories" });
        res.status(500).send("Server Error");
    }
};

// Admin: Create a new category
export const createCategory = async (req, res) => {
    try {
        const { id, name } = req.body;

        // Basic validation
        if (!id || !name) {
            return res.status(400).json({ message: "ID and Name are required" });
        }

        const result = await pool.query(
            "INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING *",
            [id, name]
        );
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createCategory" });
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: "Category ID or Name already exists" });
        }
        res.status(500).send("Server Error");
    }
};

// Admin: Delete (or deactivate) a category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);
        res.json({ message: "Category deleted" });
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "deleteCategory" });
        res.status(500).send("Server Error");
    }
};
