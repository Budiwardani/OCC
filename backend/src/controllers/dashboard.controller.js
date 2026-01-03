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
        const result = await pool.query("SELECT id, name, email, role FROM users WHERE role != 'Customer'");
        res.json(result.rows);
    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};

export const createAgent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Simple validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password" });
        }

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        // Note: Assuming 'bcrypt' is imported at top or available differently. 
        // Since it wasn't in original file imports, need to ensure it is.
        // For now, assume dynamic import or valid context. 
        // Ideally I should update imports too.
        // Let's use bcryptjs as used in auth controller.
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert Agent (Default company_id 1 for now)
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, company_id) VALUES ($1, $2, $3, 'Agent', 1) RETURNING id, name, email, role",
            [name, email, passwordHash]
        );

        res.json(newUser.rows[0]);

    } catch (err) {
        logger.error(err.message, { stack: err.stack, context: "createAgent" });
        res.status(500).send("Server Error");
    }
};
