import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    try {
        req.user = jwt.verify(token, env.jwtSecret);
        next();
    } catch {
        res.sendStatus(403);
    }
};

export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: You don't have access to this resource" });
        }
        next();
    };
};
