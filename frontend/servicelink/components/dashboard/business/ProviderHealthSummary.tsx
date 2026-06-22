import { Zap, Droplets, Wind, Sparkles, Bug } from "lucide-react";

const providers = [
    { label: "Electrical", count: 3, icon: Zap, iconBg: "bg-yellow-50", iconColor: "text-yellow-500" },
    { label: "Plumbing", count: 1, icon: Droplets, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    { label: "HVAC", count: 2, icon: Wind, iconBg: "bg-cyan-50", iconColor: "text-cyan-500" },
    { label: "Cleaning", count: 2, icon: Sparkles, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
    { label: "Pest Control", count: 1, icon: Bug, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
];

export default function ProviderHealthSummary() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Provider Health Summary</h2>
            <div className="space-y-3">
                {providers.map((p) => (
                    <div key={p.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.iconBg}`}>
                                <p.icon size={16} className={p.iconColor} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{p.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{p.count} active</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}