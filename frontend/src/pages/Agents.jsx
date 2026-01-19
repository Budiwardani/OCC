import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Agents() {
    const [agents, setAgents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Agent', company_id: '' });
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isSuperadmin = (user.role || "").toLowerCase() === 'superadmin';

    useEffect(() => {
        fetchAgents();
        if (isSuperadmin) {
            fetchCompanies();
        }
    }, []);

    const fetchAgents = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const res = await api.get("/dashboard/agents", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAgents(res.data);
        } catch (error) {
            console.error("Failed to fetch agents", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/companies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(res.data);
            // Set default company if none selected and companies available
            if (res.data.length > 0 && !formData.company_id) {
                setFormData(prev => ({ ...prev, company_id: res.data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch companies", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            // Prepare payload
            const payload = { ...formData };
            // If not superadmin, remove role and company checks to let backend handle defaults
            if (!isSuperadmin) {
                delete payload.role;
                delete payload.company_id;
            }

            await api.post("/dashboard/agents", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'Agent', company_id: companies.length > 0 ? companies[0].id : '' });
            fetchAgents(); // Refresh list
        } catch (error) {
            alert("Failed to create user: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-secondary-900">User Management</h1>
                                <p className="mt-1 text-sm text-secondary-500">Manage agents, managers, and admins</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Add New User
                            </button>
                        </div>

                        <div className="mt-8 flex flex-col px-4 sm:px-6 lg:px-8">
                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                    <div className="shadow overflow-hidden border-b border-secondary-200 sm:rounded-lg">
                                        {loading ? (
                                            <div className="text-center py-10">Loading...</div>
                                        ) : (
                                            <table className="min-w-full divide-y divide-secondary-200">
                                                <thead className="bg-secondary-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Role</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Company</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-secondary-200">
                                                    {agents.map((agent) => (
                                                        <tr key={agent.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{agent.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{agent.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${agent.role === 'Superadmin' ? 'bg-purple-100 text-purple-800' :
                                                                        agent.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                                                                            'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    {agent.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{agent.company_name || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New User</h3>
                                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    {isSuperadmin && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                                <select
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    value={formData.role}
                                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                >
                                                    <option value="Agent">Agent</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Superadmin">Superadmin</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Company</label>
                                                <select
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    value={formData.company_id}
                                                    onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                                >
                                                    <option value="">Select Company</option>
                                                    {companies.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-5 sm:mt-6 flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm"
                                        >
                                            Create User
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
