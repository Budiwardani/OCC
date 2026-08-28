import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";
import { complaintScope } from "../utils/access.util.js";
import { sendWhatsAppMessage, normalizePhone } from "../services/whatsapp.service.js";

export const dashboardStats = async (req, res) => {
    try {
        const scope = complaintScope(req.user);

        // Helper to construct query
        const getCount = async (status) => {
            let q = `SELECT COUNT(*) FROM complaints c WHERE 1=1${scope.sql}`;
            const params = [...scope.params];
            if (status) {
                q += ` AND c.status = $${params.length + 1}`;
                params.push(status);
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

export const getRecentActivity = async (req, res) => {
    try {
        const scope = complaintScope(req.user, "c", 1);
        const result = await pool.query(`
            SELECT a.id, a.action, a.entity, a.entity_id, a.created_at,
                   u.name AS user_name, c.ticket_code
            FROM audit_logs a
            LEFT JOIN users u ON u.id = a.user_id
            LEFT JOIN complaints c ON c.id = a.entity_id AND a.entity = 'complaint'
            WHERE 1 = 1${scope.sql}
            ORDER BY a.created_at DESC
            LIMIT 20
        `, scope.params);
        res.json(result.rows);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "getRecentActivity" });
        res.status(500).send("Server Error");
    }
};

export const getComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (page - 1) * limit;
        const { role } = req.user;

        let query = `
            SELECT c.*, u.name as assignee_name 
            FROM complaints c 
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        const scope = complaintScope(req.user, "c", paramCount);
        query += scope.sql;
        params.push(...scope.params);
        paramCount += scope.params.length;

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

        const countScope = complaintScope(req.user, "c", countParamCount);
        countQuery += countScope.sql;
        countParams.push(...countScope.params);
        countParamCount += countScope.params.length;

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
        const scope = complaintScope(req.user, "c", 2);
        const result = await pool.query(`
                        SELECT c.*, u.name as assignee_name,
                            COALESCE((SELECT json_agg(json_build_object(
                                'id', r.id, 'message', r.message, 'is_internal', r.is_internal,
                                'responder', ru.name, 'created_at', r.created_at
                            ) ORDER BY r.created_at ASC)
                            FROM complaint_responses r LEFT JOIN users ru ON r.responder_id = ru.id
                            WHERE r.complaint_id = c.id), '[]'::json) AS responses
            FROM complaints c
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE c.id = $1${scope.sql}
    `, [id, ...scope.params]);

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
        if (assigned_to !== undefined) {
            if (assigned_to !== null && assigned_to !== "") {
                const assignee = await pool.query(
                    "SELECT id FROM users WHERE id = $1 AND ($2 = 'Superadmin' OR company_id = $3) AND role IN ('Agent', 'Manager')",
                    [assigned_to, req.user.role, req.user.company_id]
                );
                if (assignee.rows.length === 0) {
                    return res.status(400).json({ message: "Assignee is invalid or outside your company" });
                }
            }
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

        const scope = complaintScope(req.user, "c", paramCount);
        const query = `UPDATE complaints SET ${updates.join(", ")} WHERE id = $1${scope.sql} RETURNING *`;
        const result = await pool.query(query, [...params, ...scope.params]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Complaint not found or not accessible" });
        }

        await pool.query(
            "INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES ($1, $2, $3, $4)",
            [req.user.id, "UPDATE_COMPLAINT", "complaint", id]
        );
        await pool.query(
            `INSERT INTO complaint_sla (complaint_id, response_deadline, resolution_deadline)
             VALUES ($1, NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days')
             ON CONFLICT (complaint_id) DO NOTHING`,
            [id]
        );

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

export const updateAgent = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, company_id } = req.body;

    try {
        const current = await pool.query("SELECT id, role, company_id FROM users WHERE id = $1", [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: "User not found" });

        const target = current.rows[0];
        if (req.user.role !== "Superadmin" && target.company_id !== req.user.company_id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (target.id === req.user.id && role && role !== "Superadmin") {
            return res.status(400).json({ message: "You cannot remove your own Superadmin role" });
        }
        if (req.user.role !== "Superadmin" && role && role !== "Agent") {
            return res.status(403).json({ message: "Managers can only manage Agents" });
        }

        const fields = [];
        const params = [];
        const add = (field, value) => {
            if (value !== undefined) {
                params.push(value);
                fields.push(`${field} = $${params.length}`);
            }
        };

        add("name", name);
        add("email", email);
        add("role", role);
        add("company_id", req.user.role === "Superadmin" ? company_id : req.user.company_id);
        if (password) {
            params.push(await bcrypt.hash(password, 10));
            fields.push(`password_hash = $${params.length}`);
        }
        if (fields.length === 0) return res.status(400).json({ message: "No updates provided" });

        params.push(id);
        const result = await pool.query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = $${params.length}
             RETURNING id, name, email, role, company_id`,
            params
        );
        res.json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "updateAgent" });
        res.status(err.code === "23505" ? 400 : 500).json({ message: err.code === "23505" ? "Email already exists" : "Server Error" });
    }
};

export const deleteAgent = async (req, res) => {
    const { id } = req.params;
    try {
        if (Number(id) === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }
        const scope = req.user.role === "Superadmin" ? "" : " AND company_id = $2";
        const params = req.user.role === "Superadmin" ? [id] : [id, req.user.company_id];
        const result = await pool.query(`DELETE FROM users WHERE id = $1${scope} RETURNING id`, params);
        if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "deleteAgent" });
        res.status(500).json({ message: "Server Error" });
    }
};

export const notifyComplaint = async (req, res) => {
    const { id } = req.params;
    const { method, from_email_id } = req.body;

    try {
        const scope = complaintScope(req.user, "c", 2);
        const complaint = await pool.query(`SELECT * FROM complaints c WHERE c.id = $1${scope.sql}`, [id, ...scope.params]);
        if (complaint.rows.length === 0) return res.status(404).json({ message: "Complaint not found" });

        const c = complaint.rows[0];
        const targetEmail = c.customer_email;
        const ticket = c.ticket_code;

        if (method === 'email') {
            const sender = await pool.query("SELECT * FROM official_emails WHERE id = $1", [from_email_id]);
            if (sender.rows.length === 0) return res.status(400).json({ message: "Invalid sender email ID" });

            const fromAddress = sender.rows[0].email;
            const fromName = sender.rows[0].name;

            // Mock Email Sending
            console.log(`[MOCK EMAIL] From: ${fromName} <${fromAddress}>`);
            console.log(`[MOCK EMAIL] To: ${targetEmail}`);
            console.log(`[MOCK EMAIL] Subject: Ticket #${ticket} Update`);

            return res.json({ message: `Email sent to ${targetEmail} from ${fromAddress}` });
        }

        if (method === 'whatsapp') {
            if (!c.phone) {
                return res.status(400).json({ success: false, message: "Customer tidak memiliki nomor telepon / WhatsApp." });
            }

            const appUrl = process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;
            const uploadLink = `${appUrl}/upload-surat/${c.ticket_code}?token=${encodeURIComponent(c.public_token || '')}`;

            // Fetch master template if available
            let templateLink = "";
            try {
                const mt = await pool.query("SELECT file_path FROM master_files WHERE file_key = 'SURAT_KUASA_TEMPLATE'");
                if (mt.rows.length > 0 && mt.rows[0].file_path) {
                    const baseUrl = appUrl.replace(/\/api\/?$/, "");
                    templateLink = `\n\nDownload Template Surat Kuasa: ${baseUrl}/${mt.rows[0].file_path.replace(/^\//, '')}`;
                }
            } catch (e) {
                // Ignore template fetch error
            }

            const text = [
                `Halo ${c.customer_name || "Pelapor"},`,
                ``,
                `Update status laporan tiket #${c.ticket_code}:`,
                `Status: ${c.status}`,
                `Subjek: ${c.subject}`,
                templateLink,
                c.public_token ? `\nSilakan tanda tangani dokumen dan unggah melalui tautan berikut:\n${uploadLink}` : "",
            ].filter(Boolean).join("\n");

            const waResult = await sendWhatsAppMessage({ phone: c.phone, text });

            if (waResult.success) {
                return res.json({
                    success: true,
                    direct: true,
                    message: `Pesan WhatsApp berhasil dikirim langsung ke nomor ${c.phone}!`
                });
            } else {
                const recipient = normalizePhone(c.phone);
                const fallbackUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(text)}`;
                return res.json({
                    success: false,
                    direct: false,
                    fallbackUrl,
                    reason: waResult.reason,
                    message: `Gateway belum terhubung (${waResult.reason}). Membuka WhatsApp Web...`
                });
            }
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
        const scope = complaintScope(req.user, "c", 2);
        const complaint = await pool.query(`SELECT * FROM complaints c WHERE c.id = $1${scope.sql}`, [id, ...scope.params]);
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
        let query = "SELECT * FROM complaints c WHERE 1=1";
        const params = [];
        const scope = complaintScope(req.user, "c", 1);
        query += scope.sql;
        params.push(...scope.params);

        if (status && status !== 'ALL') {
            query += ` AND c.status = $${params.length + 1}`;
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

export const createComplaintResponse = async (req, res) => {
    const { id } = req.params;
    const { message, is_internal = false } = req.body;

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ message: "Response message is required" });
    }

    try {
        const scope = complaintScope(req.user, "c", 2);
        const complaint = await pool.query(`SELECT c.id FROM complaints c WHERE c.id = $1${scope.sql}`, [id, ...scope.params]);
        if (complaint.rows.length === 0) {
            return res.status(404).json({ message: "Complaint not found or not accessible" });
        }

        const result = await pool.query(
            "INSERT INTO complaint_responses (complaint_id, responder_id, message, is_internal) VALUES ($1, $2, $3, $4) RETURNING *",
            [id, req.user.id, message.trim(), Boolean(is_internal)]
        );
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES ($1, $2, $3, $4)",
            [req.user.id, "CREATE_RESPONSE", "complaint", id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createComplaintResponse" });
        res.status(500).send("Server Error");
    }
};
