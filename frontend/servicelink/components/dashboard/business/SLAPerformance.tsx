export default function SLAPerformance() {
    const metrics = [
        { label: "On-time", value: "94.2%", color: "text-[#1e3a8a]", bar: "bg-[#1e3a8a]", pct: 94.2 },
        // Cancelled maps to a refined version of your brand orange tint
        { label: "Cancelled", value: "3.1%", color: "text-[#e8683f]", bar: "bg-[#e8683f]", pct: 3.1 },
        { label: "Escalated", value: "2.7%", color: "text-red-500", bar: "bg-red-500", pct: 2.7 },
    ];

    const circumference = 2 * Math.PI * 52;
    const onTimePct = 94.2;
    const dashOffset = circumference * (1 - onTimePct / 100);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-full">
            <div>
                <h2 className="text-base font-bold text-gray-800 mb-5">SLA Performance</h2>

                {/* Chart Graphic Section */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            {/* Track background */}
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            {/* Main metric stroke mapped to Deep Blue #1e3a8a */}
                            <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="#1e3a8a"
                                strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">94.2%</span>
                            <span className="text-xs text-gray-400 font-medium mt-0.5">On-time</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bars Section */}
            <div className="space-y-4">
                {metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-600 w-20 shrink-0">{m.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${m.bar}`}
                                style={{ width: `${m.pct}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${m.color}`}>{m.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}