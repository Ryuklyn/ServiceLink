export default function MonthlyBudget() {
    // Dynamic data matching the values from your visual spec reference
    const total = 150000;
    const paid = 55700;
    const pending = 69500;
    const remaining = 24800;

    // Calculate dynamic widths for the multi-segment bar
    const paidPct = (paid / total) * 100;
    const pendingPct = (pending / total) * 100;
    const remainingPct = (remaining / total) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <h2 className="text-lg font-bold text-slate-900 mb-5">Budget Tracker</h2>

                {/* Subtitle Total Header Info */}
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400 font-medium text-base">Total Budget</span>
                    <span className="text-slate-900 font-bold text-base">Rs. {total.toLocaleString()}</span>
                </div>

                {/* Multi-Segment Track Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex mb-6">
                    <div
                        className="bg-[#1e3a8a] h-full"
                        style={{ width: `${paidPct}%` }}
                    />
                    <div
                        className="bg-[#e8683f] h-full"
                        style={{ width: `${pendingPct}%` }}
                    />
                    <div
                        className="bg-slate-200 h-full"
                        style={{ width: `${remainingPct}%` }}
                    />
                </div>
            </div>

            {/* Horizontal Grid Info Elements */}
            <div className="grid grid-cols-3 gap-4 items-start">
                {/* Paid */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a] shrink-0" />
                        <span className="text-sm font-medium text-slate-400">Paid</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">Rs. {paid.toLocaleString()}</p>
                </div>

                {/* Pending */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e8683f] shrink-0" />
                        <span className="text-sm font-medium text-slate-400">Pending</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">Rs. {pending.toLocaleString()}</p>
                </div>

                {/* Remaining */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
                        <span className="text-sm font-medium text-slate-400">Remaining</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">Rs. {remaining.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}