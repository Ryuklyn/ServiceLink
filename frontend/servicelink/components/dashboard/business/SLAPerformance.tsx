export default function SLAPerformance() {
    const metrics = [
        { label: "On-time", value: "94.2%", color: "text-blue-600", bar: "bg-blue-600", pct: 94.2 },
        { label: "Cancelled", value: "3.1%", color: "text-yellow-500", bar: "bg-yellow-400", pct: 3.1 },
        { label: "Escalated", value: "2.7%", color: "text-red-500", bar: "bg-red-400", pct: 2.7 },
    ];

    const circumference = 2 * Math.PI * 52;
    const onTimePct = 94.2;
    const dashOffset = circumference * (1 - onTimePct / 100);

    return (
        <div className="bg-white rounded-xl h-[400px] w-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">SLA Performance</h2>
            <div className="flex justify-center mb-6">
                <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke="#1d4ed8"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">94.2%</span>
                        <span className="text-xs text-gray-500">On-time</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                {metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-600 w-20 shrink-0">{m.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${m.bar}`}
                                style={{ width: `${m.pct}%` }}
                            />
                        </div>
                        <span className={`text-sm font-semibold w-10 text-right ${m.color}`}>{m.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}