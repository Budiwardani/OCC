import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/api";

// ─── Status helpers ────────────────────────────────────────────
const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const CATEGORY_OPTIONS = ["ALL", "PROD", "SERV", "BILL", "DELV", "OTHER"];
const CATEGORY_LABELS = {
    ALL: "Semua Kategori",
    PROD: "Kualitas Produk",
    SERV: "Layanan Pelanggan",
    BILL: "Tagihan",
    DELV: "Pengiriman",
    OTHER: "Lainnya",
};
const STATUS_LABELS = {
    OPEN: "Menunggu",
    IN_PROGRESS: "Diproses",
    RESOLVED: "Selesai",
    CLOSED: "Ditutup",
};
const STATUS_COLORS = {
    OPEN: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
};

// ─── Tabs ──────────────────────────────────────────────────────
const TAB_SEARCH = "search";
const TAB_CHAT = "chat";

const ChatWidget = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(TAB_SEARCH);

    // --- Search state ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    // --- Chat state ---
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Cek autentikasi
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

    // Auto-scroll chat
    useEffect(() => {
        if (isOpen && activeTab === TAB_CHAT) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, chatLoading, isOpen, activeTab]);

    // ─── Search handler ────────────────────────────────────────
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) {
            setSearchError("Masukkan nomor HP, nomor tiket, token, atau nama.");
            return;
        }
        setSearchError("");
        setSearching(true);
        setSearchResults(null);
        try {
            const params = {
                query: trimmedQuery,
                phone: trimmedQuery,
                search: trimmedQuery
            };
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (categoryFilter !== "ALL") params.category = categoryFilter;

            let resultData;
            try {
                const res = await api.get("/ai/search", { params });
                resultData = res.data;
            } catch (aiErr) {
                console.warn("AI search fallback to complaints search:", aiErr);
                // Fallback to dashboard complaints API
                const compRes = await api.get(`/dashboard/complaints?page=1&limit=50&status=${statusFilter}&search=${encodeURIComponent(trimmedQuery)}`);
                let list = compRes.data.complaints || [];
                if (categoryFilter !== "ALL") {
                    list = list.filter(c => c.category === categoryFilter);
                }
                resultData = { results: list, total: list.length };
            }
            setSearchResults(resultData);
        } catch (err) {
            console.error("Search error:", err);
            setSearchError(err.response?.data?.error || "Gagal mencari data. Pastikan Anda sudah login.");
        } finally {
            setSearching(false);
        }
    };

    // ─── Chat handler ──────────────────────────────────────────
    const sendMessage = async () => {
        const message = input.trim();
        if (!message || chatLoading) return;
        setMessages((c) => [...c, { role: "user", content: message }]);
        setInput("");
        setChatLoading(true);
        try {
            const { data } = await api.post("/ai/chat", { message });
            setMessages((c) => [...c, { role: "bot", content: data.reply }]);
        } catch {
            setMessages((c) => [...c, { role: "bot", content: "Virtual Assistant tidak merespons." }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    // ─── Minimized FAB ────────────────────────────────────────
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 px-4 py-3 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5"
                title="Buka Virtual Assistant"
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
                <span className="text-sm font-semibold">Virtual Assistant</span>
            </button>
        );
    }

    // ─── Expanded widget ──────────────────────────────────────
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col w-[360px] sm:w-[420px] max-h-[600px] rounded-2xl border border-secondary-200 bg-white shadow-2xl overflow-hidden animate-fadeIn">

            {/* Header */}
            <div className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700">
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
                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-primary-100 hover:bg-primary-700 transition-colors"
                    title="Minimize"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-secondary-200 bg-white flex-shrink-0">
                <button
                    onClick={() => setActiveTab(TAB_SEARCH)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === TAB_SEARCH
                        ? "border-b-2 border-primary-600 text-primary-600"
                        : "text-secondary-500 hover:text-secondary-700"}`}
                >
                    🔍 Cari Tiket & Status
                </button>
                <button
                    onClick={() => setActiveTab(TAB_CHAT)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === TAB_CHAT
                        ? "border-b-2 border-primary-600 text-primary-600"
                        : "text-secondary-500 hover:text-secondary-700"}`}
                >
                    💬 Tanya VA
                </button>
            </div>

            {/* ─── TAB: SEARCH ─────────────────────────────────── */}
            {activeTab === TAB_SEARCH && (
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Search form */}
                    <div className="p-3 bg-secondary-50 border-b border-secondary-200 flex-shrink-0">
                        <form onSubmit={handleSearch} className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Masukkan No HP, No Tiket, atau Nama..."
                                    className="flex-1 rounded-xl border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-3.5 py-2 text-white text-sm transition-colors flex items-center justify-center shadow-sm"
                                    title="Cari"
                                >
                                    {searching ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {/* Filter Row */}
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 rounded-xl border border-secondary-300 px-2 py-1.5 text-xs focus:border-primary-500 focus:outline-none bg-white text-secondary-700"
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s === "ALL" ? "Semua Status" : STATUS_LABELS[s] || s}</option>
                                    ))}
                                </select>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="flex-1 rounded-xl border border-secondary-300 px-2 py-1.5 text-xs focus:border-primary-500 focus:outline-none bg-white text-secondary-700"
                                >
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                        {searchError && (
                            <p className="mt-1.5 text-xs text-red-600 font-medium">{searchError}</p>
                        )}
                    </div>

                    {/* Results */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-secondary-50">
                        {searchResults === null && !searching && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-secondary-400 py-8">
                                <svg className="w-10 h-10 mb-2 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                </svg>
                                <p className="text-sm font-semibold text-secondary-600">Cari Tiket & Token Keluhan</p>
                                <p className="text-xs text-secondary-400 mt-1 max-w-[260px]">Masukkan nomor HP, kode tiket, atau nama pelanggan untuk melihat detail laporan</p>
                            </div>
                        )}

                        {searchResults !== null && searchResults.total === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <svg className="w-10 h-10 mb-2 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-semibold text-secondary-700">Tidak ada keluhan ditemukan</p>
                                <p className="text-xs text-secondary-400 mt-1">Pastikan nomor atau kata kunci sudah benar, atau ubah filter</p>
                            </div>
                        )}

                        {searchResults !== null && searchResults.results && searchResults.results.map((c) => (
                            <div key={c.ticket_code || c.id} className="rounded-xl border border-secondary-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-all">
                                {/* Header row */}
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div>
                                        <p className="text-xs font-bold text-primary-700 font-mono select-all">{c.ticket_code}</p>
                                        <p className="text-xs font-semibold text-secondary-800">{c.customer_name}</p>
                                    </div>
                                    <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-800"}`}>
                                        {STATUS_LABELS[c.status] || c.status}
                                    </span>
                                </div>

                                {/* Subject */}
                                <p className="text-xs text-secondary-700 font-medium mb-2 line-clamp-2">{c.subject}</p>

                                {/* Meta */}
                                <div className="flex flex-wrap gap-1.5 items-center mb-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700 text-[10px]">
                                        🏷️ {CATEGORY_LABELS[c.category] || c.category}
                                    </span>
                                    {c.phone && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-mono">
                                            📱 {c.phone}
                                        </span>
                                    )}
                                    {c.city && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-600 text-[10px]">
                                            📍 {c.city}
                                        </span>
                                    )}
                                </div>

                                {/* Token info & action link */}
                                <div className="pt-2 border-t border-secondary-100 flex items-center justify-between gap-2">
                                    <div className="text-[10px] text-secondary-500">
                                        Token: <span className="font-mono font-bold text-secondary-800 select-all">{c.public_token || "-"}</span>
                                    </div>
                                    {c.id && (
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate(`/dashboard/complaints/${c.id}`);
                                            }}
                                            className="text-[11px] font-semibold text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-0.5"
                                        >
                                            Buka Detail →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {searchResults !== null && searchResults.total > 0 && (
                            <p className="text-center text-[10px] text-secondary-400 pt-1">
                                Menampilkan {searchResults.total} laporan
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ─── TAB: CHAT ───────────────────────────────────── */}
            {activeTab === TAB_CHAT && (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary-50 text-sm">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6 px-3">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-secondary-800 text-sm">Halo! Saya Virtual Assistant OCC.</p>
                                <p className="text-xs text-secondary-500 mt-1">Ada yang bisa saya bantu terkait sistem atau keluhan?</p>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                                        m.role === "user"
                                            ? "bg-primary-600 text-white rounded-br-none"
                                            : "bg-white border border-secondary-200 text-secondary-800 rounded-bl-none shadow-sm"
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {chatLoading && (
                            <div className="flex items-center gap-2 text-xs text-secondary-500 bg-white border border-secondary-200 rounded-2xl rounded-bl-none px-3.5 py-2.5 w-fit">
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                <span>mengetik...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-secondary-200 p-3 bg-white flex-shrink-0">
                        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tanya Virtual Assistant..."
                                className="flex-1 rounded-xl border border-secondary-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                            <button
                                type="submit"
                                disabled={chatLoading || !input.trim()}
                                className="rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-3.5 py-2 text-white transition-colors flex items-center justify-center shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
