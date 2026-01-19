import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/api";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [branding, setBranding] = useState({ name: 'OCC Admin', logo_url: null });

    // Normalize user role to avoid case sensitivity issues
    const userRole = (user.role || "").toLowerCase();

    // DEBUG: Check what role is actually stored
    console.log("Current User:", user);
    console.log("Normalized Role:", userRole);

    const isSuperadmin = userRole === 'superadmin';
    const isManager = userRole === 'manager';

    useEffect(() => {
        api.get('/branding')
            .then(res => setBranding(res.data))
            .catch(err => console.error("Failed to load branding in sidebar", err));
    }, []);

    const isActive = (path) => {
        return location.pathname === path
            ? "bg-primary-50 text-primary-600"
            : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 border-r border-secondary-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4 mb-6">
                            {branding.logo_url ? (
                                <img
                                    src={branding.logo_url}
                                    alt="Logo"
                                    className="h-8 w-auto mr-3 max-h-8 max-w-[50px] object-contain"
                                />
                            ) : (
                                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            )}
                            <span className="text-xl font-bold text-secondary-900 tracking-tight truncate">{branding.name}</span>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            <Link to="/dashboard" className={`${isActive("/dashboard")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Dashboard
                            </Link>

                            <Link to="/dashboard/complaints" className={`${isActive("/dashboard/complaints")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Complaints
                            </Link>

                            <Link to="/dashboard/surat-kuasa" className={`${isActive("/dashboard/surat-kuasa")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Draft Surat Kuasa
                            </Link>

                            <Link to="/dashboard/surat-kuasa/approved" className={`${isActive("/dashboard/surat-kuasa/approved")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Approved Surat Kuasa
                            </Link>

                            {(isSuperadmin || isManager) && (
                                <Link to="/dashboard/agents" className={`${isActive("/dashboard/agents")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                    <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Agents & Managers
                                </Link>
                            )}

                            {isSuperadmin && (
                                <>
                                    <Link to="/dashboard/branding" className={`${isActive("/dashboard/branding")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                        <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        Branding
                                    </Link>

                                    <Link to="/dashboard/categories" className={`${isActive("/dashboard/categories")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                        <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                        Categories
                                    </Link>

                                    <Link to="/dashboard/companies" className={`${isActive("/dashboard/companies")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                        <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Companies
                                    </Link>

                                    <Link to="/dashboard/official-emails" className={`${isActive("/dashboard/official-emails")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                        <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Email Dinas
                                    </Link>

                                    <Link to="/dashboard/master-templates" className={`${isActive("/dashboard/master-templates")} group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}>
                                        <svg className="mr-3 h-6 w-6 text-secondary-400 group-hover:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Master Templates
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-secondary-200 p-4">
                        <div className="flex-shrink-0 w-full group block">
                            <div className="flex items-center">
                                <div className="inline-block h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-secondary-700 group-hover:text-secondary-900">
                                        {user.name || 'Admin User'}
                                    </p>
                                    <button
                                        onClick={handleLogout}
                                        className="mt-1 flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
