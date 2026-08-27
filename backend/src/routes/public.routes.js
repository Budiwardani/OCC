import { Router } from "express";
import { submitComplaint, trackComplaint, getPublicStats, getLatestComplaints } from "../controllers/public.controller.js";

import upload from "../middleware/upload.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

const router = Router();

const publicLimit = rateLimit({ windowMs: 60_000, max: 60 });
const submissionLimit = rateLimit({ windowMs: 60_000, max: 10 });

router.get("/stats", publicLimit, getPublicStats);
router.get("/latest", publicLimit, getLatestComplaints);
router.post("/complaints", submissionLimit, upload.array("media", 5), submitComplaint);
router.get("/tracking", publicLimit, trackComplaint);

export default router;
