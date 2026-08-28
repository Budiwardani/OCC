import { Router } from "express";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { auth } from "../middleware/auth.middleware.js";
import db from "../config/db.js";

const router = Router();

// --- AI Chat ---
router.post("/chat", rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
    const { message } = req.body;
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
    }

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen2.5-coder:3b",
                prompt: message,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama returned ${response.status}`);
        }

        const data = await response.json();
        res.json({ reply: data.response || "AI tidak memberikan jawaban." });
    } catch {
        res.status(500).json({ reply: "Maaf, AI sedang gangguan." });
    }
});

// --- Search Complaints by Phone (Admin only) ---
router.get("/search", auth, rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
    const { phone, status, category } = req.query;

    if (!phone || phone.trim().length < 5) {
        return res.status(400).json({ error: "Nomor HP minimal 5 digit." });
    }

    // Normalize phone: strip leading 0 or +62, keep digits only
    const rawPhone = phone.trim().replace(/\D/g, "");
    const normalized = rawPhone.startsWith("62")
        ? rawPhone.slice(2)
        : rawPhone.startsWith("0")
        ? rawPhone.slice(1)
        : rawPhone;

    // Match phone ending pattern: last N digits
    const likePattern = `%${normalized}`;

    try {
        const params = [likePattern];
        let idx = 2;
        const conditions = [`c.phone LIKE $1`];

        if (status && status !== "ALL") {
            conditions.push(`c.status = $${idx++}`);
            params.push(status);
        }

        if (category && category !== "ALL") {
            conditions.push(`c.category = $${idx++}`);
            params.push(category);
        }

        const whereClause = conditions.join(" AND ");

        const { rows } = await db.query(
            `SELECT
                c.ticket_code,
                c.public_token,
                c.customer_name,
                c.phone,
                c.category,
                c.subject,
                c.status,
                c.city,
                c.created_at,
                c.description
            FROM complaints c
            WHERE ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT 50`,
            params
        );

        res.json({ results: rows, total: rows.length });
    } catch (error) {
        console.error("VA search error:", error);
        res.status(500).json({ error: "Gagal mencari data keluhan." });
    }
});

export default router;
