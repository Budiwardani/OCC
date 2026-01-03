import { Router } from "express";
import { getBranding, updateBranding } from "../controllers/branding.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getBranding);
router.put("/", auth, updateBranding);

export default router;
