import axios from "axios";

export const normalizePhone = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return `62${digits.slice(1)}`;
    if (digits.startsWith("8")) return `62${digits}`;
    return digits;
};

export const sendWhatsAppMessage = async ({ phone, text }) => {
    const baseUrl = process.env.WA_GATEWAY_URL || process.env.OPENWA_URL;
    const apiKey = process.env.WA_API_KEY || process.env.OPENWA_API_KEY;
    const sessionId = process.env.WA_SESSION_ID || "default";
    const sendUrl = process.env.WA_SEND_URL || process.env.OPENWA_SEND_URL || (
        baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/sessions/${sessionId}/messages/send-text` : ""
    );

    if (!sendUrl || !apiKey) {
        return { success: false, reason: "Gateway WhatsApp belum dikonfigurasi pada server (WA_GATEWAY_URL / WA_API_KEY)." };
    }

    const recipient = normalizePhone(phone);
    if (!recipient) return { success: false, reason: "Nomor telepon kosong atau tidak valid." };

    try {
        const response = await axios.post(sendUrl, {
            to: recipient,
            text,
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "X-API-Key": apiKey,
            },
            timeout: 10_000,
        });
        return { success: true, recipient, response: response.data };
    } catch (error) {
        console.error("WhatsApp gateway direct send failed:", error.response?.data || error.message);
        return { success: false, recipient, reason: error.response?.data?.message || error.message };
    }
};

export const sendWhatsAppTicket = async ({ phone, customerName, ticketCode, trackingUrl }) => {
    const message = [
        `Halo ${customerName || "Pelapor"}, laporan Anda sudah diterima.`,
        `Nomor tiket: ${ticketCode}`,
        `Lacak laporan: ${trackingUrl}`,
    ].join("\n");

    const result = await sendWhatsAppMessage({ phone, text: message });
    return {
        status: result.success ? "sent" : "skipped",
        recipient: result.recipient,
        reason: result.reason,
        response: result.response
    };
};
