import db from "../config/db.js";

export const uploadDraft = async (req, res) => {
    // Admin uploads a draft for a specific ticket
    const { ticket_code } = req.body;
    const file = req.file;

    if (!file || !ticket_code) return res.status(400).json({ error: "File and Ticket Code required" });

    try {
        const { rows } = await db.query(
            "INSERT INTO surat_kuasa (ticket_code, file_path, uploaded_by) VALUES ($1, $2, 'ADMIN') RETURNING *",
            [ticket_code, file.path.replace(/\\/g, '/')]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getFiles = async (req, res) => {
    const { ticket } = req.params;
    try {
        const { rows } = await db.query(
            "SELECT * FROM surat_kuasa WHERE ticket_code = $1 ORDER BY created_at DESC",
            [ticket]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getSignedFiles = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT sk.*, c.customer_name, c.phone 
            FROM surat_kuasa sk
            JOIN complaints c ON sk.ticket_code = c.ticket_code
            WHERE sk.uploaded_by = 'CUSTOMER'
            ORDER BY sk.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const lookupTicket = async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    try {
        // Find latest ticket for this phone number
        const { rows } = await db.query(
            "SELECT ticket_code, customer_name, status FROM complaints WHERE phone LIKE $1 ORDER BY created_at DESC LIMIT 1",
            [`%${phone}%`]
        );

        if (rows.length === 0) return res.status(404).json({ message: "No ticket found for this number" });

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const uploadCustomerFile = async (req, res) => {
    const { ticket_code } = req.body;
    const file = req.file;

    if (!file || !ticket_code) return res.status(400).json({ error: "File and Ticket Code required" });

    try {
        // Verify ticket exists
        const ticketCheck = await db.query("SELECT id FROM complaints WHERE ticket_code = $1", [ticket_code]);
        if (ticketCheck.rows.length === 0) return res.status(404).json({ error: "Invalid Ticket Code" });

        const { rows } = await db.query(
            "INSERT INTO surat_kuasa (ticket_code, file_path, uploaded_by) VALUES ($1, $2, 'CUSTOMER') RETURNING *",
            [ticket_code, file.path.replace(/\\/g, '/')]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
