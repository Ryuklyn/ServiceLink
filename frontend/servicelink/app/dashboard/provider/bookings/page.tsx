"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    SlidersHorizontal, Calendar, Clock, MapPin, Mail, Phone, Copy, Play,
    MessageCircle, PhoneCall, CheckCircle, XCircle, Wrench, ArrowRight,
    ArrowLeft, Pause, ChevronDown, Loader2, Search as SearchIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchProviderBookings,
    fetchProviderBookingDetail,
    updateBookingStatus,
    BackendAppointmentStatus,
} from "@/store/slices/providerBookingsSlice";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * DATA-SHAPE NOTE (read this before touching fields below)
 * ─────────────────────────────────────────────────────────────────────────
 * This page renders ONLY fields that actually exist on
 * `AppointmentSummaryDTO` / `AppointmentResponseDTO` on the backend:
 *   customerName, customerPhone, customerEmail (detail only),
 *   customerProfilePictureUrl, address, subServiceName, totalPrice,
 *   appointmentDate, timeSlot, notes, attachments, cancellationReason.
 *
 * Fields the old static mock showed — Member Since, Landmark, Distance —
 * do NOT exist anywhere in AppointmentMapper/AppointmentResponseDTO, so
 * they've been intentionally dropped rather than faked. To bring them
 * back for real:
 *   - Member Since  → needs User.createdAt exposed via a customer-summary
 *                     endpoint (not appointment-scoped)
 *   - Landmark      → needs a new `landmark` column on Appointment +
 *                     AppointmentMapper/DTO field
 *   - Distance      → needs geo lookup (provider location vs appointment
 *                     address), not stored today
 *
 * "Bookings with this customer" IS shown, but computed client-side from
 * the already-loaded `items` list (matched by customerPhone), since no
 * backend aggregate exists for it yet.
 *
 * The stepper is 4 steps (Pending → Confirmed → In Progress → Completed)
 * because `AppointmentStatus` has no separate "On the Way" state — only
 * PENDING/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED. "Confirmed" is
 * labeled "Accepted" here purely for copy parity with the design, the
 * underlying status is still CONFIRMED.
 * ─────────────────────────────────────────────────────────────────────────
 */

type SortKey = "newest" | "oldest" | "earnings";

const statusLabel = (s: BackendAppointmentStatus): string => {
    if (s === "CONFIRMED") return "Accepted";
    return s.replace(/_/g, " ");
};

const statusBadgeStyle = (s: BackendAppointmentStatus): string => {
    switch (s) {
        case "PENDING": return "bg-orange-50 text-orange-500 border border-orange-200";
        case "CONFIRMED": return "bg-blue-50 text-blue-700 border border-blue-200";
        case "IN_PROGRESS": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
        case "COMPLETED": return "bg-green-50 text-green-700 border border-green-200";
        case "CANCELLED": return "bg-red-50 text-red-500 border border-red-200";
        default: return "bg-gray-100 text-gray-600";
    }
};

const groupLabelColor = (s: string): string => {
    switch (s) {
        case "PENDING": return "#e8683f";
        case "CONFIRMED": return "#1e40af";
        case "IN_PROGRESS": return "#4f46e5";
        case "COMPLETED": return "#16a34a";
        case "CANCELLED": return "#dc2626";
        default: return "#6b7280";
    }
};

const TAB_FILTERS = [
    { label: "All", key: "ALL" },
    { label: "Pending", key: "PENDING" },
    { label: "Accepted", key: "CONFIRMED" },
    { label: "In Progress", key: "IN_PROGRESS" },
    { label: "Completed", key: "COMPLETED" },
    { label: "Cancelled", key: "CANCELLED" },
];

const SORT_OPTIONS: { label: string; key: SortKey }[] = [
    { label: "Newest First", key: "newest" },
    { label: "Oldest First", key: "oldest" },
    { label: "Highest Earnings", key: "earnings" },
];

const TIME_SLOT_LABELS: Record<string, { label: string; range: string }> = {
    MORNING: { label: "Morning", range: "8:00 AM - 12:00 PM" },
    AFTERNOON: { label: "Afternoon", range: "12:00 PM - 4:00 PM" },
    EVENING: { label: "Evening", range: "4:00 PM - 8:00 PM" },
};

function initialsOf(name?: string | null): string {
    if (!name?.trim()) return "?";
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatDate(iso: string): { display: string; weekday: string } {
    const d = new Date(`${iso}T00:00:00`);
    return {
        display: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    };
}

const steps = [
    { statuses: ["PENDING"] as BackendAppointmentStatus[], label: "Pending", sub: "Request received", icon: <Clock size={16} /> },
    { statuses: ["CONFIRMED"] as BackendAppointmentStatus[], label: "Accepted", sub: "Job accepted", icon: <CheckCircle size={16} /> },
    { statuses: ["IN_PROGRESS"] as BackendAppointmentStatus[], label: "In Progress", sub: "Work underway", icon: <Wrench size={16} /> },
    { statuses: ["COMPLETED"] as BackendAppointmentStatus[], label: "Completed", sub: "Job completed", icon: <CheckCircle size={16} /> },
];

export default function BookingsPage() {
    const dispatch = useAppDispatch();
    const { items, listStatus, detailsById, detailStatus, updatingId, error } = useAppSelector(
        (s) => s.providerBookings,
    );

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("newest");
    const [mobileView, setMobileView] = useState<"list" | "detail">("list");

    const [lightbox, setLightbox] = useState<{ type: "image" | "video"; src?: string } | null>(null);
    const [playingAudio, setPlayingAudio] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        dispatch(fetchProviderBookings());
    }, [dispatch]);

    // Auto-select first item once the list loads
    useEffect(() => {
        if (!selectedId && items.length > 0) setSelectedId(items[0].id);
    }, [items, selectedId]);

    // Fetch full detail (notes, attachments, customer email, etc.) whenever selection changes
    useEffect(() => {
        if (selectedId != null && !detailsById[selectedId]) {
            dispatch(fetchProviderBookingDetail(selectedId));
        }
    }, [selectedId, detailsById, dispatch]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (playingAudio) audioRef.current.pause(); else audioRef.current.play();
        setPlayingAudio(!playingAudio);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const update = () => setAudioProgress((audio.currentTime / audio.duration) * 100 || 0);
        audio.addEventListener("timeupdate", update);
        return () => audio.removeEventListener("timeupdate", update);
    }, [selectedId]);

    const counts: Record<string, number> = {
        ALL: items.length,
        PENDING: items.filter((b) => b.status === "PENDING").length,
        CONFIRMED: items.filter((b) => b.status === "CONFIRMED").length,
        IN_PROGRESS: items.filter((b) => b.status === "IN_PROGRESS").length,
        COMPLETED: items.filter((b) => b.status === "COMPLETED").length,
        CANCELLED: items.filter((b) => b.status === "CANCELLED").length,
    };

    // Search across customer name, service, address and booking ID
    const searched = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q === "") return items;
        return items.filter((b) => {
            return (
                b.customerName?.toLowerCase().includes(q) ||
                b.subServiceName?.toLowerCase().includes(q) ||
                b.address?.toLowerCase().includes(q) ||
                `bk-${b.id}`.includes(q) ||
                String(b.id).includes(q)
            );
        });
    }, [items, search]);

    const filtered = useMemo(() => {
        return activeFilter === "ALL" ? searched : searched.filter((b) => b.status === activeFilter);
    }, [searched, activeFilter]);

    // Working sort: newest/oldest by appointment date, or highest earnings by price
    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) => {
            if (sortKey === "earnings") {
                return (b.totalPrice ?? 0) - (a.totalPrice ?? 0);
            }
            const dateA = new Date(`${a.appointmentDate}T00:00:00`).getTime();
            const dateB = new Date(`${b.appointmentDate}T00:00:00`).getTime();
            return sortKey === "newest" ? dateB - dateA : dateA - dateB;
        });
        return list;
    }, [filtered, sortKey]);

    const groups = (["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as BackendAppointmentStatus[])
        .map((status) => ({ groupLabel: status, items: sorted.filter((b) => b.status === status) }))
        .filter((g) => g.items.length > 0);

    const selectedSummary = items.find((b) => b.id === selectedId);
    const selectedDetail = selectedId != null ? detailsById[selectedId] : undefined;

    // Client-side proxy for "total bookings with this customer" — there is
    // no backend aggregate for this yet, so we count matches in the
    // provider's already-loaded list, keyed by phone number.
    const bookingsWithCustomer = useMemo(() => {
        if (!selectedSummary?.customerPhone) return null;
        return items.filter((b) => b.customerPhone === selectedSummary.customerPhone).length;
    }, [items, selectedSummary]);

    const doTransition = (status: BackendAppointmentStatus, reason?: string) => {
        if (selectedId == null) return;
        dispatch(updateBookingStatus({ id: selectedId, status, reason }));
    };

    const handleSelectBooking = (id: number) => {
        setSelectedId(id);
        setMobileView("detail"); // on mobile, jump straight to the detail pane
    };

    const waLink = selectedSummary
        ? `https://wa.me/977${selectedSummary.customerPhone ?? ""}?text=${encodeURIComponent(
            `Hello ${selectedSummary.customerName}, regarding your booking BK-${selectedSummary.id}.`,
        )}`
        : "#";

    if (listStatus === "loading" && items.length === 0) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
                <Loader2 className="animate-spin" size={18} /> Loading bookings…
            </div>
        );
    }

    if (listStatus === "failed" && items.length === 0) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-600 max-w-lg mx-auto mt-10">
                Couldn&apos;t load bookings: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-5 max-w-[1200px] mx-auto px-3 sm:px-4 lg:px-0">
            {/* Header */}
            <div className="py-3 top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-xs text-gray-400">Manage your service requests and track job progress</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none">
                        <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, service, address, or ID"
                            className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100 w-full sm:w-64"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative flex-1 sm:flex-none">
                        <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className="appearance-none bg-white border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100 cursor-pointer w-full sm:w-auto"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Filter tabs — horizontally scrollable on small screens instead of wrapping awkwardly */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
                {TAB_FILTERS.map(({ label, key }) => (
                    <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                            activeFilter === key ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        style={activeFilter === key ? { backgroundColor: "#1e3a8a" } : {}}
                    >
                        {label}
                        <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeFilter === key ? "bg-white" : "bg-gray-100 text-gray-500"}`}
                            style={activeFilter === key ? { color: "#1e3a8a" } : {}}
                        >
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* LEFT: List — full width & stacked on mobile, hidden once a detail is open on mobile */}
                <div
                    className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-72 lg:flex-shrink-0 space-y-5 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pr-0 lg:pr-1`}
                >
                    {groups.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-12">No bookings found.</div>
                    )}
                    {groups.map(({ groupLabel, items: groupItems }) => (
                        <div key={groupLabel} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                                <p className="text-xs font-bold tracking-wide uppercase" style={{ color: groupLabelColor(groupLabel) }}>
                                    {statusLabel(groupLabel as BackendAppointmentStatus)} ({groupItems.length})
                                </p>
                            </div>
                            <div className="p-2 space-y-2">
                                {groupItems.map((b) => {
                                    const { display, weekday } = formatDate(b.appointmentDate);
                                    return (
                                        <div
                                            key={b.id}
                                            onClick={() => handleSelectBooking(b.id)}
                                            className={`rounded-lg p-2.5 cursor-pointer transition-colors border ${
                                                selectedId === b.id ? "bg-orange-100 border-orange-200" : "border-transparent hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                {b.customerProfilePictureUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={b.customerProfilePictureUrl} alt={b.customerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {initialsOf(b.customerName)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-1">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{b.customerName}</p>
                                                        <p className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: "#e8683f" }}>
                                                            Rs. {(b.totalPrice ?? 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{b.subServiceName}</p>
                                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                                                        <Calendar size={10} /> {display} · {weekday}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1.5 gap-2">
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 truncate min-w-0">
                                                            <MapPin size={10} className="flex-shrink-0" /> <span className="truncate">{b.address}</span>
                                                        </div>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${statusBadgeStyle(b.status)}`}>
                                                            {statusLabel(b.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Detail — hidden on mobile until a booking is picked */}
                <div className={`${mobileView === "detail" ? "block" : "hidden"} lg:block flex-1 min-w-0 w-full`}>
                    {!selectedSummary ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 sm:p-16 text-center text-gray-400 text-sm">
                            Select a booking to view details.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Mobile back button */}
                            <button
                                onClick={() => setMobileView("list")}
                                className="lg:hidden flex items-center gap-1.5 px-4 pt-4 text-sm font-semibold text-gray-500"
                            >
                                <ArrowLeft size={15} /> Back to bookings
                            </button>

                            {/* Stepper */}
                            <div className="px-3 sm:px-6 py-5 overflow-x-auto">
                                <div className="flex items-center justify-between min-w-[420px] sm:min-w-0">
                                    {steps.map((step, i) => {
                                        const currentIdx = steps.findIndex((s) => s.statuses.includes(selectedSummary.status));
                                        const isActive = i === currentIdx;
                                        const isDone = i < currentIdx;
                                        return (
                                            <div key={step.label} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 border-2 ${
                                                        isDone ? "border-blue-700 bg-blue-700" : isActive ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50"
                                                    }`}>
                                                        <span className={isDone ? "text-white" : isActive ? "text-orange-500" : "text-gray-400"}>{step.icon}</span>
                                                    </div>
                                                    <p className={`text-[11px] sm:text-xs font-semibold text-center leading-tight ${isActive ? "text-orange-500" : isDone ? "text-blue-700" : "text-gray-400"}`}>
                                                        {step.label}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 text-center hidden sm:block">{step.sub}</p>
                                                </div>
                                                {i < steps.length - 1 && (
                                                    <div className="flex items-center justify-center mb-8 px-1 sm:px-2">
                                                        <span className={isDone ? "text-blue-500" : "text-gray-300"}><ArrowRight size={16} /></span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Customer info */}
                            <div className="px-4 sm:px-6 py-5 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {selectedSummary.customerProfilePictureUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={selectedSummary.customerProfilePictureUrl}
                                                alt={selectedSummary.customerName}
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-90"
                                                onClick={() => setLightbox({ type: "image", src: selectedSummary.customerProfilePictureUrl! })}
                                            />
                                        ) : (
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-base sm:text-lg font-bold flex-shrink-0">
                                                {initialsOf(selectedSummary.customerName)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                {/* Full customer name — comes straight from AppointmentSummaryDTO.customerName */}
                                                <h2 className="text-base sm:text-lg font-bold text-gray-900 break-words">{selectedSummary.customerName}</h2>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadgeStyle(selectedSummary.status)}`}>
                                                    {statusLabel(selectedSummary.status)}
                                                </span>
                                            </div>
                                            {detailStatus === "loading" && !selectedDetail ? (
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Loader2 size={11} className="animate-spin" /> Loading contact info…</p>
                                            ) : (
                                                <>
                                                    {selectedDetail?.customerEmail && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                                                            <Mail size={13} /> <span className="break-all">{selectedDetail.customerEmail}</span>
                                                        </div>
                                                    )}
                                                    {selectedSummary.customerPhone && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                            <Phone size={13} /> {selectedSummary.customerPhone}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto flex sm:block items-center justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                                        <div>
                                            <p className="text-xs text-gray-400">Booking ID</p>
                                            <div className="flex items-center gap-1 sm:justify-end">
                                                <p className="text-sm font-bold text-gray-800">BK-{selectedSummary.id}</p>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(`BK-${selectedSummary.id}`)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mt-0 sm:mt-2">Service Amount</p>
                                            <p className="text-lg sm:text-xl font-bold" style={{ color: "#e8683f" }}>
                                                Rs. {(selectedSummary.totalPrice ?? 0).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 hidden sm:block">Pay after service</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule bar */}
                            <div className="px-4 sm:px-6 pb-5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-100 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0" style={{ backgroundColor: "#fff7f4" }}>
                                            <Calendar size={15} style={{ color: "#e8683f" }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{formatDate(selectedSummary.appointmentDate).display}</p>
                                            <p className="text-xs text-gray-400">{formatDate(selectedSummary.appointmentDate).weekday}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0" style={{ backgroundColor: "#fff7f4" }}>
                                            <Clock size={15} style={{ color: "#e8683f" }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{TIME_SLOT_LABELS[selectedSummary.timeSlot]?.range}</p>
                                            <p className="text-xs text-gray-400">{TIME_SLOT_LABELS[selectedSummary.timeSlot]?.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0" style={{ backgroundColor: "#fff7f4" }}>
                                            <MapPin size={15} style={{ color: "#e8683f" }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{selectedSummary.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Services + Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-gray-100">
                                <div className="p-4 sm:p-6 md:border-r border-gray-100 border-b md:border-b-0">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Service Requested</h3>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3"
                                          style={{ borderColor: "#bbf7d0", color: "#16a34a", backgroundColor: "#f0fdf4" }}>
                                        {selectedSummary.subServiceName}
                                    </span>

                                    {detailStatus === "loading" && !selectedDetail ? (
                                        <p className="text-xs text-gray-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading details…</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600 leading-relaxed">{selectedDetail?.notes || "No notes provided."}</p>

                                            {(selectedDetail?.attachedImgUrl || selectedDetail?.attachedVideoUrl) && (
                                                <div className="mt-4">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Attachments</p>
                                                    <div className="flex gap-2">
                                                        {selectedDetail?.attachedImgUrl && (
                                                            <img
                                                                src={selectedDetail.attachedImgUrl}
                                                                alt="attachment"
                                                                onClick={() => setLightbox({ type: "image", src: selectedDetail.attachedImgUrl! })}
                                                                className="w-16 h-14 rounded-lg object-cover cursor-pointer hover:opacity-80"
                                                            />
                                                        )}
                                                        {selectedDetail?.attachedVideoUrl && (
                                                            <div
                                                                onClick={() => setLightbox({ type: "video", src: selectedDetail.attachedVideoUrl! })}
                                                                className="w-16 h-14 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80"
                                                            >
                                                                <Play size={16} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedDetail?.attachedAudioUrl && (
                                                <div className="mt-4">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Customer Note (Voice)</p>
                                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                                        <audio ref={audioRef} src={selectedDetail.attachedAudioUrl} onEnded={() => setPlayingAudio(false)} />
                                                        <button
                                                            onClick={toggleAudio}
                                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                                            style={{ backgroundColor: "#16a34a" }}
                                                        >
                                                            {playingAudio ? <Pause size={10} className="text-white" /> : <Play size={10} className="text-white" />}
                                                        </button>
                                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${audioProgress}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="p-4 sm:p-6 space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Service Address</h3>
                                        <div className="flex items-start gap-2 mb-3">
                                            <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#1e3a8a" }} />
                                            <p className="text-sm text-gray-700 font-medium">{selectedSummary.address}</p>
                                        </div>
                                    </div>

                                    {/* Customer details recap — only fields that actually exist on the DTOs */}
                                    <div className="pt-5 border-t border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Customer Details</h3>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-gray-400 flex-shrink-0">Full Name</span>
                                                <span className="text-gray-700 font-medium text-right">{selectedSummary.customerName}</span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-gray-400 flex-shrink-0">Email</span>
                                                <span className="text-gray-700 font-medium text-right break-all">
                                                    {detailStatus === "loading" && !selectedDetail ? "Loading…" : selectedDetail?.customerEmail ?? "—"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-gray-400 flex-shrink-0">Phone</span>
                                                <span className="text-gray-700 font-medium text-right">{selectedSummary.customerPhone ?? "—"}</span>
                                            </div>
                                            {bookingsWithCustomer != null && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-gray-400 flex-shrink-0">Bookings With You</span>
                                                    <span className="text-gray-700 font-medium text-right">{bookingsWithCustomer}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedDetail?.cancellationReason && (
                                        <div className="pt-5 border-t border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Cancellation Reason</h3>
                                            <p className="text-xs text-gray-500">{selectedDetail.cancellationReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="px-4 sm:px-6 py-5 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                                    <div className="flex flex-wrap gap-3">
                                        {selectedSummary.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => doTransition("CONFIRMED")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 disabled:opacity-50"
                                                    style={{ borderColor: "#16a34a", color: "#16a34a" }}
                                                >
                                                    <CheckCircle size={15} /> Accept Job
                                                </button>
                                                <button
                                                    onClick={() => doTransition("CANCELLED", "Declined by provider")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <XCircle size={15} /> Decline
                                                </button>
                                            </>
                                        )}

                                        {selectedSummary.status === "CONFIRMED" && (
                                            <>
                                                <button
                                                    onClick={() => doTransition("IN_PROGRESS")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                                                    style={{ backgroundColor: "#1e3a8a" }}
                                                >
                                                    <Wrench size={15} /> Start Job
                                                </button>
                                                <button
                                                    onClick={() => doTransition("CANCELLED", "Cancelled by provider")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <XCircle size={15} /> Cancel
                                                </button>
                                            </>
                                        )}

                                        {selectedSummary.status === "IN_PROGRESS" && (
                                            <button
                                                onClick={() => doTransition("COMPLETED")}
                                                disabled={updatingId === selectedSummary.id}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                                                style={{ backgroundColor: "#1e3a8a" }}
                                            >
                                                <CheckCircle size={15} /> Mark Complete
                                            </button>
                                        )}

                                        {selectedSummary.status === "COMPLETED" && (
                                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
                                                <CheckCircle size={15} /> Job Completed Successfully
                                            </div>
                                        )}

                                        {selectedSummary.status === "CANCELLED" && (
                                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-200">
                                                <XCircle size={15} /> Booking Cancelled
                                            </div>
                                        )}
                                    </div>

                                    <div className="sm:ml-auto flex flex-col sm:flex-row gap-2">
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                                            style={{ backgroundColor: "#25D366" }}
                                        >
                                            <MessageCircle size={15} /> WhatsApp
                                        </a>
                                        <a
                                            href={selectedSummary.customerPhone ? `tel:${selectedSummary.customerPhone}` : undefined}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50"
                                        >
                                            <PhoneCall size={15} /> Call
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {lightbox && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setLightbox(null)}>
                            <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                                {lightbox.type === "image" ? (
                                    <img src={lightbox.src} alt="preview" className="w-full h-auto rounded-xl" />
                                ) : (
                                    <video src={lightbox.src} controls autoPlay className="w-full h-auto rounded-xl" />
                                )}
                                <button onClick={() => setLightbox(null)} className="mt-3 mx-auto block px-4 py-2 rounded-lg text-sm font-semibold bg-white text-gray-700">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}