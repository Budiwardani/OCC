import { useState } from "react";
import api from "../api/api";

export default function TrackComplaint() {
    const [ticket, setTicket] = useState("");
    const [token, setToken] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await api.get("/public/tracking", {
                params: { ticket, token }
            });
            setData(res.data);
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
                <div className="bg-white rounded-2xl shadow-lg p-8">
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

                    {data.responses && data.responses.length > 0 && (
                        <div>
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
