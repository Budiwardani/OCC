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

// --- Search Complaints (Admin only) ---
router.get("/search", auth, rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
    const rawSearch = (req.query.query || req.query.phone || req.query.search || "").trim();
    const { status, category } = req.query;

    if (!rawSearch) {
        return res.status(400).json({ error: "Masukkan nomor HP, no tiket, token, atau nama untuk mencari." });
    }

    // Clean digits for phone matching
    const digitsOnly = rawSearch.replace(/\D/g, "");
    const normalizedPhone = digitsOnly.startsWith("62")
        ? digitsOnly.slice(2)
        : digitsOnly.startsWith("0")
        ? digitsOnly.slice(1)
        : digitsOnly;

    try {
        const params = [`%${rawSearch}%`];
        let idx = 2;

        let searchCondition = `(
            c.ticket_code ILIKE $1
            OR c.public_token ILIKE $1
            OR c.customer_name ILIKE $1
            OR c.customer_email ILIKE $1
            OR c.subject ILIKE $1
            OR c.phone ILIKE $1
        )`;

        if (normalizedPhone && normalizedPhone.length >= 3) {
            params.push(`%${normalizedPhone}%`);
            searchCondition = `(
                c.ticket_code ILIKE $1
                OR c.public_token ILIKE $1
                OR c.customer_name ILIKE $1
                OR c.customer_email ILIKE $1
                OR c.subject ILIKE $1
                OR c.phone ILIKE $1
                OR regexp_replace(c.phone, '\\D', '', 'g') LIKE $${idx++}
            )`;
        }

        const conditions = [searchCondition];

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
                c.id,
                c.ticket_code,
                c.public_token,
                c.customer_name,
                c.customer_email,
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
        res.status(500).json({ error: "Gagal mencari data keluhan: " + error.message });
    }
});

export default router;
