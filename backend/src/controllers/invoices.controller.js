
import pool from "../config/db.js";

export const getInvoices = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT i.* FROM invoices i JOIN users u ON u.id = $1 WHERE (i.company_id = u.company_id OR u.role = 'Superadmin') ORDER BY i.created_at DESC",
            [req.user.id]
        );
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
            "INSERT INTO invoices (ticket_code, customer_name, customer_email, amount, description, created_by, company_id) VALUES ($1, $2, $3, $4, $5, $6, (SELECT company_id FROM users WHERE id = $6)) RETURNING *",
            [ticket_code, customer_name, customer_email, amount, description, user_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
