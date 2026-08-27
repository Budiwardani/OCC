import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await api.post("/categories", data);
            reset();
            fetchCategories();
        } catch (error) {
            console.error("Failed to create category", error);
            alert("Failed to create category");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Failed to delete category", error);
            alert("Failed to delete category");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-secondary-900">Manage Categories</h1>
                <Link to="/dashboard" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                    Back to Dashboard
                </Link>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start mb-8">
                        <div className="flex-1 w-full sm:w-auto">
                            <input
                                {...register("id", { required: "ID is required", maxLength: 10 })}
                                className="block w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                placeholder="ID (e.g. CAT01)"
                                maxLength={10}
                            />
                            {errors.id && <p className="mt-1 text-xs text-red-600">{errors.id.message}</p>}
                        </div>
                        <div className="flex-[2] w-full sm:w-auto">
                            <input
                                {...register("name", { required: "Category Name is required" })}
                                className="block w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                placeholder="New Category Name (e.g. Technical Support)"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                        </div>
                        <button
                            type="submit"
                            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
                        >
                            Add
                        </button>
                    </form>

                    <table className="min-w-full divide-y divide-secondary-200">
                        <thead className="bg-secondary-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">#{cat.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{cat.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
