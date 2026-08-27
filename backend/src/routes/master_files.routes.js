import { Router } from "express";
import { getMasterFile, uploadMasterFile } from "../controllers/master_files.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

// Public Get (for customers downloading template) ? Or Protected?
// Ideally public or protected by ticket token. For simplicity, let's make it public for now 
// so the link works easily for anyone with the link.
router.get("/:key", getMasterFile);

// Admin Upload
router.post("/", auth, authorizeRole(['Superadmin', 'Manager']), upload.single("file"), uploadMasterFile);

export default router;
