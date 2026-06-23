import { Zap, Droplets, Wind, Sparkles, Bug } from "lucide-react";

const providers = [
    {
        label: "Electrical",
        count: 3,
        icon: Zap,
        iconBg: "bg-[#1e3a8a]/10",
        iconColor: "text-[#1e3a8a]"
    },
    {
        label: "Plumbing",
        count: 1,
        icon: Droplets,
        iconBg: "bg-sky-50",
        iconColor: "text-sky-600"
    },
    {
        label: "HVAC",
        count: 2,
        icon: Wind,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600"
    },
    {
        label: "Cleaning",
        count: 2,
        icon: Sparkles,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600"
    },
    {
        label: "Pest Control",
        count: 1,
        icon: Bug,
        iconBg: "bg-[#e8683f]/10",
        iconColor: "text-[#e8683f]"
    },
];

export default function ProviderHealthSummary() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-5">Provider Health Summary</h2>
                <div className="space-y-4">
                    {providers.map((p) => (
                        <div key={p.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.iconBg}`}>
                                    <p.icon size={18} className={p.iconColor} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{p.label}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-sm font-medium text-slate-500">{p.count} active</span>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}