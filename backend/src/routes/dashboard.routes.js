import { Router } from "express";
import {
    dashboardStats,
    getComplaints,
    getComplaint,
    updateComplaint,
    getAgents,
    createAgent,
    notifyComplaint,
    forwardComplaint,
    exportComplaints
} from "../controllers/dashboard.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", auth, dashboardStats);
router.get("/complaints", auth, getComplaints);
router.get("/complaints/export", auth, exportComplaints); // Define export BEFORE :id to avoid conflict logic
router.get("/complaints/:id", auth, getComplaint);
router.put("/complaints/:id", auth, updateComplaint);
router.get("/agents", auth, authorizeRole(['Superadmin', 'Manager']), getAgents);
router.post("/agents", auth, authorizeRole(['Superadmin', 'Manager']), createAgent);
router.post("/complaints/:id/notify", auth, notifyComplaint);
router.post("/complaints/:id/forward", auth, forwardComplaint);

export default router;
