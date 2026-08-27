import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [officialEmails, setOfficialEmails] = useState([]);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [selectedEmailId, setSelectedEmailId] = useState("");
    const [forwarding, setForwarding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOfficialEmails();
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [page, statusFilter]);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const res = await api.get(`/dashboard/complaints?page=${page}&limit=10&status=${statusFilter}&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComplaints(res.data.complaints);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchComplaints();
    };

    const fetchOfficialEmails = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/official-emails", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOfficialEmails(res.data);
        } catch (error) {
            console.error("Failed to fetch official emails", error);
        }
    };

    const handleForward = async () => {
        if (!selectedEmailId) return alert("Please select an email");
        setForwarding(true);
        try {
            const token = localStorage.getItem("token");
            await api.post(`/dashboard/complaints/${selectedComplaint.id}/forward`, {
                target_email_id: selectedEmailId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Ticket forwarded successfully!");
            setShowForwardModal(false);
            setSelectedComplaint(null);
            setSelectedEmailId("");
        } catch (error) {
            console.error(error);
            alert("Failed to forward ticket");
        } finally {
            setForwarding(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "bg-yellow-100 text-yellow-800";
            case "IN_PROGRESS": return "bg-purple-100 text-purple-800";
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "CLOSED": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-bold text-secondary-900">Complaints</h1>

                            {/* Toolbar */}
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <div className="flex space-x-2">
                                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setStatusFilter(s); setPage(1); }}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === s
                                                ? "bg-primary-100 text-primary-700"
                                                : "bg-white text-secondary-500 hover:bg-secondary-50 border border-secondary-300"
                                                }`}
                                        >
                                            {s.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                                <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-secondary-300 px-4 py-2"
                                        placeholder="Search tickets..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-secondary-300 text-sm font-medium rounded-r-md text-secondary-700 bg-secondary-50 hover:bg-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </form>
                            </div>

                            {/* Table */}
                            <div className="mt-8 flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-secondary-200 sm:rounded-lg">
                                            {loading ? (
                                                <div className="text-center py-10">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                                                </div>
                                            ) : (
                                                <table className="min-w-full divide-y divide-secondary-200">
                                                    <thead className="bg-secondary-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Ticket Code</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Subject</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Customer</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Priority</th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Assignee</th>
                                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-secondary-200">
                                                        {complaints.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-secondary-500">No complaints found.</td>
                                                            </tr>
                                                        ) : (
                                                            complaints.map((complaint) => (
                                                                <tr key={complaint.id} className="hover:bg-secondary-50 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                                                        #{complaint.ticket_code}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                                                        {complaint.subject}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                                                                            {complaint.status.replace("_", " ")}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                                                        {complaint.customer_email}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                                                        {complaint.priority}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                                                        {complaint.assignee_name || <span className="text-secondary-400 italic">Unassigned</span>}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                                        <Link to={`/dashboard/complaints/${complaint.id}`} className="text-primary-600 hover:text-primary-900">View</Link>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedComplaint(complaint);
                                                                                setShowForwardModal(true);
                                                                            }}
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            Forward
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50">
                                        Previous
                                    </button>
                                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50">
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-secondary-700">
                                            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50">
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50">
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            {/* Forward Modal */}
            {showForwardModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowForwardModal(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Forward Ticket to Official Email</h3>
                                <p className="text-sm text-gray-500 mb-4">Ticket: <strong>#{selectedComplaint?.ticket_code}</strong></p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Department/Email</label>
                                <select
                                    value={selectedEmailId}
                                    onChange={(e) => setSelectedEmailId(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">-- Select Email --</option>
                                    {officialEmails.map(email => (
                                        <option key={email.id} value={email.id}>{email.name} ({email.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleForward}
                                    disabled={forwarding || !selectedEmailId}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {forwarding ? "Forwarding..." : "Forward"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowForwardModal(false);
                                        setSelectedComplaint(null);
                                        setSelectedEmailId("");
                                    }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
