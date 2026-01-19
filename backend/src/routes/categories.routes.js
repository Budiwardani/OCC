import express from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/categories.controller.js";
import { auth, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route to fetch categories for the dropdown
router.get("/", getCategories);

// Admin routes (Protected)
router.post("/", auth, authorizeRole(['Superadmin']), createCategory);
router.delete("/:id", auth, authorizeRole(['Superadmin']), deleteCategory);

export default router;
