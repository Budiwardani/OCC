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
    const navigate = useNavigate();

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
                                    {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((s) => (
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
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <Link to={`/dashboard/complaints/${complaint.id}`} className="text-primary-600 hover:text-primary-900">View</Link>
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
        </div>
    );
}
