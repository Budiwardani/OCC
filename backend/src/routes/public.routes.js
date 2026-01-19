import { Router } from "express";
import { submitComplaint, trackComplaint, getPublicStats, getLatestComplaints } from "../controllers/public.controller.js";

import upload from "../middleware/upload.middleware.js";

const router = Router();

router.get("/stats", getPublicStats);
router.get("/latest", getLatestComplaints);
router.post("/complaints", upload.array("media", 5), submitComplaint);
router.get("/tracking", trackComplaint);

export default router;
