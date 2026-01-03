export default function StatsCard({ title, value, icon, color, trend }) {
    return (
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                            {icon}
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-secondary-500 truncate">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-2xl font-bold text-secondary-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            {trend && (
                <div className="bg-secondary-50 px-5 py-3">
                    <div className="text-sm">
                        <span className={`font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                        <span className="text-secondary-500"> from last month</span>
                    </div>
                </div>
            )}
        </div>
    );
}
