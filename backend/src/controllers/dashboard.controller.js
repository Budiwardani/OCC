import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";

export const dashboardStats = async (req, res) => {
    try {
        const { role, id } = req.user;
        let querySuffix = "";
        const params = [];

        if (role !== 'Superadmin') {
            querySuffix = " AND assigned_to = $1";
            params.push(id);
        }

        // Helper to construct query
        const getCount = async (status) => {
            let q = `SELECT COUNT(*) FROM complaints WHERE 1=1 ${querySuffix}`;
            if (status) {
                q += ` AND status = '${status}'`;
            }
            const result = await pool.query(q, params);
            return parseInt(result.rows[0].count);
        };

        const total = await getCount();
        const open = await getCount('OPEN');
        const inProgress = await getCount('IN_PROGRESS');
        const resolved = await getCount('RESOLVED');

        res.json({ total, open, in_progress: inProgress, resolved });
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};

export const getComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (page - 1) * limit;
        const { role, id } = req.user;

        let query = `
            SELECT c.*, u.name as assignee_name 
            FROM complaints c 
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        // RBAC Filter
        if (role !== 'Superadmin') {
            query += ` AND c.assigned_to = $${paramCount}`;
            params.push(id);
            paramCount++;
        }

        if (status && status !== 'ALL') {
            query += ` AND c.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (search) {
            query += ` AND (c.ticket_code ILIKE $${paramCount} OR c.subject ILIKE $${paramCount} OR c.customer_email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count for pagination
        let countQuery = "SELECT COUNT(*) FROM complaints c WHERE 1=1";
        const countParams = [];
        let countParamCount = 1;

        if (role !== 'Superadmin') {
            countQuery += ` AND c.assigned_to = $${countParamCount}`;
            countParams.push(id);
            countParamCount++;
        }

        if (status && status !== 'ALL') {
            countQuery += ` AND c.status = $${countParamCount}`;
            countParams.push(status);
            countParamCount++;
        }

        if (search) {
            countQuery += ` AND (c.ticket_code ILIKE $${countParamCount} OR c.subject ILIKE $${countParamCount} OR c.customer_email ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
            countParamCount++;
        }

        const countResult = await pool.query(countQuery, countParams);

        res.json({
            complaints: result.rows,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
            currentPage: parseInt(page),
            totalItems: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};

export const getComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT c.*, u.name as assignee_name 
            FROM complaints c
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE c.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};

export const updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_to, priority } = req.body;

        const updates = [];
        const params = [id];
        let paramCount = 2;

        if (status) {
            updates.push(`status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }
        if (assigned_to) {
            updates.push(`assigned_to = $${paramCount}`);
            params.push(assigned_to);
            paramCount++;
        }
        if (priority) {
            updates.push(`priority = $${paramCount}`);
            params.push(priority);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.json({ message: "No updates provided" });
        }

        const query = `UPDATE complaints SET ${updates.join(", ")} WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, params);

        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};

export const getAgents = async (req, res) => {
    try {
        const { role, company_id } = req.user;
        let query = `
            SELECT u.id, u.name, u.email, u.role, u.company_id, c.name as company_name 
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE u.role != 'Customer'
        `;
        const params = [];

        if (role !== 'Superadmin') {
            query += " AND u.company_id = $1";
            params.push(company_id);
        }

        query += " ORDER BY u.id ASC";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "getAgents" });
        res.status(500).send("Server Error");
    }
};

export const createAgent = async (req, res) => {
    try {
        const { name, email, password, role: requestedRole, company_id: requestedCompanyId } = req.body;
        const { role: userRole, company_id: userCompanyId } = req.user;

        // Simple validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password" });
        }

        // Determine Role and Company
        let finalRole = 'Agent';
        let finalCompanyId = 1;

        if (userRole === 'Superadmin') {
            finalRole = requestedRole || 'Agent';
            finalCompanyId = requestedCompanyId || 1;
        } else if (userRole === 'Manager') {
            finalRole = 'Agent'; // Managers can only create Agents
            finalCompanyId = userCompanyId; // Managers can only create for their company
        } else {
            // Managers/Agents generally shouldn't reach here due to route protection, 
            // but if they do, fallback to safe defaults or error?
            // Route protection currently allows 'Superadmin' and 'Manager'.
            finalRole = 'Agent';
            finalCompanyId = userCompanyId;
        }

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, company_id",
            [name, email, passwordHash, finalRole, finalCompanyId]
        );

        res.json(newUser.rows[0]);

    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};

export const notifyComplaint = async (req, res) => {
    const { id } = req.params;
    const { method, from_email_id } = req.body;

    try {
        const complaint = await pool.query("SELECT * FROM complaints WHERE id = $1", [id]);
        if (complaint.rows.length === 0) return res.status(404).json({ message: "Complaint not found" });

        const targetEmail = complaint.rows[0].customer_email;
        const ticket = complaint.rows[0].ticket_code;

        if (method === 'email') {
            const sender = await pool.query("SELECT * FROM official_emails WHERE id = $1", [from_email_id]);
            if (sender.rows.length === 0) return res.status(400).json({ message: "Invalid sender email ID" });

            const fromAddress = sender.rows[0].email;
            const fromName = sender.rows[0].name;

            // Mock Email Sending
            console.log(`[MOCK EMAIL] From: ${fromName} <${fromAddress}>`);
            console.log(`[MOCK EMAIL] To: ${targetEmail}`);
            console.log(`[MOCK EMAIL] Subject: Ticket #${ticket} Update`);

            // Log this action? 
            // logger.info(...)

            return res.json({ message: `Email sent to ${targetEmail} from ${fromAddress}` });
        }

        res.status(400).json({ message: "Invalid method" });
    } catch (err) {
        logger.error(err.message, { context: "notifyComplaint" });
        res.status(500).send("Server Error");
    }
};

export const forwardComplaint = async (req, res) => {
    const { id } = req.params;
    const { target_email_id } = req.body;

    try {
        const complaint = await pool.query("SELECT * FROM complaints WHERE id = $1", [id]);
        if (complaint.rows.length === 0) return res.status(404).json({ message: "Complaint not found" });

        const ticket = complaint.rows[0].ticket_code;

        // Get target email
        const target = await pool.query("SELECT * FROM official_emails WHERE id = $1", [target_email_id]);
        if (target.rows.length === 0) return res.status(400).json({ message: "Invalid target email ID" });

        const toAddress = target.rows[0].email;
        const toName = target.rows[0].name;

        // Mock Forwarding
        console.log(`[MOCK EMAIL FORWARD] From: System`);
        console.log(`[MOCK EMAIL FORWARD] To: ${toName} <${toAddress}>`);
        console.log(`[MOCK EMAIL FORWARD] Subject: FWD: Ticket #${ticket}`);
        console.log(`[MOCK EMAIL FORWARD] Body: Complaint details attached...`);

        // Record in responses/history?
        // await pool.query("INSERT INTO complaint_responses (complaint_id, message, is_internal) VALUES ($1, $2, TRUE)", [id, `System forwarded ticket to ${toName} (${toAddress})`]);

        res.json({ message: `Ticket forwarded to ${toName} (${toAddress}) successfully` });
    } catch (err) {
        logger.error(err.message, { context: "forwardComplaint" });
        res.status(500).send("Server Error");
    }
};

export const exportComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        let query = "SELECT * FROM complaints WHERE 1=1";
        const params = [];

        if (status && status !== 'ALL') {
            query += " AND status = $1";
            params.push(status);
        }

        query += " ORDER BY created_at DESC";
        const { rows } = await pool.query(query, params);

        // Convert to CSV
        const headers = ["Ticket Code", "Date", "Customer", "Subject", "Status", "Priority", "Assignee"];
        let csv = headers.join(",") + "\n";

        rows.forEach(row => {
            const line = [
                row.ticket_code,
                new Date(row.created_at).toISOString().split('T')[0],
                row.customer_email,
                `"${(row.subject || "").replace(/"/g, '""')}"`, // Escape quotes
                row.status,
                row.priority,
                row.assigned_to || "Unassigned"
            ];
            csv += line.join(",") + "\n";
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('complaints_export.csv');
        res.send(csv);

    } catch (err) {
        logger.error(err.message, { context: "exportComplaints" });
        res.status(500).send("Server Error");
    }
};
