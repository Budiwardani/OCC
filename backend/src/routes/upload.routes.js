import { Router } from "express";
import { uploadImage, handleUpload } from "../controllers/upload.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", auth, uploadImage, handleUpload);

export default router;
