import { useState } from "react";
import { useForm } from "react-hook-form";
import api, { getFileUrl } from "../api/api";
import Sidebar from "../components/Sidebar";

export default function DraftSuratKuasa() {
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [phoneSearch, setPhoneSearch] = useState("");
    const ticketWatch = watch("ticket_code");

    const onSubmit = async (data) => {
        setLoading(true);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append("ticket_code", data.ticket_code);
            formData.append("file", data.file[0]);

            const token = localStorage.getItem("token");
            await api.post("/surat-kuasa/draft", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage({ type: "success", text: "Draft uploaded successfully!" });
            reset();
            fetchFiles(data.ticket_code); // Refresh list
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Failed to upload draft. Check ticket code." });
        } finally {
            setLoading(false);
        }
    };

    const fetchFiles = async (ticket) => {
        if (!ticket) return;
        setSearchLoading(true);
        try {
            const token = localStorage.getItem("token"); // Auth required for looking up specific ticket files via admin? or public route?
            // Using the existing public/admin route logic.
            const res = await api.get(`/surat-kuasa/${ticket}`);
            setFileList(res.data);
        } catch (error) {
            console.error(error);
            setFileList([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handlePhoneLookup = async () => {
        if (!phoneSearch) return;
        setSearchLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem("token");
            const res = await api.get(`/surat-kuasa/lookup?phone=${phoneSearch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setValue("ticket_code", res.data.ticket_code);
            fetchFiles(res.data.ticket_code);
            setMessage({ type: "success", text: `Found ticket for ${res.data.customer_name}: ${res.data.ticket_code}` });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "No ticket found for this phone number." });
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-bold text-secondary-900">Draft Surat Kuasa</h1>
                            <p className="mt-1 text-sm text-secondary-500">
                                Upload draft Surat Kuasa for a specific ticket.
                            </p>

                            <div className="mt-8 bg-white shadow sm:rounded-lg p-6 max-w-lg">
                                {message && (
                                    <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {message && (
                                    <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* Phone Lookup Section */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Find Ticket by WhatsApp/Phone</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={phoneSearch}
                                            onChange={(e) => setPhoneSearch(e.target.value)}
                                            placeholder="e.g 08123..."
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handlePhoneLookup}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700"
                                        >
                                            Lookup
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700">Ticket Code</label>
                                            <input
                                                type="text"
                                                {...register("ticket_code", { required: true })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="e.g. 240116OCC..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fetchFiles(ticketWatch)}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Search Files
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Upload Draft (PDF/Doc)</label>
                                        <input
                                            type="file"
                                            {...register("file", { required: true })}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                    >
                                        {loading ? "Uploading..." : "Upload Draft"}
                                    </button>
                                </form>
                            </div>

                            {/* File List Section */}
                            <div className="mt-8 max-w-3xl">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Files for Ticket: {ticketWatch || "..."}</h2>
                                {searchLoading ? (
                                    <p className="text-gray-500">Loading files...</p>
                                ) : fileList.length === 0 ? (
                                    <p className="text-gray-500 italic">No files found.</p>
                                ) : (
                                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                        <ul className="divide-y divide-gray-200">
                                            {fileList.map((file) => (
                                                <li key={file.id}>
                                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className={`p-2 rounded-full mr-4 ${file.uploaded_by === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-primary-600 truncate">
                                                                    {file.uploaded_by === 'ADMIN' ? 'Draft (Uploaded by Admin)' : 'Signed Copy (Uploaded by Customer)'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(file.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={getFileUrl(file.file_path)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-medium text-gray-500 hover:text-gray-900"
                                                        >
                                                            View/Download
                                                        </a>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
