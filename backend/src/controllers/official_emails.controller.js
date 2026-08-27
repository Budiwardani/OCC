import db from "../config/db.js";

export const getAll = async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT * FROM official_emails WHERE company_id = $1 OR $2 = 'Superadmin' ORDER BY id ASC",
            [req.user.company_id, req.user.role]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const create = async (req, res) => {
    const { name, email } = req.body;
    try {
        const { rows } = await db.query(
            "INSERT INTO official_emails (name, email, company_id) VALUES ($1, $2, $3) RETURNING *",
            [name, email, req.user.company_id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const remove = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM official_emails WHERE id = $1 AND (company_id = $2 OR $3 = 'Superadmin')", [id, req.user.company_id, req.user.role]);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
