import { useState } from "react";
import api, { getFileUrl } from "../api/api";

export default function TrackComplaint() {
    const [ticket, setTicket] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suratKuasaFiles, setSuratKuasaFiles] = useState([]);
    const [uploadingSK, setUploadingSK] = useState(false);
    const [masterTemplate, setMasterTemplate] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await api.get("/public/tracking", {
                params: { ticket, token, email }
            });
            setData(res.data);

            // Fetch Surat Kuasa Files
            try {
                const skRes = await api.get(`/surat-kuasa/${ticket}`, { params: { email, token } });
                setSuratKuasaFiles(skRes.data);
            } catch (skErr) {
                console.warn("Failed to fetch Surat Kuasa files", skErr);
            }

            // Fetch Master Template
            try {
                const mtRes = await api.get("/master-files/SURAT_KUASA_TEMPLATE");
                setMasterTemplate(mtRes.data);
            } catch (err) {
                // Ignore if not present
            }
        } catch (err) {
            setError("Complaint not found. Please check your ticket code and token.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            OPEN: "bg-blue-100 text-blue-800",
            IN_PROGRESS: "bg-yellow-100 text-yellow-800",
            WAITING_CUSTOMER: "bg-purple-100 text-purple-800",
            RESOLVED: "bg-green-100 text-green-800",
            CLOSED: "bg-gray-100 text-gray-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
                <p className="text-gray-600 mb-8">Enter your ticket code and token to check the status of your complaint.</p>

                <form onSubmit={handleTrack} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reporter Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Code</label>
                        <input
                            value={ticket}
                            onChange={(e) => setTicket(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="OCC-1234567890-ABCD"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Token</label>
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            placeholder="Enter your tracking token"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Track Complaint"}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
            </div>

            {data && (
                <div className="bg-white rounded-2xl shadow-lg p-8 big-data-card">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{data.subject}</h2>
                            <p className="text-gray-600 mt-1">Ticket: {data.ticket_code}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                            {data.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
                        <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-medium text-gray-900">{data.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="font-medium text-gray-900">{data.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-medium text-gray-900">{new Date(data.created_at).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{data.description}</p>
                    </div>

                    {/* Surat Kuasa Section */}
                    <div className="mt-8 border-t pt-8">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Surat Kuasa (Power of Attorney)
                        </h3>

                        {/* Master Template Download */}
                        {masterTemplate && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-blue-900">Need a Template?</h4>
                                    <p className="text-sm text-blue-800">Download our standard Surat Kuasa form here.</p>
                                </div>
                                <a
                                    href={getFileUrl(masterTemplate.file_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    Download Template
                                </a>
                            </div>
                        )}

                        {suratKuasaFiles.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No uploaded documents yet.</p>
                        ) : (
                            <ul className="space-y-3 mb-6">
                                {suratKuasaFiles.map((file) => (
                                    <li key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full mr-3 ${file.uploaded_by === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {file.uploaded_by === 'ADMIN' ? 'Draft from Admin' : 'Uploaded by Customer'}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(file.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={getFileUrl(file.file_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium hover:underline"
                                        >
                                            Download
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Customer Upload */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Upload Signed Surat Kuasa (Bermaterai)</h4>
                            <p className="text-xs text-blue-700 mb-4">Please download the draft above, print it, sign it on top of a <strong>Materai 10.000</strong>, and upload the scanned copy here.</p>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fileInput = e.target.elements.skFile;
                                    if (!fileInput.files[0]) return;

                                    setUploadingSK(true);
                                    try {
                                        const formData = new FormData();
                                        formData.append("ticket_code", data.ticket_code);
                                        formData.append("email", email);
                                        formData.append("token", token);
                                        formData.append("file", fileInput.files[0]);

                                        await api.post("/surat-kuasa/upload", formData, {
                                            headers: { "Content-Type": "multipart/form-data" }
                                        });

                                        alert("File uploaded successfully!");
                                        fileInput.value = null; // Reset
                                        // Refresh list
                                        const skRes = await api.get(`/surat-kuasa/${data.ticket_code}`, { params: { email, token } });
                                        setSuratKuasaFiles(skRes.data);
                                    } catch (err) {
                                        alert("Failed to upload file.");
                                        console.error(err);
                                    } finally {
                                        setUploadingSK(false);
                                    }
                                }}
                                className="flex items-center gap-3"
                            >
                                <input
                                    name="skFile"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={uploadingSK}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {uploadingSK ? "..." : "Upload"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {data.responses && data.responses.length > 0 && (
                        <div className="mt-8 border-t pt-8">
                            <h3 className="font-semibold text-gray-900 mb-4">Responses</h3>
                            <div className="space-y-4">
                                {data.responses.map((response, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-medium text-gray-900">{response.responder || "Support Team"}</p>
                                            <p className="text-sm text-gray-600">{new Date(response.created_at).toLocaleString()}</p>
                                        </div>
                                        <p className="text-gray-700">{response.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
