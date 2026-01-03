import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function PublicSubmit() {
    const [done, setDone] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const submit = async (data) => {
        setLoading(true);
        try {
            const res = await api.post("/public/complaints", data);
            setResult(res.data);
            setDone(true);
        } catch (error) {
            alert("Error submitting complaint");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (done && result) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 sm:p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-secondary-900 mb-4">Complaint Registered!</h2>
                        <p className="text-secondary-600 mb-8 text-lg">Thank you for letting us know. We've received your complaint and assigned it a unique ticket code.</p>

                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-8 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Ticket Code</p>
                                    <p className="text-2xl font-bold text-primary-700">{result.ticket_code}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Secret Token</p>
                                    <code className="text-sm bg-white px-3 py-2 rounded border border-primary-200 block w-full text-center sm:text-left font-mono text-primary-600 break-all">
                                        {result.public_token}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8 flex items-start text-left">
                            <svg className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm text-yellow-800">
                                <strong className="font-semibold">Important:</strong> Please save your Ticket Code and Token safely. You will need both to track the status of your complaint in the future.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/track"
                                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                            >
                                Track Status
                            </Link>
                            <button
                                onClick={() => { setDone(false); setResult(null); }}
                                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
                            >
                                Submit Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-secondary-900 sm:text-5xl mb-4">Submit a Complaint</h1>
                <p className="text-xl text-secondary-500 max-w-2xl mx-auto">
                    We value your feedback. Please fill out the form below and we'll resolve your issue as quickly as possible.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 sm:p-10">
                    <form onSubmit={handleSubmit(submit)} className="space-y-8">

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-secondary-700 mb-2">Category</label>
                                <div className="relative">
                                    <select
                                        {...register("category", { required: "Category is required" })}
                                        className="block w-full pl-4 pr-10 py-3 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg"
                                    >
                                        <option value="">Select a category...</option>
                                        <option value="Product">Product Quality</option>
                                        <option value="Service">Customer Service</option>
                                        <option value="Billing">Billing Issue</option>
                                        <option value="Delivery">Delivery Problem</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>}
                            </div>

                            <div className="sm:col-span-1">
                                <label className="block text-sm font-semibold text-secondary-700 mb-2">Full Name</label>
                                <input
                                    {...register("customer_name", { required: "Name is required" })}
                                    className="appearance-none block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="John Doe"
                                />
                                {errors.customer_name && <p className="mt-2 text-sm text-red-600">{errors.customer_name.message}</p>}
                            </div>

                            <div className="sm:col-span-1">
                                <label className="block text-sm font-semibold text-secondary-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    {...register("customer_email", { required: "Email is required" })}
                                    className="appearance-none block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="john@example.com"
                                />
                                {errors.customer_email && <p className="mt-2 text-sm text-red-600">{errors.customer_email.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-secondary-700 mb-2">Subject</label>
                                <input
                                    {...register("subject", { required: "Subject is required" })}
                                    className="appearance-none block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Brief summary of your issue"
                                />
                                {errors.subject && <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-secondary-700 mb-2">Description</label>
                                <textarea
                                    {...register("description", { required: "Description is required" })}
                                    rows={6}
                                    className="appearance-none block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-y"
                                    placeholder="Please provide as much detail as possible..."
                                />
                                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : "Submit Complaint"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
