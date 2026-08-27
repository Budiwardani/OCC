import db from "../config/db.js";
import { generateTicket, generatePublicToken } from "../utils/ticket.util.js";
import { sendWhatsAppTicket } from "../services/whatsapp.service.js";

export const getPublicStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'OPEN') as waiting,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as process,
                COUNT(*) FILTER (WHERE status = 'RESOLVED' OR status = 'CLOSED') as done
            FROM complaints
        `;
        const { rows } = await db.query(query);
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getLatestComplaints = async (req, res) => {
    try {
        const query = `
            SELECT ticket_code, subject, status, city, created_at 
            FROM complaints 
            ORDER BY created_at DESC 
            LIMIT 5
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching latest:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const submitComplaint = async (req, res) => {
    const token = generatePublicToken();

    const {
        customer_name,
        customer_email,
        category,
        subject,
        description,
        phone,
        location,
        city
    } = req.body;

    const files = req.files || [];

    // Helper for 30-digit format
    const generateTicketCode30 = async (catId) => {
        // YYMMDD
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd = now.getDate().toString().padStart(2, '0');
        const datePart = `${yy}${mm}${dd}`;

        // OCC
        const staticPart = "OCC";

        // ID Kategori (Clean it to be safe? User input)
        const catPart = catId || "GEN"; // Fallback

        const prefix = `${datePart}${staticPart}${catPart}`;
        const remaining = 30 - prefix.length;

        if (remaining < 1) {
            return prefix.substring(0, 30);
        }

        // Sequence
        const seqRes = await db.query("UPDATE sequences SET current_value = current_value + 1 WHERE name = 'ticket_seq' RETURNING current_value");
        const seqNum = seqRes.rows[0].current_value;

        // Pad Sequence
        const seqStr = seqNum.toString().padStart(remaining, '0');

        return `${prefix}${seqStr}`;
    };

    try {
        const ticket = await generateTicketCode30(category);

        const { rows } = await db.query(
            `INSERT INTO complaints 
        (ticket_code, public_token, customer_name, customer_email, category, subject, description, status, phone, location, city, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'OPEN', $8, $9, $10, NOW())
        RETURNING id, ticket_code, public_token`,
            [ticket, token, customer_name, customer_email, category, subject, description, phone, location, city]
        );

        const newComplaint = rows[0];

        // Insert attachments if any
        if (files.length > 0) {
            const attachmentParams = [];
            const attachmentValues = files.map((file, index) => {
                const complaintParam = index * 2 + 1;
                const fileParam = complaintParam + 1;
                attachmentParams.push(newComplaint.id, file.path.replace(/\\/g, '/'));
                return `($${complaintParam}, $${fileParam})`;
            }).join(',');
            await db.query(`INSERT INTO complaint_attachments (complaint_id, file_path) VALUES ${attachmentValues}`, attachmentParams);
        }

        const trackingUrl = `${process.env.PUBLIC_APP_URL || "http://localhost:5173"}/?tab=tracking`;
        sendWhatsAppTicket({
            phone,
            customerName: customer_name,
            ticketCode: newComplaint.ticket_code,
            trackingUrl,
        }).catch((error) => {
            console.error("WhatsApp notification failed after complaint save:", error.message);
        });

        res.status(201).json({ ticket_code: newComplaint.ticket_code, public_token: newComplaint.public_token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const trackComplaint = async (req, res) => {
    const { ticket, email, token } = req.query;

    if (!ticket || !email || !token) {
        return res.status(400).json({ error: 'Ticket, email, dan token wajib diisi.' });
    }

    try {
        // Query matching Ticket AND Email
        const { rows } = await db.query(
            `SELECT ticket_code, customer_name, category, subject, description, status, created_at, location, city,
         (SELECT json_agg(json_build_object('message', m.message, 'responder', u.name, 'created_at', m.created_at)) 
          FROM complaint_responses m LEFT JOIN users u ON m.responder_id = u.id 
          WHERE m.complaint_id = complaints.id AND m.is_internal = false) as responses
         FROM complaints 
            WHERE ticket_code=$1 AND customer_email=$2 AND public_token=$3`,
                [ticket, email, token]
        );

        if (!rows.length) return res.status(404).json({ error: 'Laporan tidak ditemukan atau email tidak sesuai.' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
