import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";

export default function Dashboard() {
    const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchStats();
        fetchActivity();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await api.get("/dashboard/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            if (error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/dashboard/activity", { headers: { Authorization: `Bearer ${token}` } });
            setActivity(res.data);
        } catch (error) {
            console.error("Failed to fetch activity:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-secondary-50">
            <Sidebar />

            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-bold text-secondary-900">Welcome, {user.name}</h1>
                            <p className="mt-1 text-sm text-secondary-500">
                                {((user.role || "").toLowerCase().replace(/\s/g, '') === 'superadmin') ? "System performance overview" : "Overview of your assigned tickets"}
                            </p>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <StatsCard
                                    title="Total Tickets"
                                    value={stats.total}
                                    icon={<svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                                    color="bg-primary-500 text-primary-600"
                                />
                                <StatsCard
                                    title="Open"
                                    value={stats.open}
                                    icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    color="bg-yellow-500 text-yellow-600"
                                    trend={12}
                                />
                                <StatsCard
                                    title="In Progress"
                                    value={stats.in_progress}
                                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                                    color="bg-purple-500 text-purple-600"
                                />
                                <StatsCard
                                    title="Resolved"
                                    value={stats.resolved}
                                    icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    color="bg-green-500 text-green-600"
                                    trend={5}
                                />
                            </div>

                            <div className="mt-8">
                                <h2 className="text-lg leading-6 font-medium text-secondary-900 mb-4">Recent Activity</h2>
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-secondary-200">
                                        {activity.length === 0 ? (
                                            <li className="px-4 py-4 sm:px-6 text-sm text-secondary-500">No recent activity.</li>
                                        ) : activity.map(item => (
                                            <li key={item.id} className="px-4 py-4 sm:px-6 text-sm text-secondary-700">
                                                <span className="font-medium">{item.user_name || "System"}</span>{" "}
                                                {item.action.toLowerCase().replaceAll("_", " ")}{item.ticket_code ? ` (${item.ticket_code})` : ""}
                                                <span className="ml-2 text-secondary-500">{new Date(item.created_at).toLocaleString()}</span>
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
