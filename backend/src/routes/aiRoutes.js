import { Router } from "express";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import db from "../config/db.js";

const router = Router();

// --- Smart Knowledge Base Fallback for Chat ---
const getSmartReply = (query) => {
    const q = query.toLowerCase();

    if (q.includes("halo") || q.includes("hi") || q.includes("hai") || q.includes("selamat")) {
        return "Halo! Saya Virtual Assistant OCC (Online Customer Complaint). Saya bisa membantu Anda mencari tiket keluhan berdasarkan nomor HP, mengecek status laporan, atau memberikan panduan seputar layanan OCC. Ada yang bisa saya bantu?";
    }
    if (q.includes("lapor") || q.includes("buat laporan") || q.includes("komplain") || q.includes("pengaduan")) {
        return "Untuk membuat laporan keluhan baru:\n1. Buka tab 'Buat Laporan' pada menu utama.\n2. Isi data diri (Nama, No HP/WhatsApp, Email).\n3. Pilih kategori keluhan dan tuliskan detail masalah Anda.\n4. Lampirkan foto/dokumen pendukung jika ada.\n5. Klik 'Kirim Laporan'. Anda akan mendapatkan Nomor Tiket dan Token Publik.";
    }
    if (q.includes("lacak") || q.includes("status") || q.includes("tiket") || q.includes("token") || q.includes("cek")) {
        return "Anda bisa mencari tiket & status keluhan Anda dengan 2 cara:\n1. Gunakan tab '🔍 Cari Tiket & Status' pada jendela Virtual Assistant ini dan masukkan No HP Anda.\n2. Atau buka menu 'Lacak Laporan' pada halaman utama, lalu masukkan Nomor Tiket, Email, dan Token Publik Anda.";
    }
    if (q.includes("surat kuasa") || q.includes("upload surat") || q.includes("dokumen")) {
        return "Untuk mengunggah Surat Kuasa:\n1. Unduh template Surat Kuasa standar jika diminta oleh admin.\n2. Tanda tangani dokumen tersebut.\n3. Unggah kembali melalui tautan yang dikirimkan ke WhatsApp Anda atau melalui menu upload surat kuasa dengan memasukkan nomor tiket dan token Anda.";
    }
    if (q.includes("kontak") || q.includes("cs") || q.includes("hubungi") || q.includes("bantuan") || q.includes("admin")) {
        return "Untuk bantuan lebih lanjut, Anda dapat menghubungi tim support kami melalui WhatsApp atau email resmi yang tertera pada informasi kontak layanan OCC.";
    }
    return "Saya Virtual Assistant OCC. Anda dapat menanyakan seputar pembuatan laporan, cara lacak status tiket, upload surat kuasa, atau gunakan tab '🔍 Cari Tiket & Status' untuk mencari semua keluhan Anda berdasarkan nomor HP.";
};

// --- AI Chat ---
router.post("/chat", rateLimit({ windowMs: 60_000, max: 30 }), async (req, res) => {
    const { message } = req.body;
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for Ollama

        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen2.5-coder:3b",
                prompt: `Anda adalah Virtual Assistant untuk sistem OCC (Online Customer Complaint). Jawablah dengan ramah, profesional, dan ringkas dalam Bahasa Indonesia.\nPertanyaan: ${message}`,
                stream: false,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.response && data.response.trim()) {
                return res.json({ reply: data.response.trim() });
            }
        }
        // Fallback to smart knowledge base
        return res.json({ reply: getSmartReply(message) });
    } catch {
        // Fallback to smart knowledge base
        return res.json({ reply: getSmartReply(message) });
    }
});

// --- Search Complaints by Phone, Ticket, Token, or Name (Public & Admin) ---
router.get("/search", rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
    const rawSearch = (req.query.query || req.query.phone || req.query.search || "").trim();
    const { status, category } = req.query;

    if (!rawSearch) {
        return res.status(400).json({ error: "Masukkan nomor HP, nomor tiket, token, atau nama untuk mencari." });
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
                OR regexp_replace(COALESCE(c.phone, ''), '[^0-9]', '', 'g') LIKE $${idx++}
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
