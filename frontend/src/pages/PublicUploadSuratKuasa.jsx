import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function PublicUploadSuratKuasa() {
    const { ticket } = useParams();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [status, setStatus] = useState("idle"); // idle, success, error
    const [template, setTemplate] = useState(null);

    useEffect(() => {
        api.get("/master-files/SURAT_KUASA_TEMPLATE")
            .then(res => setTemplate(res.data))
            .catch(() => { });
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage(null);
        try {
            const formData = new FormData();
            formData.append("ticket_code", ticket);
            formData.append("file", file);

            await api.post("/surat-kuasa/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setStatus("success");
            setMessage("Document uploaded successfully! Thank you.");
            setFile(null);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage("Upload failed. Please try again or contact support.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Upload Surat Kuasa
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    For Ticket <span className="font-mono font-medium text-gray-900">#{ticket}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {status === "success" ? (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleUpload}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Signed Document (Bermaterai 10.000)
                                </label>
                                {template && (
                                    <div className="mt-1 mb-4">
                                        <a href={`http://localhost:5000/${template.file_path}`} target="_blank" className="text-sm text-primary-600 hover:underline font-medium">
                                            Download Standard Template
                                        </a>
                                    </div>
                                )}
                                <div className="mt-1">
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Please ensure the document is signed on a Materai 10.000.
                                </p>
                            </div>

                            {message && status === 'error' && (
                                <div className="text-red-600 text-sm">{message}</div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Upload Document"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
