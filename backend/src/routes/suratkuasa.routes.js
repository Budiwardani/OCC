import { Router } from "express";
import { uploadDraft, getFiles, uploadCustomerFile, getSignedFiles, lookupTicket } from "../controllers/suratkuasa.controller.js";
import upload from "../middleware/upload.middleware.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

// Admin Routes (Protected)
router.post("/draft", auth, authorizeRole(['Superadmin', 'Manager', 'Agent']), upload.single("file"), uploadDraft);
router.get("/signed", auth, authorizeRole(['Superadmin', 'Manager', 'Agent']), getSignedFiles);
router.get("/lookup", auth, lookupTicket);

// Public Routes (Protected by Ticket Code logic implicity? Or Public?)
// Since it requires a valid Ticket Code, it's semi-public.
router.get("/:ticket", getFiles);
router.post("/upload", upload.single("file"), uploadCustomerFile);

export default router;
