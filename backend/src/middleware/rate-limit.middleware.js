const buckets = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 60 } = {}) => (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || now - current.startedAt >= windowMs) {
        buckets.set(key, { startedAt: now, count: 1 });
        return next();
    }

    current.count += 1;
    if (current.count > max) {
        return res.status(429).json({ message: "Terlalu banyak permintaan. Silakan coba lagi nanti." });
    }

    return next();
};
