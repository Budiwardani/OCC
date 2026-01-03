import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/api';

export default function Layout() {
    const navigate = useNavigate();
    const [branding, setBranding] = useState({
        name: 'OCC System',
        logo_url: null,
        address: '123 Main St, City',
        phone: '(555) 123-4567',
        social_media: {}
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        api.get('/branding')
            .then(res => setBranding(res.data))
            .catch(err => console.error("Failed to load branding", err));

        // Check login status
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-100 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                {branding.logo_url ? (
                                    <img className="h-8 w-auto mr-3 max-h-8 max-w-[200px]" src={branding.logo_url} alt="Logo" />
                                ) : (
                                    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                )}
                                <span className="font-bold text-xl text-gray-900 tracking-tight">{branding.name}</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Submit Ticket</Link>
                            <Link to="/track" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Track Ticket</Link>

                            {isLoggedIn ? (
                                <div className="flex items-center space-x-2">
                                    <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                                    <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow">Agent Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet context={{ branding }} />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">Contact Us</h3>
                            <p className="text-gray-500 text-sm">{branding.address}</p>
                            <p className="text-gray-500 text-sm mt-2">{branding.phone}</p>
                            {branding.email_support && <p className="text-gray-500 text-sm mt-1">{branding.email_support}</p>}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">Social Media</h3>
                            <div className="flex space-x-4">
                                {branding.social_media?.instagram && <a href={`https://instagram.com/${branding.social_media.instagram}`} target="_blank" className="text-gray-400 hover:text-pink-600">IG</a>}
                                {branding.social_media?.facebook && <a href={branding.social_media.facebook} target="_blank" className="text-gray-400 hover:text-blue-600">FB</a>}
                                {branding.social_media?.tiktok && <a href={`https://tiktok.com/@${branding.social_media.tiktok}`} target="_blank" className="text-gray-400 hover:text-black">TikTok</a>}
                                {branding.social_media?.youtube && <a href={branding.social_media.youtube} target="_blank" className="text-gray-400 hover:text-red-600">YT</a>}
                            </div>
                        </div>
                        <div>
                            {branding.maps_location && (
                                <div className="rounded-lg overflow-hidden h-32 bg-gray-100">
                                    <iframe
                                        src={branding.maps_location}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="mt-8 text-center text-base text-gray-400">
                        &copy; 2024 {branding.name}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
