import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
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

app.set("trust proxy", true);

const allowedOrigins = [
    /\.workers\.dev$/,
    /\.pages\.dev$/,
    /\.vercel\.app$/,
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

// Health checks
app.get(['/', '/api', '/api/health'], (req, res) => {
    res.json({ status: 'ok', message: 'OCC API is running' });
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/dashboard", "/dashboard"], dashboardRoutes);
app.use(["/api/branding", "/branding"], brandingRoutes);
app.use(["/api/upload", "/upload"], uploadRoutes);
app.use(["/api/categories", "/categories"], categoryRoutes);
app.use(["/api/companies", "/companies"], companiesRoutes);
app.use(["/api/public", "/public"], publicRoutes);
app.use(["/api/official-emails", "/official-emails"], officialEmailsRoutes);
app.use(["/api/master-files", "/master-files"], masterFilesRoutes);
app.use(["/api/surat-kuasa", "/surat-kuasa"], suratKuasaRoutes);
app.use(["/api/invoices", "/invoices"], invoicesRoutes);
app.use(["/api/ai", "/ai"], aiRoutes);

// Frontend static serving and SPA catch-all
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    next();
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
