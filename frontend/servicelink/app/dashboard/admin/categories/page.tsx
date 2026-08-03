"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Layers,
    Wrench,
    CheckCircle2,
    XCircle,
    Percent,
} from "lucide-react";

interface SubService {
    id: string;
    name: string;
    basePriceNpr: number;
    isActive: boolean;
}

interface Category {
    id: string;
    name: string;
    description: string;
    commissionRate: number; // percentage
    isActive: boolean;
    services: SubService[];
}

const INITIAL_CATEGORIES: Category[] = [
    {
        id: "CAT-01",
        name: "Electrical Services",
        description: "Wiring, appliance repair, and electrical installations.",
        commissionRate: 10,
        isActive: true,
        services: [
            { id: "SRV-101", name: "Short Circuit Repair", basePriceNpr: 800, isActive: true },
            { id: "SRV-102", name: "Full House Wiring Inspection", basePriceNpr: 2500, isActive: true },
        ],
    },
    {
        id: "CAT-02",
        name: "Plumbing & Sanitation",
        description: "Pipe fittings, leakage repair, and sanitary fixtures.",
        commissionRate: 12,
        isActive: true,
        services: [
            { id: "SRV-201", name: "Pipe Leakage Fixing", basePriceNpr: 600, isActive: true },
            { id: "SRV-202", name: "Water Tank Cleaning", basePriceNpr: 3500, isActive: true },
        ],
    },
    {
        id: "CAT-03",
        name: "Home Cleaning & Hygiene",
        description: "Deep home cleaning, sofa cleaning, and carpet sanitization.",
        commissionRate: 15,
        isActive: false,
        services: [
            { id: "SRV-301", name: "3BHK Deep Cleaning", basePriceNpr: 8000, isActive: true },
        ],
    },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Category Form State
    const [newCatName, setNewCatName] = useState("");
    const [newCatDesc, setNewCatDesc] = useState("");
    const [newCatCommission, setNewCatCommission] = useState("10");

    const filteredCategories = categories.filter(
        (cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleCategory = (id: string) => {
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        const newCategory: Category = {
            id: `CAT-0${categories.length + 1}`,
            name: newCatName,
            description: newCatDesc,
            commissionRate: Number(newCatCommission) || 10,
            isActive: true,
            services: [],
        };

        setCategories([...categories, newCategory]);
        setIsModalOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        setNewCatCommission("10");
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories &amp; Services</h1>
                    <p className="text-sm text-slate-500">
                        Configure marketplace service categories, base rates, and platform commission fees.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
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
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="text-xs text-slate-500 font-medium">
                    Total Categories: <span className="text-slate-900 font-bold">{categories.length}</span>
                </div>
            </div>

            {/* CATEGORY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                    <div
                        key={category.id}
                        className={`bg-white rounded-xl border transition shadow-sm flex flex-col justify-between ${
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
                                        <span className="text-[10px] font-mono text-slate-400">{category.id}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggleCategory(category.id)}
                                    title={category.isActive ? "Deactivate Category" : "Activate Category"}
                                    className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                                        category.isActive
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {category.isActive ? (
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

                            <p className="text-xs text-slate-500 line-clamp-2">{category.description}</p>

                            {/* COMMISSION BADGE */}
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium">
                                <Percent size={12} /> Commission Fee: {category.commissionRate}%
                            </div>
                        </div>

                        {/* SUBSERVICES LIST */}
                        <div className="p-5 flex-1 space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={12} /> Included Services ({category.services.length})
                            </p>

                            {category.services.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No sub-services configured yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {category.services.map((service) => (
                                        <li
                                            key={service.id}
                                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                                        >
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">
                        {service.name}
                      </span>
                                            <span className="font-mono text-slate-900 font-semibold">
                        NPR {service.basePriceNpr.toLocaleString()}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* CARD FOOTER */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs">
                            <button
                                onClick={() => alert(`Edit category: ${category.name}`)}
                                className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1 transition"
                            >
                                <Edit2 size={14} /> Edit Category
                            </button>

                            <button
                                onClick={() => alert(`Managing sub-services for: ${category.name}`)}
                                className="text-blue-600 hover:text-blue-700 font-semibold transition"
                            >
                                + Manage Services
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE CATEGORY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="text-blue-600" size={20} /> Create New Category
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Home Carpentry & Furniture"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief summary of services provided..."
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Platform Commission Fee (%) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={newCatCommission}
                                    onChange={(e) => setNewCatCommission(e.target.value)}
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
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                                >
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}