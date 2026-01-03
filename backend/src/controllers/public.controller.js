import db from "../config/db.js";
import { generateTicket, generatePublicToken } from "../utils/ticket.util.js";

export const submitComplaint = async (req, res) => {
    const ticket = generateTicket();
    const token = generatePublicToken();

    const {
        customer_name,
        customer_email,
        category,
        subject,
        description
    } = req.body;

    try {
        const { rows } = await db.query(
            `INSERT INTO complaints 
        (ticket_code, public_token, customer_name, customer_email, category, subject, description, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'OPEN')
        RETURNING ticket_code, public_token`,
            [ticket, token, customer_name, customer_email, category, subject, description]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const trackComplaint = async (req, res) => {
    const { ticket, token } = req.query;

    try {
        const { rows } = await db.query(
            `SELECT ticket_code, customer_name, category, subject, description, status, created_at, 
         (SELECT json_agg(json_build_object('message', m.message, 'responder', u.name, 'created_at', m.created_at)) 
          FROM complaint_responses m LEFT JOIN users u ON m.responder_id = u.id 
          WHERE m.complaint_id = complaints.id AND m.is_internal = false) as responses
         FROM complaints 
         WHERE ticket_code=$1 AND public_token=$2`,
            [ticket, token]
        );

        if (!rows.length) return res.sendStatus(404);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
