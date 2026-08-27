import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from 'url';

import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import brandingRoutes from "./routes/branding.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import companiesRoutes from "./routes/companies.routes.js";
import publicRoutes from "./routes/public.routes.js";
import officialEmailsRoutes from "./routes/official_emails.routes.js";
import masterFilesRoutes from "./routes/master_files.routes.js";
import suratKuasaRoutes from "./routes/suratkuasa.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";
import aiRoutes from "./routes/aiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Go up one level from src

const app = express();

const allowedOrigins = [
    /\.workers\.dev$/,
    /\.pages\.dev$/,
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.PUBLIC_APP_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some(o =>
            o instanceof RegExp ? o.test(origin) : o === origin
        );
        callback(null, allowed ? origin : false);
    },
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow image loading from other origins/same origin
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import errorHandler from "./middleware/error.middleware.js";

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'OCC API is running' });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/branding", brandingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/official-emails", officialEmailsRoutes);
app.use("/api/master-files", masterFilesRoutes);
app.use("/api/surat-kuasa", suratKuasaRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/ai", aiRoutes);

// Error Handler (must be last)
app.use(errorHandler);

export default app;
