import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getFileUrl } from "../api/api";
import Sidebar from "../components/Sidebar";

export default function ComplaintDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

    // Action States
    const [selectedAgent, setSelectedAgent] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedEmail, setSelectedEmail] = useState("");
    const [selectedForwardEmail, setSelectedForwardEmail] = useState("");
    const [officialEmails, setOfficialEmails] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [sending, setSending] = useState(false);
    const [forwarding, setForwarding] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responding, setResponding] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const [complaintRes, agentsRes, emailsRes] = await Promise.all([
                api.get(`/dashboard/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                api.get("/dashboard/agents", { headers: { Authorization: `Bearer ${token}` } }),
                api.get("/official-emails", { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setComplaint(complaintRes.data);
            setAgents(agentsRes.data);
            setOfficialEmails(emailsRes.data);

            // Initialize states
            setSelectedAgent(complaintRes.data.assigned_to || "");
            setSelectedStatus(complaintRes.data.status);

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                status: selectedStatus,
                assigned_to: selectedAgent || null,
                priority: complaint.priority // Keep existing
            };

            await api.put(`/dashboard/complaints/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Ticket updated successfully!");
            fetchData(); // Refresh
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update ticket.");
        } finally {
            setUpdating(false);
        }
    };

    const handleSendEmail = async () => {
        if (!selectedEmail) return alert("Please select a sender email");
        setSending(true);
        try {
            const token = localStorage.getItem("token");
            await api.post(`/dashboard/complaints/${id}/notify`, {
                method: 'email',
                from_email_id: selectedEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Email notification sent!");
        } catch (error) {
            console.error(error);
            alert("Failed to send email");
        } finally {
            setSending(false);
        }
    };

    const [sendingWa, setSendingWa] = useState(false);

    const handleSendWhatsApp = async () => {
        if (!complaint.phone) return alert("Customer tidak memiliki nomor WhatsApp / telepon.");

        setSendingWa(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.post(`/dashboard/complaints/${id}/notify`, {
                method: "whatsapp"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert(res.data.message || "Pesan WhatsApp berhasil dikirim langsung ke customer!");
            } else {
                if (res.data.fallbackUrl) {
                    window.open(res.data.fallbackUrl, '_blank');
                } else {
                    alert(res.data.message || res.data.reason || "Gagal mengirim WhatsApp.");
                }
            }
        } catch (error) {
            console.error("Direct WhatsApp error:", error);
            // Fallback manual
            let templateLink = "";
            try {
                const mtRes = await api.get("/master-files/SURAT_KUASA_TEMPLATE", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                if (mtRes.data) {
                    templateLink = `\n\nDownload Surat Kuasa Template: ${getFileUrl(mtRes.data.file_path)}`;
                }
            } catch (e) { }

            const uploadLink = `${window.location.origin}/upload-surat/${complaint.ticket_code}?token=${encodeURIComponent(complaint.public_token || '')}`;
            const msg = `Halo ${complaint.customer_name || ""}, update status tiket #${complaint.ticket_code}: ${complaint.status}.${templateLink}\n\nLacak & upload dokumen: ${uploadLink}`;
            const cleanPhone = complaint.phone.replace(/^0/, '62').replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        } finally {
            setSendingWa(false);
        }
    };

    const handleForwardTicket = async () => {
        if (!selectedForwardEmail) return alert("Please select a target email");
        setForwarding(true);
        try {
            const token = localStorage.getItem("token");
            await api.post(`/dashboard/complaints/${id}/forward`, {
                target_email_id: selectedForwardEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Ticket forwarded successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to forward ticket");
        } finally {
            setForwarding(false);
        }
    };

    const handleResponse = async () => {
        if (!responseMessage.trim()) return;
        setResponding(true);
        try {
            const token = localStorage.getItem("token");
            await api.post(`/dashboard/complaints/${id}/responses`, {
                message: responseMessage,
                is_internal: false,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setResponseMessage("");
            await fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to send response");
        } finally {
            setResponding(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10">Loading...</div>;
    if (!complaint) return <div className="flex justify-center p-10">Complaint not found</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Header */}
                            <div className="md:flex md:items-center md:justify-between mb-8">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
                                        Ticket #{complaint.ticket_code}
                                    </h2>
                                    <p className="mt-1 text-sm text-secondary-500">
                                        Submitted by {complaint.customer_email} on {new Date(complaint.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-4 flex md:mt-0 md:ml-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${complaint.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                                        complaint.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                            complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {complaint.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Left Column: Ticket Info */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-500">Subject</label>
                                                <p className="mt-1 text-secondary-900">{complaint.subject}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-500">Description</label>
                                                <div className="mt-1 text-secondary-900 whitespace-pre-wrap p-4 bg-secondary-50 rounded-md">
                                                    {complaint.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Responses</h3>
                                        <div className="space-y-3 mb-4">
                                            {(complaint.responses || []).map(response => (
                                                <div key={response.id} className="rounded-md bg-secondary-50 p-3">
                                                    <p className="text-sm text-secondary-900 whitespace-pre-wrap">{response.message}</p>
                                                    <p className="mt-1 text-xs text-secondary-500">{response.responder || "System"} - {new Date(response.created_at).toLocaleString()}</p>
                                                </div>
                                            ))}
                                            {(complaint.responses || []).length === 0 && <p className="text-sm text-secondary-500">No responses yet.</p>}
                                        </div>
                                        <textarea
                                            value={responseMessage}
                                            onChange={(e) => setResponseMessage(e.target.value)}
                                            rows="3"
                                            placeholder="Write a response to the customer..."
                                            className="w-full rounded-md border border-secondary-300 p-2 text-sm"
                                        />
                                        <button
                                            onClick={handleResponse}
                                            disabled={responding || !responseMessage.trim()}
                                            className="mt-3 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                        >
                                            {responding ? "Sending..." : "Send Response"}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Actions */}
                                <div className="space-y-6">
                                    {/* Surat Kuasa Link Card */}
                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Request Surat Kuasa</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700">Upload Link for Customer</label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={`${window.location.origin}/upload-surat/${complaint.ticket_code}?token=${encodeURIComponent(complaint.public_token)}`}
                                                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 p-2 text-gray-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/upload-surat/${complaint.ticket_code}?token=${encodeURIComponent(complaint.public_token)}`);
                                                        alert("Link copied!");
                                                    }}
                                                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="mt-2 text-xs text-secondary-500">Share this link with the customer to upload their signed Surat Kuasa.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Actions</h3>

                                        <div className="space-y-4">
                                            {/* Status Update (Visible to All Agents/Admins) */}
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700">Status</label>
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="OPEN">Open</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                    <option value="CLOSED">Closed/Selesai</option>
                                                </select>
                                            </div>

                                            {/* Assignment (Admin Only) */}
                                            {user.role === 'Superadmin' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700">Assignee</label>
                                                    <select
                                                        value={selectedAgent}
                                                        onChange={(e) => setSelectedAgent(e.target.value)}
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {agents.map(agent => (
                                                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Read-Only Assignee for Agents */}
                                            {user.role !== 'Superadmin' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-secondary-700">Assignee</label>
                                                    <div className="mt-1 text-sm text-secondary-900">
                                                        {agents.find(a => a.id === parseInt(selectedAgent))?.name || "Unassigned"}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={handleUpdate}
                                                disabled={updating}
                                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                            >
                                                {updating ? "Updating..." : "Update Ticket"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action: Forward to Official Email */}
                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Forward Ticket</h3>
                                        <p className="text-sm text-secondary-500 mb-4">Forward this ticket to another department/official email.</p>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700">Select Official Email</label>
                                                <div className="mt-1 flex gap-2">
                                                    <select
                                                        value={selectedForwardEmail}
                                                        onChange={(e) => setSelectedForwardEmail(e.target.value)}
                                                        className="block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                                    >
                                                        <option value="">Select Department/Email</option>
                                                        {officialEmails.map(email => (
                                                            <option key={email.id} value={email.id}>{email.name} ({email.email})</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={handleForwardTicket}
                                                        disabled={forwarding || !selectedForwardEmail}
                                                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                                                    >
                                                        {forwarding ? "..." : "Forward"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifications Card */}
                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Send Notification</h3>
                                        <div className="space-y-4">
                                            {/* WhatsApp */}
                                            <button
                                                onClick={handleSendWhatsApp}
                                                disabled={sendingWa}
                                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 focus:outline-none transition-colors"
                                            >
                                                {sendingWa ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending WhatsApp...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                                        Send to WhatsApp
                                                    </>
                                                )}
                                            </button>

                                            <div className="border-t border-gray-200 pt-4">
                                                <label className="block text-sm font-medium text-secondary-700">Send Email From</label>
                                                <div className="mt-1 flex gap-2">
                                                    <select
                                                        value={selectedEmail}
                                                        onChange={(e) => setSelectedEmail(e.target.value)}
                                                        className="block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                                    >
                                                        <option value="">Select Official Email</option>
                                                        {officialEmails.map(email => (
                                                            <option key={email.id} value={email.id}>{email.name} ({email.email})</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={handleSendEmail}
                                                        disabled={sending || !selectedEmail}
                                                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                                                    >
                                                        {sending ? "..." : "Send"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
