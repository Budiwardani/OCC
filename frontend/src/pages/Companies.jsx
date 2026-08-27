import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '' });
    const [isEdit, setIsEdit] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const res = await api.get("/companies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(res.data);
        } catch (error) {
            console.error("Failed to fetch companies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (isEdit) {
                await api.put(`/companies/${formData.id}`, { name: formData.name }, { headers });
            } else {
                await api.post("/companies", { name: formData.name }, { headers });
            }

            setShowModal(false);
            setFormData({ id: null, name: '' });
            fetchCompanies(); // Refresh list
        } catch (error) {
            alert("Failed to save company: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this company?")) return;
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/companies/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCompanies();
        } catch (error) {
            alert("Failed to delete company: " + (error.response?.data?.message || error.message));
        }
    };

    const openModal = (company = null) => {
        if (company) {
            setFormData({ id: company.id, name: company.name });
            setIsEdit(true);
        } else {
            setFormData({ id: null, name: '' });
            setIsEdit(false);
        }
        setShowModal(true);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-secondary-900">Companies</h1>
                                <p className="mt-1 text-sm text-secondary-500">Manage client companies</p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Add New Company
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
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-secondary-200">
                                                    {companies.map((company) => (
                                                        <tr key={company.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{company.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{company.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 space-x-2">
                                                                <button
                                                                    onClick={() => openModal(company)}
                                                                    className="text-primary-600 hover:text-primary-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(company.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {companies.length === 0 && (
                                                        <tr>
                                                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-secondary-500">
                                                                No companies found.
                                                            </td>
                                                        </tr>
                                                    )}
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
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{isEdit ? 'Edit Company' : 'Create New Company'}</h3>
                                <form onSubmit={handleCreateOrUpdate} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
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
                                            {isEdit ? 'Save Changes' : 'Create Company'}
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
