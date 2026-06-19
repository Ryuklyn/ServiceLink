"use client";

import { useState } from "react";
import {
    Zap,
    Hammer,
    Paintbrush,
    Users,
    Pencil,
    Trash2,
    ChevronUp,
    ChevronDown,
    Info,
    FileText,
    Lightbulb,
    HelpCircle,
} from "lucide-react";

type Service = {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    price: string;
};

type Category = "electrician" | "carpenter" | "painter";

const ELECTRICIAN_SERVICES: Service[] = [
    {
        id: "wiring",
        name: "Wiring & Rewiring",
        description: "Complete house wiring, rewiring and related works",
        enabled: true,
        price: "1,000",
    },
    {
        id: "breaker",
        name: "Circuit Breaker Repair",
        description: "Repair and replacement of MCB, RCCB, and breakers",
        enabled: true,
        price: "500",
    },
    {
        id: "lighting",
        name: "Lighting Installation",
        description: "Indoor, outdoor and decorative lighting installation",
        enabled: true,
        price: "800",
    },
    {
        id: "inverter",
        name: "Inverter Setup",
        description: "Inverter installation and basic configuration",
        enabled: true,
        price: "2,000",
    },
    {
        id: "panel",
        name: "Electrical Panel Upgrade",
        description: "Electrical panel upgrade and load management",
        enabled: false,
        price: "",
    },
    {
        id: "socket",
        name: "Socket & Switch Installation",
        description: "Installation of sockets, switches and fittings",
        enabled: false,
        price: "",
    },
];

/** Reusable toggle switch — used for every on/off control in this tab */
function ToggleSwitch({
                          checked,
                          onChange,
                          disabled = false,
                      }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            aria-pressed={checked}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? "bg-[#1e3a8a]" : "bg-slate-200"
            }`}
        >
      <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              checked ? "translate-x-5" : "translate-x-0"
          }`}
      />
        </button>
    );
}

export default function ServicesTab() {
    const [services, setServices] = useState<Service[]>(ELECTRICIAN_SERVICES);
    const [expanded, setExpanded] = useState<Category>("electrician");

    const toggleService = (id: string) => {
        setServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        );
    };

    const updatePrice = (id: string, value: string) => {
        setServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, price: value } : s))
        );
    };

    const enabledCount = services.filter((s) => s.enabled).length;

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Services &amp; Pricing
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage the services you offer and set your prices. Enable or
                            disable services based on your expertise.
                        </p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                        <Info className="h-4 w-4" />
                        How Pricing Works
                    </button>
                </div>

                {/* Categories */}
                <p className="mb-2 text-xs font-medium text-slate-500">
                    Your Service Categories
                </p>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Zap className="h-4 w-4 text-[#e8683f]" />
              Electrician
            </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
              4/6 Enabled
            </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Hammer className="h-4 w-4 text-[#e8683f]" />
              Carpenter
            </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
              2/5 Enabled
            </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Paintbrush className="h-4 w-4 text-[#e8683f]" />
              Painter
            </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
              3/4 Enabled
            </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-slate-700">
                                Request New Category
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Not seeing your expertise?
                            </p>
                            <button className="mt-1 text-xs font-medium text-[#1e3a8a] hover:underline">
                                Request Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main content: table + sidebar */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                        {/* Electrician panel */}
                        <div className="rounded-xl border border-slate-200">
                            <button
                                onClick={() =>
                                    setExpanded(
                                        expanded === "electrician" ? ("" as Category) : "electrician"
                                    )
                                }
                                className="flex w-full items-center justify-between px-5 py-4"
                            >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Zap className="h-4 w-4 text-[#e8683f]" />
                  Electrician
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {enabledCount}/{services.length} Services Enabled
                  </span>
                </span>
                                {expanded === "electrician" ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>

                            {expanded === "electrician" && (
                                <div className="border-t border-slate-200 px-5 pb-5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                            <tr className="text-xs text-slate-500">
                                                <th className="py-3 font-medium">Service</th>
                                                <th className="py-3 font-medium">Description</th>
                                                <th className="py-3 font-medium">Status</th>
                                                <th className="py-3 font-medium">Your Price (NPR)</th>
                                                <th className="py-3 font-medium">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                            {services.map((service) => (
                                                <tr key={service.id}>
                                                    <td className="py-4 align-middle font-medium text-slate-800">
                                                        {service.name}
                                                    </td>
                                                    <td className="py-4 align-middle text-slate-500">
                                                        {service.description}
                                                    </td>
                                                    <td className="py-4 align-middle">
                                                        <ToggleSwitch
                                                            checked={service.enabled}
                                                            onChange={() => toggleService(service.id)}
                                                        />
                                                    </td>
                                                    <td className="py-4 align-middle">
                                                        <input
                                                            type="text"
                                                            value={service.price}
                                                            placeholder="—"
                                                            disabled={!service.enabled}
                                                            onChange={(e) =>
                                                                updatePrice(service.id, e.target.value)
                                                            }
                                                            className="w-24 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none disabled:bg-slate-50 disabled:text-slate-300 focus:border-[#1e3a8a]"
                                                        />
                                                    </td>
                                                    <td className="py-4 align-middle">
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <button className="hover:text-[#1e3a8a]">
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button className="hover:text-red-500">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Carpenter panel */}
                        <div className="rounded-xl border border-slate-200">
                            <button
                                onClick={() =>
                                    setExpanded(
                                        expanded === "carpenter" ? ("" as Category) : "carpenter"
                                    )
                                }
                                className="flex w-full items-center justify-between px-5 py-4"
                            >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Hammer className="h-4 w-4 text-[#e8683f]" />
                  Carpenter
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    2/5 Services Enabled
                  </span>
                </span>
                                {expanded === "carpenter" ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>
                        </div>

                        {/* Painter panel */}
                        <div className="rounded-xl border border-slate-200">
                            <button
                                onClick={() =>
                                    setExpanded(
                                        expanded === "painter" ? ("" as Category) : "painter"
                                    )
                                }
                                className="flex w-full items-center justify-between px-5 py-4"
                            >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Paintbrush className="h-4 w-4 text-[#e8683f]" />
                  Painter
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    3/4 Services Enabled
                  </span>
                </span>
                                {expanded === "painter" ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <div className="rounded-xl border border-slate-200 p-5">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <FileText className="h-4 w-4 text-[#e8683f]" />
                                Pricing Guidelines
                            </h3>
                            <p className="mb-3 text-xs text-slate-500">
                                Set competitive prices to get more bookings.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Research market rates in your area
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Consider your experience and skill level
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Keep prices updated with market trends
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Higher quality often justifies higher price
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <h3 className="mb-3 text-sm font-semibold text-slate-900">
                                Service Tips
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e3a8a]/10 text-[#1e3a8a]">
                    <Pencil className="h-3.5 w-3.5" />
                  </span>
                                    <p className="text-slate-600">
                                        Enable only the services you can deliver with high
                                        quality.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </span>
                                    <p className="text-slate-600">
                                        Keep your prices competitive and fair.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                    ✓
                  </span>
                                    <p className="text-slate-600">
                                        Update your availability to get more bookings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                Need Help?
                            </h3>
                            <p className="mb-3 text-sm text-slate-500">
                                If you need help with services or pricing, contact our
                                support.
                            </p>
                            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <HelpCircle className="h-4 w-4" />
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-[#e8683f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d95c34]">
                    Save Changes
                </button>
                <button className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                    Preview Public Profile
                </button>
            </div>
        </div>
    );
}