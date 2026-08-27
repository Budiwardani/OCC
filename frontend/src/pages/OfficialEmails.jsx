import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";
import Sidebar from "../components/Sidebar";

export default function OfficialEmails() {
    const [emails, setEmails] = useState([]);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        try {
            const res = await api.get("/official-emails", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setEmails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (data) => {
        try {
            await api.post("/official-emails", data, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            reset();
            loadEmails();
        } catch (err) {
            alert("Failed to add email");
        }
    };

    const onDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/official-emails/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            loadEmails();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-bold text-secondary-900">Master Data: Email Dinas</h1>

                            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Form */}
                                <div className="bg-white p-6 shadow sm:rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Email</h3>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name / Division</label>
                                            <input {...register("name", { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g. Support Team" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                            <input type="email" {...register("email", { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="support@occ.com" />
                                        </div>
                                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                            Add Email
                                        </button>
                                    </form>
                                </div>

                                {/* List */}
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <ul className="divide-y divide-gray-200">
                                        {emails.map((email) => (
                                            <li key={email.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
                                                <div>
                                                    <p className="text-sm font-medium text-primary-600">{email.name}</p>
                                                    <p className="text-sm text-gray-500">{email.email}</p>
                                                </div>
                                                <button onClick={() => onDelete(email.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
