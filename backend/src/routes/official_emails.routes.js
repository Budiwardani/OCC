import { Router } from "express";
import { getAll, create, remove } from "../controllers/official_emails.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", auth, getAll); // Allow all auth users to see? Or strict? Assuming all internal users need to pick one.
router.post("/", auth, authorizeRole(['Superadmin', 'Manager']), create);
router.delete("/:id", auth, authorizeRole(['Superadmin', 'Manager']), remove);

export default router;
