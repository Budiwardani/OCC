import { Router } from "express";
import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany
} from "../controllers/companies.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

// All routes are protected and restricted to Superadmin
router.use(auth, authorizeRole(['Superadmin']));

router.get("/", getCompanies);
router.post("/", createCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
