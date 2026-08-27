import { Router } from "express";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/chat", rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
    const { message } = req.body;
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
    }

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen2.5-coder:3b",
                prompt: message,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama returned ${response.status}`);
        }

        const data = await response.json();
        res.json({ reply: data.response || "AI tidak memberikan jawaban." });
    } catch {
        res.status(500).json({ reply: "Maaf, AI sedang gangguan." });
    }
});

export default router;
