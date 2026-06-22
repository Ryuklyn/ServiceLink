import Link from "next/link";

const tickets = [
    { id: "JT-2024-051", type: "HVAC", provider: null, status: "Requested", sla: "OVERDUE" },
    { id: "JT-2024-052", type: "Plumbing", provider: null, status: "Requested", sla: "OVERDUE" },
    { id: "JT-2024-053", type: "Electrical", provider: null, status: "Requested", sla: "OVERDUE" },
    { id: "JT-2024-048", type: "Electrical", provider: { name: "Ram Shrestha", initials: "RS", color: "bg-blue-500" }, status: "Assigned", sla: "OVERDUE" },
    { id: "JT-2024-049", type: "Pest Control", provider: { name: "Suresh Thapa", initials: "ST", color: "bg-purple-500" }, status: "Assigned", sla: "OVERDUE" },
    { id: "JT-2024-050", type: "HVAC", provider: { name: "Bikash Karki", initials: "BK", color: "bg-orange-500" }, status: "Assigned", sla: "OVERDUE" },
];

const statusStyle: Record<string, string> = {
    Requested: "bg-yellow-100 text-yellow-700",
    Assigned: "bg-green-100 text-green-700",
};

export default function RecentJobTickets() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Recent Job Tickets</h2>
                <Link href="/dashboard/business/jobs" className="text-sm text-blue-600 hover:underline font-medium">
                    View all jobs →
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        <th className="text-left pb-2 font-semibold">Job ID</th>
                        <th className="text-left pb-2 font-semibold">Service Type</th>
                        <th className="text-left pb-2 font-semibold">Provider</th>
                        <th className="text-left pb-2 font-semibold">Status</th>
                        <th className="text-left pb-2 font-semibold">SLA</th>
                        <th className="text-left pb-2 font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {tickets.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 font-semibold text-gray-800">{t.id}</td>
                            <td className="py-3 text-blue-600 font-medium">{t.type}</td>
                            <td className="py-3">
                                {t.provider ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${t.provider.color}`}>
                                            {t.provider.initials}
                                        </div>
                                        <span className="text-gray-700">{t.provider.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Unassigned</span>
                                )}
                            </td>
                            <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusStyle[t.status]}`}>
                    {t.status}
                  </span>
                            </td>
                            <td className="py-3">
                                <span className="text-red-500 font-bold text-xs">{t.sla}</span>
                            </td>
                            <td className="py-3">
                                <button className="text-gray-600 hover:text-blue-600 text-sm font-medium">View</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}