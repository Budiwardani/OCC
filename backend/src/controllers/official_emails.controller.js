import db from "../config/db.js";

export const getAll = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM official_emails ORDER BY id ASC");
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
            "INSERT INTO official_emails (name, email) VALUES ($1, $2) RETURNING *",
            [name, email]
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
        await db.query("DELETE FROM official_emails WHERE id = $1", [id]);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
