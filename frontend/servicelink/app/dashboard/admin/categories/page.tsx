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
    AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // adjust if your typed hooks live elsewhere
import {
    fetchCategoriesAdmin,
    fetchCatalogAdmin,
    createCategoryWithServicesThunk,
    createCatalogItemThunk,
    updateCategoryThunk,
    updateCatalogItemThunk,
    toggleCatalogItemThunk,
    toggleCategoryThunk,
    deleteCategoryThunk,
    deleteCatalogItemThunk,
    clearCategoriesAdminError,
} from "@/store/slices/categoriesAdminSlice"; // must match the actual file location
import {
    CategoryDTO,
    PricingUnit,
    ServiceCatalogDTO,
    SubServiceInput,
} from "@/store/slices/features/categories/categoriesTypes";

const PRICING_UNITS: PricingUnit[] = ["PER_JOB", "PER_SQFT", "PER_WALL", "PER_ITEM"];

function emptyRow(): SubServiceInput {
    return { subServiceName: "", defaultDuration: "", pricingUnit: "PER_JOB", basePrice: undefined };
}

// What's being confirmed for deletion — a category or a single sub-service.
type DeleteTarget =
    | { kind: "category"; id: number; name: string }
    | { kind: "service"; id: number; categoryId: number; name: string };

export default function CategoriesPage() {
    const dispatch = useAppDispatch();
    const {
        categories,
        items,
        loading,
        saving,
        togglingCategoryId,
        togglingServiceId,
        deletingCategoryId,
        deletingServiceId,
        error,
    } = useAppSelector((state) => state.categoriesAdmin);

    const [searchTerm, setSearchTerm] = useState("");

    // "Add New Category" modal — category name + N sub-service rows
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [subServiceRows, setSubServiceRows] = useState<SubServiceInput[]>([emptyRow()]);

    // "Add Service to existing category" modal
    const [addServiceCategoryId, setAddServiceCategoryId] = useState<number | null>(null);
    const [singleService, setSingleService] = useState<SubServiceInput>(emptyRow());

    // "Edit Category" modal — pre-filled with the clicked category's current name
    const [editCategory, setEditCategory] = useState<CategoryDTO | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    // "Edit Service" modal — pre-filled with the clicked sub-service's current values
    const [editService, setEditService] = useState<ServiceCatalogDTO | null>(null);
    const [editServiceForm, setEditServiceForm] = useState<SubServiceInput>(emptyRow());

    // Shared delete-confirmation dialog target (category or service)
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

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

    // ── Edit category (rename) — pre-filled ─────────────────────────────────

    function openEditCategory(category: CategoryDTO) {
        setEditCategory(category);
        setEditCategoryName(category.name);
    }

    async function handleEditCategory(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editCategory || !editCategoryName.trim()) return;

        const result = await dispatch(
            updateCategoryThunk({
                id: editCategory.id,
                payload: { name: editCategoryName.trim() },
            }),
        );

        if (updateCategoryThunk.fulfilled.match(result)) {
            setEditCategory(null);
        }
    }

    // ── Edit sub-service — pre-filled ───────────────────────────────────────

    function openEditService(service: ServiceCatalogDTO) {
        setEditService(service);
        setEditServiceForm({
            subServiceName: service.subServiceName,
            defaultDuration: service.defaultDuration ?? "",
            pricingUnit: service.pricingUnit,
            basePrice: service.basePrice ?? undefined,
        });
    }

    async function handleEditService(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editService || !editServiceForm.subServiceName.trim()) return;

        const result = await dispatch(
            updateCatalogItemThunk({
                id: editService.id,
                payload: {
                    subServiceName: editServiceForm.subServiceName.trim(),
                    defaultDuration: editServiceForm.defaultDuration?.trim() || undefined,
                    pricingUnit: editServiceForm.pricingUnit,
                    basePrice: editServiceForm.basePrice,
                },
            }),
        );

        if (updateCatalogItemThunk.fulfilled.match(result)) {
            setEditService(null);
        }
    }

    // ── Existing service/category actions ───────────────────────────────────

    function handleToggleService(id: number) {
        dispatch(toggleCatalogItemThunk(id));
    }

    function handleToggleCategory(id: number) {
        dispatch(toggleCategoryThunk(id));
    }

    // ── Delete confirm flow (shared for category + service) ────────────────

    async function handleConfirmDelete() {
        if (!deleteTarget) return;

        if (deleteTarget.kind === "category") {
            const result = await dispatch(deleteCategoryThunk(deleteTarget.id));
            if (deleteCategoryThunk.fulfilled.match(result)) setDeleteTarget(null);
            // on rejection, the error banner shows the reason (e.g. "still has sub-services")
            // and the dialog stays open so the user can cancel deliberately.
        } else {
            const result = await dispatch(
                deleteCatalogItemThunk({ id: deleteTarget.id, categoryId: deleteTarget.categoryId }),
            );
            if (deleteCatalogItemThunk.fulfilled.match(result)) setDeleteTarget(null);
        }
    }

    const isDeleting =
        deleteTarget?.kind === "category"
            ? deletingCategoryId === deleteTarget.id
            : deleteTarget?.kind === "service"
                ? deletingServiceId === deleteTarget.id
                : false;

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
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Layers size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 text-base truncate">
                                                    {category.name}
                                                </h3>
                                                <span className="text-[10px] text-slate-400">
                                                    {activeCount} of {services.length} service{services.length === 1 ? "" : "s"} active
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openEditCategory(category)}
                                                title="Rename category"
                                                className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        kind: "category",
                                                        id: category.id,
                                                        name: category.name,
                                                    })
                                                }
                                                title="Delete category"
                                                className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                            >
                                                <Trash2 size={13} />
                                            </button>
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

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="font-mono text-slate-900 font-semibold mr-1">
                                                            NPR {(service.basePrice ?? 0).toLocaleString()}
                                                        </span>
                                                        <button
                                                            onClick={() => openEditService(service)}
                                                            title="Edit service"
                                                            className="text-slate-400 hover:text-blue-600 transition"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteTarget({
                                                                    kind: "service",
                                                                    id: service.id,
                                                                    categoryId: service.categoryId,
                                                                    name: service.subServiceName,
                                                                })
                                                            }
                                                            title="Delete service"
                                                            className="text-slate-400 hover:text-red-600 transition"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
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

            {/* EDIT CATEGORY MODAL — pre-filled */}
            {editCategory && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Edit2 className="text-blue-600" size={20} /> Edit Category
                            </h3>
                            <button
                                onClick={() => setEditCategory(null)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditCategory} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditCategory(null)}
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT SERVICE MODAL — pre-filled */}
            {editService && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Wrench className="text-blue-600" size={20} /> Edit Service
                            </h3>
                            <button
                                onClick={() => setEditService(null)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditService} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">Service Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editServiceForm.subServiceName}
                                    onChange={(e) =>
                                        setEditServiceForm((s) => ({ ...s, subServiceName: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">Pricing Unit *</label>
                                    <select
                                        value={editServiceForm.pricingUnit}
                                        onChange={(e) =>
                                            setEditServiceForm((s) => ({
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
                                        value={editServiceForm.basePrice ?? ""}
                                        onChange={(e) =>
                                            setEditServiceForm((s) => ({
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
                                    value={editServiceForm.defaultDuration ?? ""}
                                    onChange={(e) =>
                                        setEditServiceForm((s) => ({ ...s, defaultDuration: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditService(null)}
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION — shared for category + service */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Delete {deleteTarget.kind === "category" ? "category" : "service"}?
                            </h3>
                        </div>

                        <p className="text-sm text-slate-600">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-slate-900">"{deleteTarget.name}"</span>? This can't
                            be undone.
                            {deleteTarget.kind === "category" && (
                                <>
                                    {" "}
                                    Categories that still have sub-services can't be deleted — remove or move those
                                    first.
                                </>
                            )}
                            {deleteTarget.kind === "service" && (
                                <>
                                    {" "}
                                    Services currently offered by a provider can't be deleted — deactivate them
                                    instead.
                                </>
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}