import type { KpiCard } from "./types";

const DEFAULT_KPIS: KpiCard[] = [
    {
        id: "revenue",
        label: "Total Revenue (Gross)",
        value: "NPR 1,240,000",
        delta: "+12%",
        deltaTone: "positive",
    },
    {
        id: "pro-subscription",
        label: "Active Pro Subscriptions",
        value: "42 Active",
        sublabel: "Starter & Growth",
        deltaTone: "neutral",
    },
    {
        id: "providers",
        label: "Verified Providers",
        value: "128 Techs",
        sublabel: "12 Agencies",
        deltaTone: "neutral",
    },
    {
        id: "action",
        label: "Action Needed (KYC/Disputes)",
        value: "5 Pending",
        sublabel: "Requires Review",
        deltaTone: "warning",
    },
];

const DELTA_STYLES: Record<NonNullable<KpiCard["deltaTone"]>, string> = {
    positive: "text-emerald-600 bg-emerald-50",
    neutral: "text-gray-400 bg-transparent",
    warning: "text-amber-600 bg-amber-50",
};

interface KpiCardsProps {
    kpis?: KpiCard[];
}

export default function KpiCards({ kpis = DEFAULT_KPIS }: KpiCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
                const valueClass =
                    kpi.deltaTone === "warning" ? "text-amber-600" : "text-gray-900";

                return (
                    <div
                        key={kpi.id}
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                    >
                        <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <p className={`text-2xl font-bold ${valueClass}`}>
                                {kpi.value}
                            </p>
                            {(kpi.delta || kpi.sublabel) && (
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        DELTA_STYLES[kpi.deltaTone ?? "neutral"]
                                    }`}
                                >
                  {kpi.delta ?? kpi.sublabel}
                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}