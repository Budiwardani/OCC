
import { Router } from "express";
import { getInvoices, createInvoice } from "../controllers/invoices.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", auth, getInvoices);
router.post("/", auth, createInvoice);

export default router;
