
import pool from "../config/db.js";

export const getInvoices = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM invoices ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const createInvoice = async (req, res) => {
    const { ticket_code, customer_name, customer_email, amount, description } = req.body;
    const { id: user_id } = req.user;

    try {
        const result = await pool.query(
            "INSERT INTO invoices (ticket_code, customer_name, customer_email, amount, description, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [ticket_code, customer_name, customer_email, amount, description, user_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
