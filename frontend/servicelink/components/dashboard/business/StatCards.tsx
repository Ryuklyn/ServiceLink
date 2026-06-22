import { Users, ClipboardList, TrendingUp, CreditCard } from "lucide-react";

const stats = [
    {
        label: "Active Providers",
        value: "9",
        sub: "3 pending approval",
        icon: Users,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
    },
    {
        label: "Jobs This Month",
        value: "14",
        sub: "3 in progress",
        icon: ClipboardList,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
    },
    {
        label: "SLA Compliance",
        value: "94.2%",
        sub: "+2.1% vs last month",
        badge: "+2.1%",
        icon: TrendingUp,
        iconBg: "bg-green-50",
        iconColor: "text-green-500",
    },
    {
        label: "Monthly Spend",
        value: "Rs. 84,200",
        sub: "Rs. 15,800 under budget",
        icon: CreditCard,
        iconBg: "bg-red-50",
        iconColor: "text-red-400",
    },
];

export default function StatCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-5 flex items-start justify-between shadow-sm border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
                        {s.badge && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-green-500 text-xs font-semibold">↗ {s.badge}</span>
                            </div>
                        )}
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                        <s.icon size={20} className={s.iconColor} />
                    </div>
                </div>
            ))}
        </div>
    );
}