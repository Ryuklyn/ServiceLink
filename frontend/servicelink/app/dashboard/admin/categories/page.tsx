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
    Trash2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // adjust if your typed hooks live elsewhere
import {
    fetchCategoriesAdmin,
    fetchCatalogAdmin,
    createCategoryWithServicesThunk,
    createCatalogItemThunk,
    updateCatalogItemThunk,
    toggleCatalogItemThunk,
    toggleCategoryThunk,
    clearCategoriesAdminError,
} from "@/store/slices/categoriesAdminSlice"; // must match the actual file location
import {
    PricingUnit,
    ServiceCatalogDTO,
    SubServiceInput,
} from "@/store/slices/features/categories/categoriesTypes";

const PRICING_UNITS: PricingUnit[] = ["PER_JOB", "PER_SQFT", "PER_WALL", "PER_ITEM"];

function emptyRow(): SubServiceInput {
    return { subServiceName: "", defaultDuration: "", pricingUnit: "PER_JOB", basePrice: undefined };
}

export default function CategoriesPage() {
    const dispatch = useAppDispatch();
    const { categories, items, loading, saving, togglingCategoryId, togglingServiceId, error } =
        useAppSelector((state) => state.categoriesAdmin);

    const [searchTerm, setSearchTerm] = useState("");

    // "Add New Category" modal — category name + N sub-service rows
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [subServiceRows, setSubServiceRows] = useState<SubServiceInput[]>([emptyRow()]);

    // "Add Service to existing category" modal
    const [addServiceCategoryId, setAddServiceCategoryId] = useState<number | null>(null);
    const [singleService, setSingleService] = useState<SubServiceInput>(emptyRow());

    useEffect(() => {
        dispatch(fetchCategoriesAdmin());
        dispatch(fetchCatalogAdmin());
    }, [dispatch]);

    const itemsByCategory = useMemo(() => {
        const map = new Map<number, ServiceCatalogDTO[]>();
        for (const item of items) {
            const list = map.get(item.categoryId) ?? [];
            list.push(item);
            map.set(item.categoryId, list);
        }
        return map;
    }, [items]);

    const visibleCategories = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return categories;
        return categories.filter((c) => {
            if (c.name.toLowerCase().includes(term)) return true;
            const services = itemsByCategory.get(c.id) ?? [];
            return services.some((s) => s.subServiceName.toLowerCase().includes(term));
        });
    }, [categories, itemsByCategory, searchTerm]);

    // ── Add New Category (name + multi-row sub-services) ──────────────────

    function addRow() {
        setSubServiceRows((rows) => [...rows, emptyRow()]);
    }

    function removeRow(index: number) {
        setSubServiceRows((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== index)));
    }

    function updateRow(index: number, patch: Partial<SubServiceInput>) {
        setSubServiceRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    }

    async function handleCreateCategory(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const validRows = subServiceRows.filter((r) => r.subServiceName.trim());

        const result = await dispatch(
            createCategoryWithServicesThunk({
                name: newCategoryName.trim(),
                subServices: validRows.map((r) => ({
                    subServiceName: r.subServiceName.trim(),
                    defaultDuration: r.defaultDuration?.trim() || undefined,
                    pricingUnit: r.pricingUnit,
                    basePrice: r.basePrice,
                })),
            }),
        );

        if (createCategoryWithServicesThunk.fulfilled.match(result)) {
            setIsCategoryModalOpen(false);
            setNewCategoryName("");
            setSubServiceRows([emptyRow()]);
            // Refresh both lists so the newly created category + its services show up
            dispatch(fetchCategoriesAdmin());
            dispatch(fetchCatalogAdmin());
        }
    }

    // ── Add single service to an existing category ─────────────────────────

    async function handleAddServiceToCategory(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (addServiceCategoryId === null || !singleService.subServiceName.trim()) return;

        const result = await dispatch(
            createCatalogItemThunk({
                categoryId: addServiceCategoryId,
                subServiceName: singleService.subServiceName.trim(),
                defaultDuration: singleService.defaultDuration?.trim() || undefined,
                pricingUnit: singleService.pricingUnit,
                basePrice: singleService.basePrice,
            }),
        );

        if (createCatalogItemThunk.fulfilled.match(result)) {
            setAddServiceCategoryId(null);
            setSingleService(emptyRow());
        }
    }

    // ── Existing service actions ────────────────────────────────────────────

    function handleToggleService(id: number) {
        dispatch(toggleCatalogItemThunk(id));
    }

    function handleToggleCategory(id: number) {
        dispatch(toggleCategoryThunk(id));
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
                        Create categories, add sub-services under them, and set base prices.
                    </p>
                </div>

                <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-sm transition shrink-0"
                >
                    <Plus size={16} /> Add New Category
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
                    Categories: <span className="text-slate-900 font-bold">{categories.length}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    Services: <span className="text-slate-900 font-bold">{items.length}</span>
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
            {!loading && visibleCategories.length === 0 && (
                <div className="text-center py-20 text-slate-400 text-sm">
                    No categories found. Try adjusting your search, or add a new category.
                </div>
            )}

            {/* CATEGORY GRID */}
            {!loading && visibleCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleCategories.map((category) => {
                        const services = itemsByCategory.get(category.id) ?? [];
                        const activeCount = services.filter((s) => s.isActive).length;
                        return (
                            <div
                                key={category.id}
                                className={`bg-white rounded-xl border shadow-sm flex flex-col justify-between ${
                                    category.isActive ? "border-slate-200" : "border-slate-200 bg-slate-50/50 opacity-80"
                                }`}
                            >
                                {/* CARD HEADER */}
                                <div className="p-5 border-b border-slate-100 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Layers size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{category.name}</h3>
                                                <span className="text-[10px] text-slate-400">
                                                    {activeCount} of {services.length} service{services.length === 1 ? "" : "s"} active
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleToggleCategory(category.id)}
                                            disabled={togglingCategoryId === category.id}
                                            title={category.isActive ? "Deactivate category" : "Activate category"}
                                            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shrink-0 disabled:opacity-40 ${
                                                category.isActive
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {togglingCategoryId === category.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : category.isActive ? (
                                                <>
                                                    <CheckCircle2 size={12} /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={12} /> Inactive
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* SUBSERVICES LIST */}
                                <div className="p-5 flex-1 space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Wrench size={12} /> Services ({services.length})
                                    </p>

                                    {services.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">No sub-services yet.</p>
                                    ) : (
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
                                                            onClick={() => handleToggleService(service.id)}
                                                            disabled={togglingServiceId === service.id}
                                                            title={service.isActive ? "Deactivate" : "Activate"}
                                                            className={`shrink-0 ${
                                                                service.isActive ? "text-emerald-600" : "text-slate-400"
                                                            } hover:opacity-70 transition disabled:opacity-40`}
                                                        >
                                                            {togglingServiceId === service.id ? (
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
                                    )}
                                </div>

                                {/* CARD FOOTER */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
                                    <button
                                        onClick={() => {
                                            setAddServiceCategoryId(category.id);
                                            setSingleService(emptyRow());
                                        }}
                                        className="text-blue-600 hover:text-blue-700 font-semibold text-xs transition"
                                    >
                                        + Add Service
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ADD NEW CATEGORY MODAL (name + multi-row sub-services) */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="text-blue-600" size={20} /> Add New Category
                            </h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Electrical Services"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-slate-700">Sub-Services</label>
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Row
                                    </button>
                                </div>

                                {subServiceRows.map((row, index) => (
                                    <div
                                        key={index}
                                        className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 font-medium">Service {index + 1}</span>
                                            {subServiceRows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="text-slate-400 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Service name, e.g., Short Circuit Repair"
                                            value={row.subServiceName}
                                            onChange={(e) => updateRow(index, { subServiceName: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        <div className="grid grid-cols-3 gap-2">
                                            <select
                                                value={row.pricingUnit}
                                                onChange={(e) =>
                                                    updateRow(index, { pricingUnit: e.target.value as PricingUnit })
                                                }
                                                className="px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                {PRICING_UNITS.map((u) => (
                                                    <option key={u} value={u}>
                                                        {u.replace("_", " ")}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Base price (NPR)"
                                                value={row.basePrice ?? ""}
                                                onChange={(e) =>
                                                    updateRow(index, {
                                                        basePrice: e.target.value ? Number(e.target.value) : undefined,
                                                    })
                                                }
                                                className="px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration, e.g. 35–45 mins"
                                                value={row.defaultDuration ?? ""}
                                                onChange={(e) => updateRow(index, { defaultDuration: e.target.value })}
                                                className="px-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-slate-400">
                                    Rows with a blank service name are skipped — leave extra rows empty if you don't need them.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
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
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD SERVICE TO EXISTING CATEGORY MODAL */}
            {addServiceCategoryId !== null && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Wrench className="text-blue-600" size={20} /> Add Service
                            </h3>
                            <button
                                onClick={() => setAddServiceCategoryId(null)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddServiceToCategory} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Service Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Ceiling Fan Installation"
                                    value={singleService.subServiceName}
                                    onChange={(e) =>
                                        setSingleService((s) => ({ ...s, subServiceName: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Pricing Unit *</label>
                                    <select
                                        value={singleService.pricingUnit}
                                        onChange={(e) =>
                                            setSingleService((s) => ({
                                                ...s,
                                                pricingUnit: e.target.value as PricingUnit,
                                            }))
                                        }
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
                                        value={singleService.basePrice ?? ""}
                                        onChange={(e) =>
                                            setSingleService((s) => ({
                                                ...s,
                                                basePrice: e.target.value ? Number(e.target.value) : undefined,
                                            }))
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Default Duration</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 35–45 mins"
                                    value={singleService.defaultDuration ?? ""}
                                    onChange={(e) =>
                                        setSingleService((s) => ({ ...s, defaultDuration: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAddServiceCategoryId(null)}
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
                                    Add Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}