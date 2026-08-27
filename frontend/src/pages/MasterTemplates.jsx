import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";
import Sidebar from "../components/Sidebar";

export default function MasterTemplates() {
    const [template, setTemplate] = useState(null);
    const { register, handleSubmit, reset } = useForm();
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        loadTemplate();
    }, []);

    const loadTemplate = async () => {
        try {
            const res = await api.get("/master-files/SURAT_KUASA_TEMPLATE");
            setTemplate(res.data);
        } catch (err) {
            // Not found is okay
        }
    };

    const onUpload = async (data) => {
        setUploading(true);
        setMsg(null);
        try {
            const formData = new FormData();
            formData.append("key", "SURAT_KUASA_TEMPLATE");
            formData.append("file", data.file[0]);

            const token = localStorage.getItem("token");
            await api.post("/master-files", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            setMsg({ type: "success", text: "Template Updated Successfully" });
            loadTemplate();
            reset();
        } catch (error) {
            console.error(error);
            setMsg({ type: "error", text: "Upload Failed" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-bold text-secondary-900">Master Templates</h1>
                            <p className="mt-1 text-sm text-secondary-500">
                                Upload standard templates here. These will be automatically available to customers.
                            </p>

                            <div className="mt-8 bg-white p-6 shadow sm:rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Surat Kuasa Template</h3>

                                {template ? (
                                    <div className="mb-6 p-4 bg-green-50 rounded-md border border-green-200 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Current Template Active</p>
                                            <p className="text-xs text-green-600">File: {template.name}</p>
                                            <p className="text-xs text-green-600">Updated: {new Date(template.updated_at).toLocaleString()}</p>
                                        </div>
                                        <a
                                            href={`http://localhost:5000/${template.file_path}`}
                                            target="_blank"
                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium underline"
                                        >
                                            View Configured Template
                                        </a>
                                    </div>
                                ) : (
                                    <div className="mb-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                                        <p className="text-sm text-yellow-800">No template configured yet. Customers cannot download a standard form.</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onUpload)} className="space-y-4 max-w-lg">
                                    {msg && (
                                        <div className={`p-2 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {msg.text}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Update/Upload Template (PDF/DOCX)</label>
                                        <input type="file" {...register("file", { required: true })} className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm p-2" />
                                    </div>
                                    <button type="submit" disabled={uploading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                        {uploading ? "Uploading..." : "Save Template"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
