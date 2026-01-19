import { Router } from "express";
import { getBranding, updateBranding } from "../controllers/branding.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getBranding);
router.put("/", auth, authorizeRole(['Superadmin']), updateBranding);

export default router;
