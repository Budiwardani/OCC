import crypto from "crypto";

export const generateTicket = () =>
    `OCC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const generatePublicToken = () =>
    crypto.randomBytes(32).toString("hex");
