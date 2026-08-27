
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function Portal() {
    const [activeTab, setActiveTab] = useState('home');
    const [stats, setStats] = useState({ total: 0, waiting: 0, process: 0, done: 0 });
    const [latest, setLatest] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);

    // Form Hooks
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);

    // Tracking State
    const [trackTicket, setTrackTicket] = useState("");
    const [trackEmail, setTrackEmail] = useState("");
    const [trackToken, setTrackToken] = useState("");
    const [trackResult, setTrackResult] = useState(null);
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState(null);

    useEffect(() => {
        loadStats();
        loadLatest();
        loadCategories();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get('/public/stats');
            setStats(res.data);
        } catch (err) { console.error("Stats error", err); }
    };

    const loadLatest = async () => {
        try {
            const res = await api.get('/public/latest');
            setLatest(res.data);
        } catch (err) { console.error("Latest list error", err); }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) { console.error("Categories error", err); }
    };

    // Complaint Submission
    const onSubmitComplaint = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("customer_name", data.customer_name);
            formData.append("customer_email", data.customer_email);
            formData.append("phone", data.phone);
            formData.append("location", data.location);
            formData.append("city", data.city);
            formData.append("subject", data.subject);
            formData.append("description", data.description);
            formData.append("category", data.category);

            if (data.media && data.media.length > 0) {
                for (let i = 0; i < data.media.length; i++) {
                    formData.append("media", data.media[i]);
                }
            }

            const res = await api.post("/public/complaints", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setSubmitResult(res.data);
            reset();
            loadStats(); // Refresh stats
        } catch (err) {
            alert("Error submitting complaint");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tracking
    const onTrack = async (e) => {
        e.preventDefault();
        setTrackLoading(true);
        setTrackResult(null);
        setTrackError(null);
        try {
            const res = await api.get("/public/tracking", {
                params: { ticket: trackTicket, email: trackEmail, token: trackToken }
            });
            setTrackResult(res.data);
        } catch (err) {
            setTrackError("Laporan tidak ditemukan atau email tidak sesuai.");
        } finally {
            setTrackLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'OPEN': 'bg-yellow-100 text-yellow-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'RESOLVED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles['OPEN']}`}>{status}</span>;
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
                    <div className="bg-white rounded-lg p-3 w-16 h-16 flex items-center justify-center font-bold text-blue-900 text-2xl shadow-sm">
                        OCC
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Online Complaint Center</h1>
                        <p className="opacity-90 mt-1">Pusat Pengaduan Masyarakat</p>
                    </div>
                </div>
            </div>

            {/* Nav Tabs */}
            <div className="bg-white border-b border-blue-900 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {['home', 'form', 'list', 'tracking'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${activeTab === tab
                                        ? 'border-orange-500 text-blue-900 font-bold'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-4 font-medium capitalize transition-colors duration-200`}
                            >
                                {tab === 'home' ? 'Beranda' : tab === 'form' ? 'Buat Laporan' : tab === 'list' ? 'Daftar Laporan' : 'Lacak Laporan'}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

                {/* Home Tab */}
                {activeTab === 'home' && (
                    <div className="animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[
                                { label: 'Total Laporan', val: stats.total, color: 'text-blue-900' },
                                { label: 'Sedang Diproses', val: stats.process, color: 'text-blue-600' },
                                { label: 'Selesai', val: stats.done, color: 'text-green-600' },
                                { label: 'Menunggu', val: stats.waiting, color: 'text-yellow-600' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border border-gray-100">
                                    <div className={`text-4xl font-bold ${item.color} mb-2`}>{item.val}</div>
                                    <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">{item.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-4 border-b">Tentang Layanan OCC</h2>
                            <div className="prose text-gray-600 space-y-4">
                                <p><strong>Online Complaint Center (OCC)</strong> adalah platform pengaduan masyarakat yang memudahkan Anda untuk menyampaikan keluhan atau permasalahan yang terjadi di lingkungan sekitar.</p>
                                <p><strong>Apa yang bisa dilaporkan?</strong><br />
                                    Jalan rusak, lampu jalan mati, sampah menumpuk, saluran air tersumbat, fasilitas rusak, pelayanan publik yang kurang memuaskan, dll.</p>
                                <div className="bg-blue-50 p-6 rounded-lg mt-6">
                                    <h4 className="font-bold text-blue-900 mb-3">Cara Kerja:</h4>
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Isi formulir pengaduan dengan lengkap</li>
                                        <li>Sertakan foto/dokumen pendukung</li>
                                        <li>Kirim laporan dan dapatkan nomor tracking</li>
                                        <li>Pantau status penanganan laporan Anda</li>
                                    </ol>
                                </div>
                                <div className="mt-8">
                                    <button onClick={() => setActiveTab('form')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                        Buat Laporan Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Tab */}
                {activeTab === 'form' && (
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 animate-fade-in-up">
                        {submitResult ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Laporan Berhasil Dikirim!</h2>
                                <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                                    <p className="text-sm text-gray-500 uppercase font-bold mb-1">Nomor Laporan Anda</p>
                                    <p className="text-3xl font-mono font-bold text-blue-700 tracking-wider">{submitResult.ticket_code}</p>
                                    <p className="text-xs text-blue-600 mt-2">Harap simpan nomor ini untuk melacak status laporan Anda.</p>
                                    <p className="text-sm font-mono text-blue-700 mt-3 break-all">Token: {submitResult.public_token}</p>
                                </div>
                                <button
                                    onClick={() => { setSubmitResult(null); setActiveTab('home'); }}
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                                >
                                    Kembali ke Beranda
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-4 border-b">Formulir Pengaduan Baru</h2>
                                <form onSubmit={handleSubmit(onSubmitComplaint)} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap *</label>
                                        <input {...register("customer_name", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Nama Anda" />
                                        {errors.customer_name && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                        <input type="email" {...register("customer_email", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="email@contoh.com" />
                                        {errors.customer_email && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon / WA *</label>
                                        <input type="tel" {...register("phone", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="08xxxxxxxx" />
                                        {errors.phone && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori *</label>
                                        <select {...register("category", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                            <option value="">Pilih Kategori</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                        {errors.category && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lokasi *</label>
                                        <input {...register("location", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Jl. Mawar No. 12" />
                                        {errors.location && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kota / Kabupaten *</label>
                                        <input {...register("city", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Jakarta Selatan" />
                                        {errors.city && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Laporan *</label>
                                        <input {...register("subject", { required: true })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Singkat dan jelas" />
                                        {errors.subject && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Isi Laporan Detail *</label>
                                        <textarea {...register("description", { required: true })} rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Ceritakan kronologi, lokasi spesifik, dsb."></textarea>
                                        {errors.description && <span className="text-red-500 text-xs">Wajib diisi</span>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lampiran Foto/Dokumen</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                            <input type="file" multiple {...register("media")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <div className="text-gray-500">
                                                <p className="text-lg">Klik atau drag file ke sini</p>
                                                <p className="text-sm">JPG, PNG, PDF (Maks 5MB)</p>
                                            </div>
                                        </div>
                                        {watch("media") && watch("media").length > 0 && (
                                            <div className="mt-2 text-sm text-green-600 font-medium">{watch("media").length} file dipilih</div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 mt-4">
                                        <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-blue-700 transition disabled:opacity-70">
                                            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}

                {/* List Tab */}
                {activeTab === 'list' && (
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-4 border-b">Laporan Terbaru</h2>
                        {latest.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">Belum ada laporan publik.</p>
                        ) : (
                            <div className="space-y-4">
                                {latest.map((item, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-blue-900">{item.subject}</h3>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center text-xs text-gray-500 gap-4">
                                            <span>📍 {item.city || 'N/A'}</span>
                                            <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="font-mono">ID: #{item.ticket_code.substring(0, 10)}...</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tracking Tab */}
                {activeTab === 'tracking' && (
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-4 border-b">Lacak Status Laporan</h2>

                        <form onSubmit={onTrack} className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Laporan / ID</label>
                                <input
                                    value={trackTicket}
                                    onChange={e => setTrackTicket(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: 260118OCC..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Pelapor</label>
                                <input
                                    type="email"
                                    value={trackEmail}
                                    onChange={e => setTrackEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder="email@anda.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Token Pelacakan</label>
                                <input
                                    value={trackToken}
                                    onChange={e => setTrackToken(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Token yang diterima saat laporan dibuat"
                                />
                            </div>
                            <button disabled={trackLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                                {trackLoading ? 'Mencari...' : 'Lacak Laporan'}
                            </button>
                        </form>

                        {trackError && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6 border border-red-100">
                                {trackError}
                            </div>
                        )}

                        {trackResult && (
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-blue-900">{trackResult.subject}</h3>
                                    {getStatusBadge(trackResult.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                    <div>
                                        <span className="block text-gray-500">ID Laporan</span>
                                        <span className="font-mono font-medium">{trackResult.ticket_code}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500">Tanggal</span>
                                        <span className="font-medium">{new Date(trackResult.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500">Lokasi</span>
                                        <span className="font-medium">{trackResult.location}, {trackResult.city}</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-blue-100 mb-6">
                                    <h4 className="font-bold text-sm text-gray-700 mb-2">Isi Laporan:</h4>
                                    <p className="text-gray-600">{trackResult.description}</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-gray-700 mb-3 border-b pb-2">Riwayat Respon:</h4>
                                    {trackResult.responses && trackResult.responses.length > 0 ? (
                                        <div className="space-y-3">
                                            {trackResult.responses.map((r, i) => (
                                                <div key={i} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-bold text-blue-800 text-xs">{r.responder || 'Admin'}</span>
                                                        <span className="text-gray-400 text-xs">{new Date(r.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{r.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">Belum ada respon dari petugas.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
