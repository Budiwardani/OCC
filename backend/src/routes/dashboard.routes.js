import { Router } from "express";
import {
    dashboardStats,
    getComplaints,
    getComplaint,
    updateComplaint,
    getAgents,
    createAgent
} from "../controllers/dashboard.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", auth, dashboardStats);
router.get("/complaints", auth, getComplaints);
router.get("/complaints/:id", auth, getComplaint);
router.put("/complaints/:id", auth, updateComplaint);
router.get("/agents", auth, getAgents);
router.post("/agents", auth, createAgent);

export default router;
