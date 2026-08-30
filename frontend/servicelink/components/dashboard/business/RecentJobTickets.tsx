import Link from "next/link";
import { ProJobTicketResponse } from "@/services/proJobService";

interface RecentJobTicketsProps {
  jobs: ProJobTicketResponse[];
  loading: boolean;
}

const statusStyle: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-600 border border-amber-100",
  ASSIGNING: "bg-blue-50 text-blue-600 border border-blue-100",
  PARTIALLY_ASSIGNED: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  ASSIGNED: "bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20",
  IN_PROGRESS: "bg-purple-50 text-purple-600 border border-purple-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-600 border border-rose-100",
  UNFULFILLED: "bg-slate-50 text-slate-600 border border-slate-100",
};

export default function RecentJobTickets({ jobs, loading }: RecentJobTicketsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Recent Job Tickets</h2>
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
                <th className="text-left pb-2 font-semibold">Scheduled Date</th>
                <th className="text-left pb-2 font-semibold">Status</th>
                <th className="text-left pb-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    Loading recent tickets...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    No job tickets created yet.
                  </td>
                </tr>
              ) : (
                jobs.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold text-gray-800">{t.reference}</td>
                    <td className="py-3 text-[#1e3a8a] font-medium">{t.service}</td>
                    <td className="py-3 text-gray-600">{t.startDate} {t.startTime?.substring(0, 5)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${statusStyle[t.status] || "bg-gray-50 text-gray-500"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href={`/dashboard/business/jobs?id=${t.id}`} className="text-[#1e3a8a] hover:text-[#e8683f] text-sm font-semibold transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}