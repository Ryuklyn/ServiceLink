import Link from "next/link";

const tickets = [
    { id: "JT-2024-051", type: "HVAC", provider: null, status: "Requested", sla: "OVERDUE" },
    { id: "JT-2024-052", type: "Plumbing", provider: null, status: "Requested", sla: "OVERDUE" },
    { id: "JT-2024-053", type: "Electrical", provider: null, status: "Requested", sla: "OVERDUE" },
    { id: "JT-2024-048", type: "Electrical", provider: { name: "Ram Shrestha", initials: "RS" }, status: "Assigned", sla: "OVERDUE" },
    { id: "JT-2024-049", type: "Pest Control", provider: { name: "Suresh Thapa", initials: "ST" }, status: "Assigned", sla: "OVERDUE" },
    { id: "JT-2024-050", type: "HVAC", provider: { name: "Bikash Karki", initials: "BK" }, status: "Assigned", sla: "OVERDUE" },
];

// Consistent statuses using brand-aligned tints
const statusStyle: Record<string, string> = {
    // Requested uses a subtle orange tint (#e8683f)
    Requested: "bg-[#e8683f]/10 text-[#e8683f]",
    // Assigned uses a subtle deep blue tint (#1e3a8a)
    Assigned: "bg-[#1e3a8a]/10 text-[#1e3a8a]",
};

export default function RecentJobTickets() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Recent Job Tickets</h2>
                {/* View all link updated to Brand Blue */}
                <Link href="/dashboard/business/jobs" className="text-sm text-[#1e3a8a] hover:text-[#e8683f] font-semibold transition-colors">
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
                            {/* Service Type text updated to Brand Blue */}
                            <td className="py-3 text-[#1e3a8a] font-medium">{t.type}</td>
                            <td className="py-3">
                                {t.provider ? (
                                    <div className="flex items-center gap-2">
                                        {/* Unified provider avatars to use Brand Deep Blue background */}
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-[#1e3a8a]">
                                            {t.provider.initials}
                                        </div>
                                        <span className="text-gray-700 font-medium">{t.provider.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                )}
                            </td>
                            <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${statusStyle[t.status]}`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="py-3">
                                {/* Made SLA Badge a cleaner, softer red so it doesn't clash rawly with the brand colors */}
                                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-xs font-bold">
                                    {t.sla}
                                </span>
                            </td>
                            <td className="py-3">
                                {/* Action button updated to shift from deep blue to orange on hover */}
                                <button className="text-[#1e3a8a] hover:text-[#e8683f] text-sm font-semibold transition-colors">
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}