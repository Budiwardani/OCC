import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getBaseUrl } from "../api/api";

const ChatWidget = () => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Cek apakah user sedang login dan bukan di halaman login
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const isLoginPage = location.pathname === "/login";
            setIsAuthenticated(Boolean(token) && !isLoginPage);
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, [location.pathname]);

    // Auto-scroll ke pesan terbaru
    useEffect(() => {
        if (!isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading, isMinimized]);

    const sendMessage = async () => {
        const message = input.trim();
        if (!message || loading) return;

        setMessages((current) => [...current, { role: "user", content: message }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${getBaseUrl()}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            setMessages((current) => [...current, { role: "bot", content: data.reply }]);
        } catch {
            setMessages((current) => [...current, { role: "bot", content: "Error: Virtual Assistant tidak merespons." }]);
        } finally {
            setLoading(false);
        }
    };

    // Jangan tampilkan jika belum login
    if (!isAuthenticated) {
        return null;
    }

    // Tampilan ketika di-minimize (tombol mengambang)
    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 px-4 py-3 text-white shadow-xl hover:shadow-2xl transition-all duration-200 group transform hover:-translate-y-0.5"
                title="Buka Virtual Assistant"
                aria-label="Buka Virtual Assistant"
            >
                <div className="relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>
                <span className="text-sm font-semibold tracking-wide">Virtual Assistant</span>
            </button>
        );
    }

    // Tampilan ketika chat window terbuka
    return (
        <div className="fixed bottom-5 right-5 z-50 flex h-[460px] w-84 sm:w-96 flex-col rounded-2xl border border-secondary-200 bg-white shadow-2xl overflow-hidden transition-all duration-200 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 shadow-inner">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-tight">Virtual Assistant</h3>
                        <span className="flex items-center gap-1 text-[11px] text-primary-100">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                            Online
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="rounded-lg p-1.5 text-primary-100 hover:bg-primary-700 hover:text-white transition-colors"
                        title="Minimize"
                        aria-label="Minimize"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary-50 text-sm">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-secondary-500 py-6 px-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="font-semibold text-secondary-800 text-sm">Halo! Saya Virtual Assistant OCC.</p>
                        <p className="text-xs text-secondary-500 mt-1">Ada yang bisa saya bantu terkait tiket, keluhan pelanggan, atau penggunaan sistem?</p>
                    </div>
                ) : (
                    messages.map((messageItem, index) => (
                        <div
                            key={`${messageItem.role}-${index}`}
                            className={`flex ${messageItem.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                                    messageItem.role === "user"
                                        ? "bg-primary-600 text-white rounded-br-none shadow-sm"
                                        : "bg-white border border-secondary-200 text-secondary-800 rounded-bl-none shadow-sm"
                                }`}
                            >
                                {messageItem.content}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex items-center gap-2 text-xs text-secondary-500 bg-white border border-secondary-200 rounded-2xl rounded-bl-none px-3.5 py-2.5 w-fit shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        <span>Virtual Assistant sedang mengetik...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-secondary-200 p-3 bg-white">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Tanya Virtual Assistant..."
                        className="flex-1 rounded-xl border border-secondary-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-secondary-400"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed px-3.5 py-2 text-sm font-medium text-white transition-colors flex items-center justify-center shadow-sm"
                        title="Kirim Pesan"
                        aria-label="Kirim Pesan"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;
