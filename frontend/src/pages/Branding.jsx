import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Branding() {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Watch values for preview
    const logoUrl = watch("logo_url");

    useEffect(() => {
        fetchBranding();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const token = localStorage.getItem("token");
            const res = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setValue('logo_url', res.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        }
    };

    const fetchBranding = async () => {
        try {
            const res = await api.get("/branding");
            const data = res.data;
            if (data) {
                setValue("name", data.name);
                setValue("address", data.address);
                setValue("phone", data.phone);
                setValue("email_support", data.email_support);
                setValue("maps_location", data.maps_location);
                setValue("logo_url", data.logo_url);

                // Social Media
                if (data.social_media) {
                    setValue("social_ig", data.social_media.instagram);
                    setValue("social_fb", data.social_media.facebook);
                    setValue("social_tiktok", data.social_media.tiktok);
                    setValue("social_youtube", data.social_media.youtube);
                }
            }
        } catch (error) {
            console.error("Failed to fetch branding", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                name: data.name,
                address: data.address,
                phone: data.phone,
                email_support: data.email_support,
                maps_location: data.maps_location,
                logo_url: data.logo_url,
                social_media: {
                    instagram: data.social_ig,
                    facebook: data.social_fb,
                    tiktok: data.social_tiktok,
                    youtube: data.social_youtube
                }
            };
            const token = localStorage.getItem("token");
            await api.put("/branding", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Branding updated successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update branding.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10">Loading...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-bold text-secondary-900">Branding Settings</h1>
                            <p className="mt-1 text-sm text-secondary-500">Customize your company details and appearance.</p>

                            <div className="mt-8 bg-white shadow rounded-lg p-6">
                                {message && (
                                    <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-secondary-700">Company Name</label>
                                            <input {...register("name")} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-secondary-700">Logo</label>
                                            <div className="mt-1 flex items-center space-x-4">
                                                {/* Preview */}
                                                <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300">
                                                    {watch("logo_url") ? (
                                                        <img src={watch("logo_url")} alt="Logo Preview" className="h-full w-full object-contain" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">No Logo</div>
                                                    )}
                                                </div>

                                                {/* Upload Button */}
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="block w-full text-sm text-secondary-500
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-full file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-primary-50 file:text-primary-700
                                                            hover:file:bg-primary-100"
                                                    />
                                                    <p className="mt-1 text-xs text-secondary-500">JPG, PNG, GIF or WEBP. Max 2MB.</p>
                                                    <input type="hidden" {...register("logo_url")} />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700">Support Phone</label>
                                            <input {...register("phone")} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700">Support Email</label>
                                            <input {...register("email_support")} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-secondary-700">Address</label>
                                            <textarea {...register("address")} rows={3} className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-secondary-700">Maps Location (Embed URL)</label>
                                            <input {...register("maps_location")} placeholder="https://www.google.com/maps/embed?..." className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                        </div>
                                    </div>

                                    <div className="border-t border-secondary-200 pt-6">
                                        <h3 className="text-lg font-medium text-secondary-900 mb-4">Social Media</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700">Instagram</label>
                                                <input {...register("social_ig")} placeholder="@username" className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700">Facebook</label>
                                                <input {...register("social_fb")} placeholder="Page URL" className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700">TikTok</label>
                                                <input {...register("social_tiktok")} placeholder="@username" className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary-700">YouTube</label>
                                                <input {...register("social_youtube")} placeholder="Channel URL" className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-5">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
