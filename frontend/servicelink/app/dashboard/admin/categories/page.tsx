"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import {
    Search,
    Plus,
    Edit2,
    Layers,
    Wrench,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // adjust if your typed hooks live elsewhere
import {
    fetchCatalogAdmin,
    createCatalogItemThunk,
    updateCatalogItemThunk,
    toggleCatalogItemThunk,
    clearCategoriesAdminError,
} from "@/store/slices/categoriesAdminSlice"; // MUST match the actual file location — see note below
import {
    KNOWN_CATEGORIES,
    PricingUnit,
    formatCategoryLabel,
    ServiceCatalogDTO,
} from "@/store/slices/features/categories/categoriesTypes";

const PRICING_UNITS: PricingUnit[] = ["PER_JOB", "PER_SQFT", "PER_WALL", "PER_ITEM"];

export default function CategoriesPage() {
    const dispatch = useAppDispatch();
    const { items, loading, saving, togglingId, error } = useAppSelector(
        (state) => state.categoriesAdmin,
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New sub-service form state
    const [newCategory, setNewCategory] = useState<string>(KNOWN_CATEGORIES[0]);
    const [newName, setNewName] = useState("");
    const [newDuration, setNewDuration] = useState("");
    const [newPricingUnit, setNewPricingUnit] = useState<PricingUnit>("PER_JOB");
    const [newBasePrice, setNewBasePrice] = useState("");

    useEffect(() => {
        dispatch(fetchCatalogAdmin());
    }, [dispatch]);

    const grouped = useMemo(() => {
        const term = searchTerm.toLowerCase();
        const filtered = items.filter(
            (item: ServiceCatalogDTO) =>
                item.subServiceName.toLowerCase().includes(term) ||
                formatCategoryLabel(item.category).toLowerCase().includes(term),
        );

        const map = new Map<string, ServiceCatalogDTO[]>();
        for (const item of filtered) {
            const list = map.get(item.category) ?? [];
            list.push(item);
            map.set(item.category, list);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [items, searchTerm]);

    function handleToggle(id: number) {
        dispatch(toggleCatalogItemThunk(id));
    }

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!newName.trim()) return;

        const result = await dispatch(
            createCatalogItemThunk({
                category: newCategory,
                subServiceName: newName.trim(),
                defaultDuration: newDuration.trim() || undefined,
                pricingUnit: newPricingUnit,
                basePrice: newBasePrice ? Number(newBasePrice) : undefined,
            }),
        );

        if (createCatalogItemThunk.fulfilled.match(result)) {
            setIsModalOpen(false);
            setNewName("");
            setNewDuration("");
            setNewBasePrice("");
            setNewPricingUnit("PER_JOB");
            setNewCategory(KNOWN_CATEGORIES[0]);
        }
    }

    function handleInlinePriceEdit(item: ServiceCatalogDTO) {
        const value = window.prompt(
            `New base price (NPR) for "${item.subServiceName}"`,
            String(item.basePrice ?? ""),
        );
        if (value === null) return;
        const basePrice = Number(value);
        if (Number.isNaN(basePrice) || basePrice < 0) return;

        dispatch(updateCatalogItemThunk({ id: item.id, payload: { basePrice } }));
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories &amp; Services</h1>
                    <p className="text-sm text-slate-500">
                        Manage the service catalog admins and providers select from.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-sm transition shrink-0"
                >
                    <Plus size={16} /> Add New Sub-Service
                </button>
            </div>

            {/* SEARCH CONTROL */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search categories or services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                    Total Services: <span className="text-slate-900 font-bold">{items.length}</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => dispatch(clearCategoriesAdminError())}
                        className="text-red-400 hover:text-red-600"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* LOADING */}
            {loading && (
                <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                    <Loader2 className="animate-spin" size={18} /> Loading catalog...
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && grouped.length === 0 && (
                <div className="text-center py-20 text-slate-400 text-sm">
                    No services found. Try adjusting your search, or add a new sub-service.
                </div>
            )}

            {/* CATEGORY GRID */}
            {!loading && grouped.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grouped.map(([category, services]) => {
                        const activeCount = services.filter((s) => s.isActive).length;
                        return (
                            <div
                                key={category}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
                            >
                                {/* CARD HEADER */}
                                <div className="p-5 border-b border-slate-100 space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">
                                                {formatCategoryLabel(category)}
                                            </h3>
                                            <span className="text-[10px] font-mono text-slate-400">{category}</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        {activeCount} of {services.length} service{services.length === 1 ? "" : "s"} active
                                    </div>
                                </div>

                                {/* SUBSERVICES LIST */}
                                <div className="p-5 flex-1 space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Wrench size={12} /> Services ({services.length})
                                    </p>

                                    <ul className="space-y-2">
                                        {services.map((service) => (
                                            <li
                                                key={service.id}
                                                className={`flex items-center justify-between gap-2 text-xs p-2 rounded-lg border ${
                                                    service.isActive
                                                        ? "bg-slate-50 border-slate-100"
                                                        : "bg-slate-50/50 border-slate-100 opacity-60"
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-700 truncate">
                                                        {service.subServiceName}
                                                    </p>
                                                    <p className="text-slate-400">
                                                        {service.pricingUnit.replace("_", " ")}
                                                        {service.defaultDuration ? ` · ${service.defaultDuration}` : ""}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleInlinePriceEdit(service)}
                                                        title="Edit base price"
                                                        className="text-slate-400 hover:text-blue-600 transition"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <span className="font-mono text-slate-900 font-semibold">
                                                        NPR {(service.basePrice ?? 0).toLocaleString()}
                                                    </span>
                                                    <button
                                                        onClick={() => handleToggle(service.id)}
                                                        disabled={togglingId === service.id}
                                                        title={service.isActive ? "Deactivate" : "Activate"}
                                                        className={`shrink-0 ${
                                                            service.isActive ? "text-emerald-600" : "text-slate-400"
                                                        } hover:opacity-70 transition disabled:opacity-40`}
                                                    >
                                                        {togglingId === service.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : service.isActive ? (
                                                            <CheckCircle2 size={14} />
                                                        ) : (
                                                            <XCircle size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE SUB-SERVICE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="text-blue-600" size={20} /> Add New Sub-Service
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    {KNOWN_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {formatCategoryLabel(c)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Service Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Short Circuit Repair"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Pricing Unit *</label>
                                    <select
                                        value={newPricingUnit}
                                        onChange={(e) => setNewPricingUnit(e.target.value as PricingUnit)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        {PRICING_UNITS.map((u) => (
                                            <option key={u} value={u}>
                                                {u.replace("_", " ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Base Price (NPR)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="800"
                                        value={newBasePrice}
                                        onChange={(e) => setNewBasePrice(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Default Duration</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 35–45 mins"
                                    value={newDuration}
                                    onChange={(e) => setNewDuration(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    Create Sub-Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}