const corsHeaders = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
});

const normalizePhone = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.startsWith("0")) return `62${digits.slice(1)}`;
    if (digits.startsWith("8")) return `62${digits}`;
    return digits;
};

export default {
    async fetch(request, env) {
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        if (request.method === "GET" && url.pathname === "/") {
            return json({ status: "OCC Cloudflare Worker is running" });
        }

        if (request.method !== "POST" || url.pathname !== "/api/send") {
            return json({ message: "Not found" }, 404);
        }

        if (!env.WA_GATEWAY_URL || !env.WA_API_KEY) {
            return json({ message: "WhatsApp gateway is not configured" }, 503);
        }

        const authorization = request.headers.get("Authorization") || "";
        if (authorization !== `Bearer ${env.WA_API_KEY}`) {
            return json({ message: "Unauthorized" }, 401);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ message: "Invalid JSON body" }, 400);
        }

        const phone = normalizePhone(body.to);
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!/^62[0-9]{9,13}$/.test(phone) || !text || text.length > 4096) {
            return json({ message: "Invalid phone number or message" }, 400);
        }

        const sessionId = env.WA_SESSION_ID || "default";
        const sendUrl = env.WA_SEND_URL || `${env.WA_GATEWAY_URL.replace(/\/$/, "")}/api/sessions/${sessionId}/messages/send-text`;

        try {
            const gatewayResponse = await fetch(sendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": env.WA_API_KEY,
                },
                body: JSON.stringify({ to: phone, text }),
            });

            const responseText = await gatewayResponse.text();
            if (!gatewayResponse.ok) {
                return json({ message: "WhatsApp gateway rejected the request" }, 502);
            }

            return json({ status: "sent", gateway: responseText ? JSON.parse(responseText) : null });
        } catch {
            return json({ message: "WhatsApp gateway is unavailable" }, 502);
        }
    },
};
