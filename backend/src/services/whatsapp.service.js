import axios from "axios";

const normalizePhone = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return `62${digits.slice(1)}`;
    if (digits.startsWith("8")) return `62${digits}`;
    return digits;
};

export const sendWhatsAppTicket = async ({ phone, customerName, ticketCode, trackingUrl }) => {
    const baseUrl = process.env.WA_GATEWAY_URL || process.env.OPENWA_URL;
    const apiKey = process.env.WA_API_KEY || process.env.OPENWA_API_KEY;
    const sessionId = process.env.WA_SESSION_ID || "default";
    const sendUrl = process.env.WA_SEND_URL || process.env.OPENWA_SEND_URL || (
        baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/sessions/${sessionId}/messages/send-text` : ""
    );

    if (!sendUrl || !apiKey) {
        return { status: "skipped", reason: "OpenWA is not configured" };
    }

    const recipient = normalizePhone(phone);
    if (!recipient) return { status: "skipped", reason: "Phone number is empty" };

    const message = [
        `Halo ${customerName || "Pelapor"}, laporan Anda sudah diterima.`,
        `Nomor tiket: ${ticketCode}`,
        `Lacak laporan: ${trackingUrl}`,
    ].join("\n");

    try {
        const response = await axios.post(sendUrl, {
            to: recipient,
            text: message,
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "X-API-Key": apiKey,
            },
            timeout: 10_000,
        });
        return { status: "sent", recipient, response: response.data };
    } catch (error) {
        console.error("OpenWA notification failed:", error.response?.data || error.message);
        return { status: "failed", recipient, reason: "Gateway request failed" };
    }
};
