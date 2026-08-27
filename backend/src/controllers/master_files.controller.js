import db from "../config/db.js";

export const getMasterFile = async (req, res) => {
    const { key } = req.params;
    try {
        const { rows } = await db.query("SELECT * FROM master_files WHERE file_key = $1", [key]);
        if (rows.length === 0) return res.status(404).json({ message: "File not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

export const uploadMasterFile = async (req, res) => {
    const { key } = req.body; // e.g. 'surat_kuasa_template'
    const file = req.file;

    if (!file || !key) {
        return res.status(400).json({ message: "File and Key required" });
    }

    try {
        // Upsert logic
        const check = await db.query("SELECT * FROM master_files WHERE file_key = $1", [key]);

        let result;
        if (check.rows.length > 0) {
            // Update
            result = await db.query(
                "UPDATE master_files SET file_path = $1, name = $2, updated_at = CURRENT_TIMESTAMP WHERE file_key = $3 RETURNING *",
                [file.path, file.originalname, key]
            );
        } else {
            // Insert
            result = await db.query(
                "INSERT INTO master_files (file_key, name, file_path) VALUES ($1, $2, $3) RETURNING *",
                [key, file.originalname, file.path]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
