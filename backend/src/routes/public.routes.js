import { Router } from "express";
import { submitComplaint, trackComplaint } from "../controllers/public.controller.js";

const router = Router();

router.post("/complaints", submitComplaint);
router.get("/tracking", trackComplaint);

export default router;
