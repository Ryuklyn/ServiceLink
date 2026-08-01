"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    SlidersHorizontal, Calendar, Clock, MapPin, Mail, Phone, Copy, Play,
    PhoneCall, CheckCircle, XCircle, Wrench, ArrowRight,
    ArrowLeft, Pause, ChevronDown, Loader2, Search as SearchIcon, RefreshCcw,
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
 *
 * ── RESCHEDULE FIELDS (NOT YET ON THE BACKEND) ──────────────────────────
 * The reschedule-aware UI below (badges, before/after banner, contextual
 * Approve/Decline copy, dedicated "Rescheduled" list section) reads three
 * optional fields that do NOT exist on AppointmentSummaryDTO /
 * AppointmentResponseDTO today:
 *   - previousAppointmentDate?: string | null   (yyyy-MM-dd, pre-reschedule)
 *   - previousTimeSlot?: string | null          (MORNING/AFTERNOON/EVENING, pre-reschedule)
 *   - rescheduledAt?: string | null             (ISO timestamp, for display/sort if needed)
 * Until the backend/DTO/mapper populate these on a rescheduled appointment,
 * `wasRescheduled()` below always returns false and this UI simply never
 * renders — it degrades gracefully rather than guessing. Cast to `any` is
 * used at the read sites specifically because these fields aren't in the
 * current generated/shared type from providerBookingsSlice.
 *
 * ── WHATSAPP / CALL (see also: the WhatsAppIcon component below) ────────
 * These two actions are gated ONLY on `customerPhone` being present on the
 * record — there is no per-user allowlist, ID check, or role restriction
 * anywhere in this file. If a booking is missing `customerPhone` (as some
 * seed/test records are), both buttons render in a disabled, non-clickable
 * state with a tooltip rather than disappearing, so the layout stays
 * consistent across every card and the customer header regardless of
 * whether that particular record has a phone number on file.
 * ─────────────────────────────────────────────────────────────────────────
 */

type SortKey = "newest" | "oldest" | "earnings";

// ── Brand / trademark colors — single source of truth ──────────────────
// Everything that used to reach for a random Tailwind color (amber, indigo,
// green, red, etc.) now pulls from these two so the whole page stays on-brand.
//
// NOTE: this constant only covers usages that go through inline `style={}}`
// (JS values). A handful of spots — the reschedule banner/badges — use
// Tailwind ARBITRARY VALUE classes instead, e.g. `bg-[#1e3a8a]/10`,
// `text-[#1e3a8a]`, `border-[#1e3a8a]/20`. Tailwind's JIT compiler needs a
// static string literal at build time to generate those classes, so they
// CANNOT reference `BRAND.navy` via template literals (`bg-[${BRAND.navy}]`
// will not work). If BRAND.navy ever changes, those class strings must be
// updated by hand — search for `1e3a8a` in className props.
const BRAND = {
    navy: "#1e3a8a",
    orange: "#e8683f",
};

// Real WhatsApp glyph as inline SVG (currentColor-based, sized via prop)
// instead of lucide's generic MessageCircle bubble — reads as WhatsApp at
// a glance instead of "some chat icon."
function WhatsAppIcon({ size = 13 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.49 3.66 1.42 5.25L2 22l4.98-1.31a9.87 9.87 0 0 0 5.06 1.38h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.14a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.23-8.25 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
        </svg>
    );
}

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

// Only your two trademark colors from here on — orange marks "not yet
// actioned" (pending), navy marks everything that's moved past that.
const groupLabelColor = (s: string): string => {
    switch (s) {
        case "PENDING": return BRAND.orange;
        default: return BRAND.navy;
    }
};

const TAB_FILTERS = [
    { label: "All", key: "ALL" },
    { label: "Rescheduled", key: "RESCHEDULED" },
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

// See the "RESCHEDULE FIELDS" note in the header comment — this reads
// optional fields the backend doesn't expose yet, so it's a no-op (always
// false) until previousAppointmentDate/previousTimeSlot are added upstream.
function wasRescheduled(b: Record<string, any> | undefined | null): boolean {
    if (!b) return false;
    return Boolean(b.previousAppointmentDate || b.previousTimeSlot);
}

function whatsappHref(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
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
        RESCHEDULED: items.filter(wasRescheduled).length,
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
        if (activeFilter === "ALL") return searched;
        if (activeFilter === "RESCHEDULED") return searched.filter(wasRescheduled);
        return searched.filter((b) => b.status === activeFilter);
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

    // Regular status groups (Pending / Accepted / In Progress / Completed / Cancelled)
    const statusGroups = useMemo(
        () =>
            (["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as BackendAppointmentStatus[])
                .map((status) => ({
                    key: status as string,
                    label: statusLabel(status),
                    color: groupLabelColor(status),
                    items: sorted.filter((b) => b.status === status),
                }))
                .filter((g) => g.items.length > 0),
        [sorted],
    );

    // Standalone "Rescheduled" mini-section — same card treatment as
    // Accepted/Completed, shown separately from (and in addition to) the
    // normal status group a rescheduled booking still belongs to.
    const rescheduledGroup = useMemo(() => {
        const rItems = sorted.filter(wasRescheduled);
        return rItems.length > 0
            ? { key: "RESCHEDULED", label: "Rescheduled", color: BRAND.navy, items: rItems }
            : null;
    }, [sorted]);

    const groups = useMemo(() => {
        if (activeFilter === "RESCHEDULED") return rescheduledGroup ? [rescheduledGroup] : [];
        if (activeFilter === "ALL") return rescheduledGroup ? [rescheduledGroup, ...statusGroups] : statusGroups;
        return statusGroups;
    }, [activeFilter, statusGroups, rescheduledGroup]);

    const selectedSummary = items.find((b) => b.id === selectedId);
    const selectedDetail = selectedId != null ? detailsById[selectedId] : undefined;
    const selectedRescheduled = wasRescheduled(selectedSummary);

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

            {/* Filter tabs — horizontally scrollable on small screens instead of wrapping awkwardly.
                All active tabs share the same brand navy so the row reads as one consistent set. */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
                {TAB_FILTERS.map(({ label, key }) => (
                    <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                            activeFilter === key ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        style={activeFilter === key ? { backgroundColor: BRAND.navy } : {}}
                    >
                        {key === "RESCHEDULED" && <RefreshCcw size={12} />}
                        {label}
                        <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeFilter === key ? "bg-white" : "bg-gray-100 text-gray-500"}`}
                            style={activeFilter === key ? { color: BRAND.navy } : {}}
                        >
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* LEFT: List — full width & stacked on mobile, hidden once a detail is open on mobile.
                    space-y-6 (not -5) so full-height group cards — especially now that every card can
                    carry a WhatsApp row — get visible breathing room between sections, most noticeable
                    on the "All" tab where every group renders back to back. */}
                <div
                    className={`${mobileView === "list" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-72 lg:flex-shrink-0 space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pr-0 lg:pr-1`}
                >
                    {groups.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-12">No bookings found.</div>
                    )}
                    {groups.map(({ key, label, color, items: groupItems }) => (
                        // NOTE: no `overflow-hidden` on this wrapper anymore — it was clipping cards
                        // that render taller than the group's initial layout pass (e.g. once the
                        // WhatsApp row below is added, or on the "All" tab where several groups stack).
                        // `overflow-hidden` was only ever needed to keep the header's rounded corners
                        // clean, so that's handled directly on the header/footer elements instead.
                        <div key={key} className="w-full bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="px-4 pt-4 pb-2 border-b border-gray-100 rounded-t-xl">
                                <p className="text-xs font-bold tracking-wide uppercase flex items-center gap-1" style={{ color }}>
                                    {key === "RESCHEDULED" && <RefreshCcw size={11} />}
                                    {label} ({groupItems.length})
                                </p>
                            </div>
                            <div className="p-2 pb-3 space-y-2 rounded-b-xl">
                                {groupItems.map((b: any) => {
                                    const { display, weekday } = formatDate(b.appointmentDate);
                                    const rescheduled = wasRescheduled(b);
                                    return (
                                        <div
                                            key={b.id}
                                            onClick={() => handleSelectBooking(b.id)}
                                            className={`w-full rounded-lg p-2.5 cursor-pointer transition-colors border ${
                                                selectedId === b.id
                                                    ? "bg-orange-100 border-orange-200"
                                                    : rescheduled
                                                        ? "border-[#1e3a8a]/20 bg-[#1e3a8a]/5 hover:bg-[#1e3a8a]/10"
                                                        : "border-transparent hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5 w-full">
                                                {b.customerProfilePictureUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={b.customerProfilePictureUrl} alt={b.customerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: BRAND.navy }}>
                                                        {initialsOf(b.customerName)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-1">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{b.customerName}</p>
                                                        <p className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: BRAND.orange }}>
                                                            Rs. {(b.totalPrice ?? 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{b.subServiceName}</p>

                                                    {rescheduled && (
                                                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-[#1e3a8a] bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 px-1.5 py-0.5 rounded-full">
                                                            <RefreshCcw size={9} /> {b.status === "PENDING" ? "Awaiting your approval" : "Rescheduled"}
                                                        </span>
                                                    )}

                                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                                                        <Calendar size={10} /> {display} · {weekday}
                                                    </div>
                                                    {/* flex-wrap so the status pill drops to its own line instead of
                                                        getting clipped by the card's edge on narrower widths */}
                                                    <div className="flex items-center justify-between mt-1.5 gap-2 flex-wrap">
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 truncate min-w-0 max-w-[60%]">
                                                            <MapPin size={10} className="flex-shrink-0" /> <span className="truncate">{b.address}</span>
                                                        </div>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap ${statusBadgeStyle(b.status)}`}>
                                                            {statusLabel(b.status)}
                                                        </span>
                                                    </div>

                                                    {/* WhatsApp — lives in the shared card loop, so it renders on
                                                        every card in every group (Rescheduled, Pending, Accepted,
                                                        In Progress, Completed, Cancelled) and therefore on "All" too,
                                                        regardless of which customer/booking it is. Gated ONLY on
                                                        customerPhone existing on the record — no ID allowlist.
                                                        When there's no phone on file it renders disabled instead of
                                                        disappearing, so cards stay visually consistent.
                                                        stopPropagation so tapping it doesn't also select the card. */}
                                                    {b.customerPhone ? (
                                                        <a
                                                            href={whatsappHref(
                                                                b.customerPhone,
                                                                `Hello ${b.customerName}, regarding your booking BK-${b.id}.`
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-white px-2.5 py-1 rounded-full w-fit"
                                                            style={{ backgroundColor: "#25D366" }}
                                                        >
                                                            <WhatsAppIcon size={11} /> WhatsApp
                                                        </a>
                                                    ) : (
                                                        <span
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="No phone number on file"
                                                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full w-fit cursor-not-allowed"
                                                        >
                                                            <WhatsAppIcon size={11} /> WhatsApp
                                                        </span>
                                                    )}
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
                                                    <div
                                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 border-2"
                                                        style={
                                                            isDone
                                                                ? { borderColor: BRAND.navy, backgroundColor: BRAND.navy }
                                                                : isActive
                                                                    ? { borderColor: BRAND.orange, backgroundColor: "#fff7f4" }
                                                                    : {}
                                                        }
                                                    >
                                                        <span
                                                            style={
                                                                isDone
                                                                    ? { color: "#fff" }
                                                                    : isActive
                                                                        ? { color: BRAND.orange }
                                                                        : { color: "#9ca3af" }
                                                            }
                                                        >
                                                            {step.icon}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="text-[11px] sm:text-xs font-semibold text-center leading-tight"
                                                        style={isActive ? { color: BRAND.orange } : isDone ? { color: BRAND.navy } : { color: "#9ca3af" }}
                                                    >
                                                        {step.label}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 text-center hidden sm:block">{step.sub}</p>
                                                </div>
                                                {i < steps.length - 1 && (
                                                    <div className="flex items-center justify-center mb-8 px-1 sm:px-2">
                                                        <span style={isDone ? { color: BRAND.navy } : { color: "#d1d5db" }}><ArrowRight size={16} /></span>
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
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white flex items-center justify-center text-base sm:text-lg font-bold flex-shrink-0" style={{ backgroundColor: BRAND.navy }}>
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
                                                {selectedRescheduled && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20">
                                                        <RefreshCcw size={11} /> Rescheduled
                                                    </span>
                                                )}
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

                                            {/* WhatsApp + Call — always visible in the customer header, for every
                                                booking regardless of status (Pending, Accepted, In Progress,
                                                Completed, Cancelled, Rescheduled) and regardless of which customer
                                                it is — gated only on customerPhone being present, not any ID.
                                                Each button independently falls back to a disabled state (rather
                                                than disappearing) when customerPhone is missing on that record. */}
                                            <div className="flex items-center gap-2 mt-2.5">
                                                {selectedSummary.customerPhone ? (
                                                    <a
                                                        href={whatsappHref(
                                                            selectedSummary.customerPhone,
                                                            `Hello ${selectedSummary.customerName}, regarding your booking BK-${selectedSummary.id}.`
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                                                        style={{ backgroundColor: "#25D366" }}
                                                    >
                                                        <WhatsAppIcon size={13} />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                ) : (
                                                    <span
                                                        title="No phone number on file"
                                                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                                                    >
                                                        <WhatsAppIcon size={13} />
                                                        <span>WhatsApp</span>
                                                    </span>
                                                )}
                                                {selectedSummary.customerPhone ? (
                                                    <a
                                                        href={`tel:${selectedSummary.customerPhone}`}
                                                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                                                        style={{ borderColor: BRAND.navy, color: BRAND.navy }}
                                                    >
                                                        <PhoneCall size={13} />
                                                        <span>Call</span>
                                                    </a>
                                                ) : (
                                                    <span
                                                        title="No phone number on file"
                                                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border text-gray-400 border-gray-200 cursor-not-allowed"
                                                    >
                                                        <PhoneCall size={13} />
                                                        <span>Call</span>
                                                    </span>
                                                )}
                                            </div>
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
                                            <p className="text-lg sm:text-xl font-bold" style={{ color: BRAND.orange }}>
                                                Rs. {(selectedSummary.totalPrice ?? 0).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 hidden sm:block">Pay after service</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reschedule before/after banner — only renders once the backend
                                exposes previousAppointmentDate/previousTimeSlot (see header note) */}
                            {selectedRescheduled && (
                                <div className="px-4 sm:px-6 pb-5">
                                    <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded-xl p-3.5 sm:p-4 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 flex items-center justify-center shrink-0">
                                            <RefreshCcw size={14} className="text-[#1e3a8a]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-[#1e3a8a] mb-1.5">
                                                {selectedSummary.status === "PENDING"
                                                    ? "Customer requested a new time — needs your approval"
                                                    : "This booking's time was changed by the customer"}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                {(selectedSummary as any).previousAppointmentDate && (
                                                    <span className="text-[#1e3a8a]/50 line-through font-medium">
                                                        {formatDate((selectedSummary as any).previousAppointmentDate).display}
                                                        {(selectedSummary as any).previousTimeSlot &&
                                                            ` · ${TIME_SLOT_LABELS[(selectedSummary as any).previousTimeSlot]?.label ?? (selectedSummary as any).previousTimeSlot}`}
                                                    </span>
                                                )}
                                                <ArrowRight size={12} className="text-[#1e3a8a]/70 shrink-0" />
                                                <span className="text-[#1e3a8a] font-bold">
                                                    {formatDate(selectedSummary.appointmentDate).display} · {TIME_SLOT_LABELS[selectedSummary.timeSlot]?.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Schedule bar */}
                            <div className="px-4 sm:px-6 pb-5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-100 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0" style={{ backgroundColor: "#fff7f4" }}>
                                            <Calendar size={15} style={{ color: BRAND.orange }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{formatDate(selectedSummary.appointmentDate).display}</p>
                                            <p className="text-xs text-gray-400">{formatDate(selectedSummary.appointmentDate).weekday}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0" style={{ backgroundColor: "#fff7f4" }}>
                                            <Clock size={15} style={{ color: BRAND.orange }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{TIME_SLOT_LABELS[selectedSummary.timeSlot]?.range}</p>
                                            <p className="text-xs text-gray-400">{TIME_SLOT_LABELS[selectedSummary.timeSlot]?.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0" style={{ backgroundColor: "#fff7f4" }}>
                                            <MapPin size={15} style={{ color: BRAND.orange }} />
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
                                            <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: BRAND.navy }} />
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
                                                {/* Copy adapts when this PENDING is a reschedule request rather
                                                    than a brand-new booking — same CONFIRMED/CANCELLED transition
                                                    under the hood, since the backend doesn't yet support a
                                                    distinct "reject reschedule, keep original slot" transition.
                                                    Worth adding server-side if declining a reschedule shouldn't
                                                    cancel the whole booking. */}
                                                <button
                                                    onClick={() => doTransition("CONFIRMED")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 disabled:opacity-50"
                                                    style={{ borderColor: "#16a34a", color: "#16a34a" }}
                                                >
                                                    <CheckCircle size={15} /> {selectedRescheduled ? "Approve New Time" : "Accept Job"}
                                                </button>
                                                <button
                                                    onClick={() => doTransition("CANCELLED", selectedRescheduled ? "Reschedule declined by provider" : "Declined by provider")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <XCircle size={15} /> {selectedRescheduled ? "Decline New Time" : "Decline"}
                                                </button>
                                            </>
                                        )}

                                        {selectedSummary.status === "CONFIRMED" && (
                                            <>
                                                <button
                                                    onClick={() => doTransition("IN_PROGRESS")}
                                                    disabled={updatingId === selectedSummary.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                                                    style={{ backgroundColor: BRAND.navy }}
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
                                                style={{ backgroundColor: BRAND.navy }}
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

                                    {/* WhatsApp/Call now live up in the customer header (always visible,
                                        status-independent) — removed the duplicate copy that used to sit
                                        here to avoid showing the same two buttons twice per booking. */}
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