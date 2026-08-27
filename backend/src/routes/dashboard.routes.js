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
    exportComplaints,
    createComplaintResponse,
    getRecentActivity,
    updateAgent,
    deleteAgent
} from "../controllers/dashboard.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", auth, dashboardStats);
router.get("/activity", auth, getRecentActivity);
router.get("/complaints", auth, getComplaints);
router.get("/complaints/export", auth, exportComplaints); // Define export BEFORE :id to avoid conflict logic
router.get("/complaints/:id", auth, getComplaint);
router.put("/complaints/:id", auth, updateComplaint);
router.post("/complaints/:id/responses", auth, createComplaintResponse);
router.get("/agents", auth, authorizeRole(['Superadmin', 'Manager']), getAgents);
router.post("/agents", auth, authorizeRole(['Superadmin', 'Manager']), createAgent);
router.put("/agents/:id", auth, authorizeRole(['Superadmin', 'Manager']), updateAgent);
router.delete("/agents/:id", auth, authorizeRole(['Superadmin', 'Manager']), deleteAgent);
router.post("/complaints/:id/notify", auth, notifyComplaint);
router.post("/complaints/:id/forward", auth, forwardComplaint);

export default router;
