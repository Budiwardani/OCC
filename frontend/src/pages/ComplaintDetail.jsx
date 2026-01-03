import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
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
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const [complaintRes, agentsRes] = await Promise.all([
                api.get(`/dashboard/complaints/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                api.get("/dashboard/agents", { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setComplaint(complaintRes.data);
            setAgents(agentsRes.data);

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
                                </div>

                                {/* Right Column: Actions */}
                                <div className="space-y-6">
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
                                                    <option value="CLOSED">Closed</option>
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
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
