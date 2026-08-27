import { useState } from "react";

const ChatWidget = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        const message = input.trim();
        if (!message || loading) return;

        setMessages((current) => [...current, { role: "user", content: message }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            setMessages((current) => [...current, { role: "bot", content: data.reply }]);
        } catch {
            setMessages((current) => [...current, { role: "bot", content: "Error: AI tidak merespons." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex h-96 w-80 flex-col rounded-lg border border-gray-300 bg-white shadow-2xl">
            <div className="rounded-t-lg bg-blue-600 p-3 font-bold text-white">Asisten AI - OCC</div>
            <div className="flex-1 overflow-y-auto p-3">
                {messages.map((messageItem, index) => (
                    <div key={`${messageItem.role}-${index}`} className={`mb-2 ${messageItem.role === "user" ? "text-right" : "text-left"}`}>
                        <span className={`inline-block rounded-lg px-3 py-2 ${messageItem.role === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
                            {messageItem.content}
                        </span>
                    </div>
                ))}
                {loading && <div className="text-left text-gray-400">AI sedang mengetik...</div>}
            </div>
            <div className="border-t p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                        placeholder="Tanya apa saja..."
                        className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    />
                    <button onClick={sendMessage} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                        Kirim
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
