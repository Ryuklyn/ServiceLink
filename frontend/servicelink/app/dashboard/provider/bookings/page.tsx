"use client";

import { useState } from "react";
import {
    Search,
    SlidersHorizontal,
    Bell,
    Calendar,
    Clock,
    MapPin,
    Mail,
    Phone,
    Copy,
    Play,
    MessageCircle,
    PhoneCall,
    CheckCircle,
    XCircle,
    Truck,
    Wrench,
    ChevronRight,
    Car,
} from "lucide-react";

type StatusType = "PENDING" | "ACCEPTED" | "ON_THE_WAY" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface Booking {
    id: string;
    bookingId: string;
    name: string;
    avatar: string;
    service: string;
    date: string;
    time: string;
    location: string;
    amount: number;
    status: StatusType;
    email: string;
    phone: string;
    memberSince: string;
    totalBookings: number;
    address: string;
    landmark: string;
    distance: string;
    timeSlot: string;
    timeLabel: string;
    dateLabel: string;
    note: string;
    description: string;
}

const initialBookings: Booking[] = [
    {
        id: "1",
        bookingId: "BK-1256",
        name: "Sita Devi Sharma",
        avatar: "SD",
        service: "Pipe Leak Repair",
        date: "June 13, 2026",
        dateLabel: "Saturday",
        time: "12:00 PM",
        timeSlot: "12:00 PM - 4:00 PM",
        timeLabel: "Afternoon",
        location: "Bhaktapur",
        distance: "0.8 km away",
        amount: 1600,
        status: "PENDING",
        email: "sita.sharma@email.com",
        phone: "9841234567",
        memberSince: "May 2024",
        totalBookings: 3,
        address: "Dattatreya Square, Bhaktapur-10, Nepal",
        landmark: "Near Bhaktapur Durbar Square",
        note: "There is a water leakage in the kitchen pipe connection. Need immediate repair.",
        description: "Pipe Leak Repair",
    },
    {
        id: "2",
        bookingId: "BK-1255",
        name: "Dinesh Karki",
        avatar: "DK",
        service: "Inverter Setup",
        date: "June 14, 2026",
        dateLabel: "Sunday",
        time: "11:00 AM",
        timeSlot: "11:00 AM - 2:00 PM",
        timeLabel: "Morning",
        location: "Chabahil, Kathmandu",
        distance: "2.3 km away",
        amount: 950,
        status: "PENDING",
        email: "dinesh.karki@email.com",
        phone: "9812345678",
        memberSince: "Jan 2025",
        totalBookings: 1,
        address: "Chabahil Chowk, Kathmandu-6, Nepal",
        landmark: "Near Chabahil Temple",
        note: "Need inverter installation for home use. 1000W capacity.",
        description: "Inverter Setup",
    },
    {
        id: "3",
        bookingId: "BK-1254",
        name: "Sunita Pradhan",
        avatar: "SP",
        service: "Wiring & Rewiring",
        date: "June 15, 2026",
        dateLabel: "Monday",
        time: "9:00 AM",
        timeSlot: "9:00 AM - 1:00 PM",
        timeLabel: "Morning",
        location: "Naxal, Kathmandu",
        distance: "3.1 km away",
        amount: 1200,
        status: "ACCEPTED",
        email: "sunita.pradhan@email.com",
        phone: "9823456789",
        memberSince: "March 2024",
        totalBookings: 5,
        address: "Naxal Height, Kathmandu-1, Nepal",
        landmark: "Near Naxal Police Post",
        note: "Full house rewiring required. 3BHK apartment.",
        description: "Wiring & Rewiring",
    },
    {
        id: "4",
        bookingId: "BK-1253",
        name: "Babatunde Okonkwo",
        avatar: "BO",
        service: "Wiring & Rewiring",
        date: "June 16, 2026",
        dateLabel: "Tuesday",
        time: "10:00 AM",
        timeSlot: "10:00 AM - 2:00 PM",
        timeLabel: "Morning",
        location: "New Baneshwor",
        distance: "4.0 km away",
        amount: 800,
        status: "ON_THE_WAY",
        email: "babatunde@email.com",
        phone: "9834567890",
        memberSince: "Feb 2025",
        totalBookings: 2,
        address: "New Baneshwor, Kathmandu-10, Nepal",
        landmark: "Near Baneshwor Chowk",
        note: "Office wiring issue. Some sockets not working.",
        description: "Wiring & Rewiring",
    },
    {
        id: "5",
        bookingId: "BK-1252",
        name: "Priya Thapa",
        avatar: "PT",
        service: "Lighting Installation",
        date: "June 12, 2026",
        dateLabel: "Friday",
        time: "4:00 PM",
        timeSlot: "4:00 PM - 6:00 PM",
        timeLabel: "Afternoon",
        location: "Baluwatar, Kathmandu",
        distance: "5.2 km away",
        amount: 750,
        status: "IN_PROGRESS",
        email: "priya.thapa@email.com",
        phone: "9845678901",
        memberSince: "June 2024",
        totalBookings: 4,
        address: "Baluwatar, Kathmandu-4, Nepal",
        landmark: "Near Baluwatar Gate",
        note: "LED strip lights installation in living room and bedroom.",
        description: "Lighting Installation",
    },
    {
        id: "6",
        bookingId: "BK-1251",
        name: "Rukesh Shrestha",
        avatar: "RS",
        service: "Electrical Repair",
        date: "June 12, 2026",
        dateLabel: "Friday",
        time: "2:00 PM",
        timeSlot: "2:00 PM - 5:00 PM",
        timeLabel: "Afternoon",
        location: "Baneshwor, Kathmandu",
        distance: "3.8 km away",
        amount: 600,
        status: "IN_PROGRESS",
        email: "rukesh.shrestha@email.com",
        phone: "9856789012",
        memberSince: "Aug 2023",
        totalBookings: 8,
        address: "Baneshwor, Kathmandu-9, Nepal",
        landmark: "Near Baneshwor Hospital",
        note: "Main circuit breaker tripped. Needs inspection.",
        description: "Electrical Repair",
    },
    {
        id: "7",
        bookingId: "BK-1248",
        name: "Ram Prasad Magar",
        avatar: "RM",
        service: "Circuit Breaker Repair",
        date: "June 9, 2026",
        dateLabel: "Tuesday",
        time: "10:00 AM",
        timeSlot: "10:00 AM - 12:00 PM",
        timeLabel: "Morning",
        location: "Lalitpur",
        distance: "6.1 km away",
        amount: 450,
        status: "COMPLETED",
        email: "ram.magar@email.com",
        phone: "9867890123",
        memberSince: "Nov 2023",
        totalBookings: 6,
        address: "Mangalbazar, Lalitpur-1, Nepal",
        landmark: "Near Patan Durbar Square",
        note: "Circuit breaker repair completed successfully.",
        description: "Circuit Breaker Repair",
    },
    {
        id: "8",
        bookingId: "BK-1247",
        name: "Anita Gurung",
        avatar: "AG",
        service: "Lighting Installation",
        date: "June 7, 2026",
        dateLabel: "Sunday",
        time: "11:00 AM",
        timeSlot: "11:00 AM - 1:00 PM",
        timeLabel: "Morning",
        location: "Thamel, Kathmandu",
        distance: "4.5 km away",
        amount: 700,
        status: "COMPLETED",
        email: "anita.gurung@email.com",
        phone: "9878901234",
        memberSince: "Sep 2024",
        totalBookings: 2,
        address: "Thamel, Kathmandu-29, Nepal",
        landmark: "Near Thamel Chowk",
        note: "Restaurant lighting installation done.",
        description: "Lighting Installation",
    },
    {
        id: "9",
        bookingId: "BK-1246",
        name: "Bikash Tamang",
        avatar: "BT",
        service: "Fan Installation",
        date: "June 5, 2026",
        dateLabel: "Friday",
        time: "3:00 PM",
        timeSlot: "3:00 PM - 5:00 PM",
        timeLabel: "Afternoon",
        location: "Boudha, Kathmandu",
        distance: "7.2 km away",
        amount: 350,
        status: "CANCELLED",
        email: "bikash.tamang@email.com",
        phone: "9889012345",
        memberSince: "Jul 2024",
        totalBookings: 1,
        address: "Boudha, Kathmandu-6, Nepal",
        landmark: "Near Boudha Stupa",
        note: "Customer cancelled the booking.",
        description: "Fan Installation",
    },
];

const statusLabel = (s: StatusType): string => {
    if (s === "ON_THE_WAY" || s === "IN_PROGRESS") return "IN PROGRESS";
    return s.replace(/_/g, " ");
};

const statusBadgeStyle = (s: StatusType): string => {
    switch (s) {
        case "PENDING": return "bg-orange-50 text-orange-500 border border-orange-200";
        case "ACCEPTED": return "bg-blue-50 text-blue-700 border border-blue-200";
        case "ON_THE_WAY":
        case "IN_PROGRESS": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
        case "COMPLETED": return "bg-green-50 text-green-700 border border-green-200";
        case "CANCELLED": return "bg-red-50 text-red-500 border border-red-200";
        default: return "bg-gray-100 text-gray-600";
    }
};

const avatarColors: Record<string, string> = {
    SD: "#e8683f",
    DK: "#1e3a8a",
    SP: "#7c3aed",
    BO: "#0891b2",
    PT: "#db2777",
    RS: "#059669",
    RM: "#d97706",
    AG: "#6366f1",
    BT: "#64748b",
};

const TAB_FILTERS = [
    { label: "All", key: "ALL" },
    { label: "Pending", key: "PENDING" },
    { label: "Accepted", key: "ACCEPTED" },
    { label: "In Progress", key: "IN_PROGRESS" },
    { label: "Completed", key: "COMPLETED" },
    { label: "Cancelled", key: "CANCELLED" },
];

const WhatsAppIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.523 5.844L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.491-5.188-1.352l-.372-.22-3.862.913.977-3.768-.242-.387A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
);

const WaButton = ({ href }: { href: string }) => (
    <a
    href={href}
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
    style={{ backgroundColor: "#25D366" }}
    >
    <WhatsAppIcon /> WhatsApp
    </a>
);

const MsgButton = () => (
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <MessageCircle size={15} /> Message
    </button>
);

const CallButton = () => (
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <PhoneCall size={15} /> Call
    </button>
);

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [selectedId, setSelectedId] = useState<string>("1");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const selected = bookings.find((b) => b.id === selectedId) ?? bookings[0];

    const updateStatus = (id: string, status: StatusType) => {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    };

    const counts: Record<string, number> = {
        ALL: bookings.length,
        PENDING: bookings.filter((b) => b.status === "PENDING").length,
        ACCEPTED: bookings.filter((b) => b.status === "ACCEPTED").length,
        IN_PROGRESS: bookings.filter((b) => b.status === "ON_THE_WAY" || b.status === "IN_PROGRESS").length,
        COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
        CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
    };

    const filtered = bookings.filter((b) => {
        const matchFilter =
            activeFilter === "ALL" ||
            (activeFilter === "IN_PROGRESS" && (b.status === "ON_THE_WAY" || b.status === "IN_PROGRESS")) ||
            b.status === activeFilter;
        const matchSearch =
            search === "" ||
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
            b.service.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const groups = [
        { groupLabel: "PENDING", items: filtered.filter((b) => b.status === "PENDING") },
        { groupLabel: "ACCEPTED", items: filtered.filter((b) => b.status === "ACCEPTED") },
        { groupLabel: "ON THE WAY / IN PROGRESS", items: filtered.filter((b) => b.status === "ON_THE_WAY" || b.status === "IN_PROGRESS") },
        { groupLabel: "COMPLETED", items: filtered.filter((b) => b.status === "COMPLETED") },
        { groupLabel: "CANCELLED", items: filtered.filter((b) => b.status === "CANCELLED") },
    ].filter((g) => g.items.length > 0);

    const steps = [
        { label: "Pending", sub: "Request received", statuses: ["PENDING"] as StatusType[], icon: <Clock size={16} /> },
        { label: "Accepted", sub: "Job accepted", statuses: ["ACCEPTED"] as StatusType[], icon: <CheckCircle size={16} /> },
        { label: "On the Way / In Progress", sub: "Heading to location", statuses: ["ON_THE_WAY", "IN_PROGRESS"] as StatusType[], icon: <Truck size={16} /> },
        { label: "Completed", sub: "Job completed", statuses: ["COMPLETED"] as StatusType[], icon: <CheckCircle size={16} /> },
    ];

    const currentStepIndex = steps.findIndex((s) => s.statuses.includes(selected.status));
    const waLink = `https://wa.me/977${selected.phone}?text=Hello%20${encodeURIComponent(selected.name)}%2C%20regarding%20your%20booking%20${selected.bookingId}.`;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
                        <p className="text-xs text-gray-400">Manage your service requests and track job progress</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-56">
                            <Search size={14} className="text-gray-400" />
                            <input
                                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
                                placeholder="Search booking, customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <SlidersHorizontal size={14} /> Filter
                        </button>
                        <div className="relative">
                            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
                                <Bell size={16} className="text-gray-600" />
                            </button>
                            <span
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                                style={{ backgroundColor: "#1e3a8a" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {TAB_FILTERS.map(({ label, key }) => (
                        <button
                            key={key}
                            onClick={() => setActiveFilter(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                activeFilter === key
                                    ? "text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                            style={activeFilter === key ? { backgroundColor: "#1e3a8a" } : {}}
                        >
                            {label}
                            <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                    activeFilter === key ? "bg-white" : "bg-gray-100 text-gray-500"
                                }`}
                                style={activeFilter === key ? { color: "#1e3a8a" } : {}}
                            >
                {counts[key]}
              </span>
                        </button>
                    ))}
                </div>

                {/* Split layout */}
                <div className="flex gap-4 items-start">
                    {/* LEFT: List */}
                    <div className="w-72 flex-shrink-0 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                        {groups.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-12">No bookings found.</div>
                        )}
                        {groups.map(({ groupLabel, items }) => (
                            <div key={groupLabel}>
                                <p className="text-xs font-bold mb-2 tracking-wide" style={{ color: "#e8683f" }}>
                                    {groupLabel} ({items.length})
                                </p>
                                <div className="space-y-2">
                                    {items.map((b) => (
                                        <div
                                            key={b.id}
                                            onClick={() => setSelectedId(b.id)}
                                            className={`bg-white rounded-xl border p-3 cursor-pointer transition-all ${
                                                selectedId === b.id
                                                    ? "border-blue-400 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: avatarColors[b.avatar] ?? "#1e3a8a" }}
                                                >
                                                    {b.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{b.name}</p>
                                                        <p className="text-xs font-bold flex-shrink-0" style={{ color: "#e8683f" }}>
                                                            Rs. {b.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{b.service}</p>
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                                        <Calendar size={10} />
                                                        {b.date} • {b.time}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                                            <MapPin size={10} /> {b.location}
                                                        </div>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadgeStyle(b.status)}`}>
                              {statusLabel(b.status)}
                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: Detail */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Progress stepper */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
                            <div className="flex items-center justify-between">
                                {steps.map((step, i) => {
                                    const isActive = i === currentStepIndex;
                                    const isDone = i < currentStepIndex;
                                    return (
                                        <div key={step.label} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center flex-1">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 border-2 ${
                                                        isDone
                                                            ? "border-blue-700 bg-blue-700"
                                                            : isActive
                                                                ? "border-orange-400 bg-orange-50"
                                                                : "border-gray-200 bg-gray-50"
                                                    }`}
                                                >
                          <span
                              className={
                                  isDone ? "text-white" : isActive ? "text-orange-500" : "text-gray-400"
                              }
                          >
                            {step.icon}
                          </span>
                                                </div>
                                                <p
                                                    className={`text-xs font-semibold text-center leading-tight ${
                                                        isActive ? "text-orange-500" : isDone ? "text-blue-700" : "text-gray-400"
                                                    }`}
                                                >
                                                    {step.label}
                                                </p>
                                                <p className="text-xs text-gray-400 text-center">{step.sub}</p>
                                            </div>
                                            {i < steps.length - 1 && (
                                                <div
                                                    className={`h-0.5 w-8 mx-1 mb-6 rounded ${isDone ? "bg-blue-400" : "bg-gray-200"}`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Customer card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                                        style={{ backgroundColor: avatarColors[selected.avatar] ?? "#1e3a8a" }}
                                    >
                                        {selected.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadgeStyle(selected.status)}`}>
                        {statusLabel(selected.status)}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                                            <Mail size={13} /> {selected.email}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Phone size={13} /> {selected.phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-gray-400">Booking ID</p>
                                    <div className="flex items-center gap-1 justify-end">
                                        <p className="text-sm font-bold text-gray-800">{selected.bookingId}</p>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Service Amount</p>
                                    <p className="text-xl font-bold" style={{ color: "#e8683f" }}>
                                        Rs. {selected.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400">Pay after service</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-2">
                                    <Calendar size={16} className="mt-0.5" style={{ color: "#1e3a8a" }} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{selected.date}</p>
                                        <p className="text-xs text-gray-400">{selected.dateLabel}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock size={16} className="mt-0.5" style={{ color: "#1e3a8a" }} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{selected.timeSlot}</p>
                                        <p className="text-xs text-gray-400">{selected.timeLabel}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5" style={{ color: "#1e3a8a" }} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{selected.location}</p>
                                        <p className="text-xs text-gray-400">{selected.distance}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services + Address */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Services Requested</h3>
                                <span
                                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3"
                                    style={{ borderColor: "#e8683f", color: "#e8683f", backgroundColor: "#fff7f4" }}
                                >
                  {selected.description}
                </span>
                                <p className="text-sm text-gray-600 leading-relaxed">{selected.note}</p>

                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">Attachments</p>
                                    <div className="flex gap-2">
                                        <div className="w-16 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                            IMG
                                        </div>
                                        <div className="w-16 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                                            <Play size={16} className="text-white" />
                                        </div>
                                        <div className="w-16 h-14 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-xs font-bold">
                                            +2
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">Customer Note (Voice)</p>
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <button
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: "#1e3a8a" }}
                                        >
                                            <Play size={10} className="text-white" />
                                        </button>
                                        <div className="flex-1 h-1.5 bg-gray-300 rounded-full">
                                            <div className="h-1.5 w-1/3 rounded-full" style={{ backgroundColor: "#1e3a8a" }} />
                                        </div>
                                        <span className="text-xs text-gray-400">0:18</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Service Address</h3>
                                    <div className="flex items-start gap-2 mb-1">
                                        <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#1e3a8a" }} />
                                        <div>
                                            <p className="text-sm text-gray-700 font-medium">{selected.address}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Landmark: {selected.landmark}</p>
                                        </div>
                                    </div>
                                    <button className="mt-3 w-full border border-gray-300 rounded-lg py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                        View on Map
                                    </button>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Customer Details</h3>
                                    <div className="space-y-2 text-xs">
                                        {[
                                            { label: "Email", value: selected.email },
                                            { label: "Phone", value: selected.phone },
                                            { label: "Member Since", value: selected.memberSince },
                                            { label: "Total Bookings", value: String(selected.totalBookings) },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between">
                                                <span className="text-gray-400">{label}</span>
                                                <span className="text-gray-700 font-medium">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex flex-wrap gap-3">
                                {selected.status === "PENDING" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selected.id, "ACCEPTED")}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: "#1e3a8a" }}
                                        >
                                            <CheckCircle size={15} /> Accept Job
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selected.id, "CANCELLED")}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={15} /> Decline
                                        </button>
                                        <WaButton href={waLink} />
                                        <MsgButton />
                                        <CallButton />
                                    </>
                                )}

                                {selected.status === "ACCEPTED" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selected.id, "ON_THE_WAY")}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: "#1e3a8a" }}
                                        >
                                            <Car size={15} /> On the Way
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selected.id, "CANCELLED")}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={15} /> Cancel
                                        </button>
                                        <WaButton href={waLink} />
                                        <MsgButton />
                                        <CallButton />
                                    </>
                                )}

                                {selected.status === "ON_THE_WAY" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selected.id, "IN_PROGRESS")}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: "#1e3a8a" }}
                                        >
                                            <Wrench size={15} /> Start Job
                                        </button>
                                        <WaButton href={waLink} />
                                        <MsgButton />
                                        <CallButton />
                                    </>
                                )}

                                {selected.status === "IN_PROGRESS" && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(selected.id, "COMPLETED")}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: "#1e3a8a" }}
                                        >
                                            <CheckCircle size={15} /> Mark Complete
                                        </button>
                                        <WaButton href={waLink} />
                                        <MsgButton />
                                        <CallButton />
                                    </>
                                )}

                                {selected.status === "COMPLETED" && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
                                        <CheckCircle size={15} /> Job Completed Successfully
                                    </div>
                                )}

                                {selected.status === "CANCELLED" && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-200">
                                        <XCircle size={15} /> Booking Cancelled
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <p className="text-sm font-semibold mb-4" style={{ color: "#e8683f" }}>
                                How it works?
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {[
                                    { icon: <CheckCircle size={18} style={{ color: "#1e3a8a" }} />, title: "1. Accept the job", sub: "Confirm the booking" },
                                    { icon: <Car size={18} style={{ color: "#1e3a8a" }} />, title: "2. On the way", sub: "Let customer know you're coming" },
                                    { icon: <Wrench size={18} style={{ color: "#e8683f" }} />, title: "3. In progress", sub: "Work on the service" },
                                    { icon: <CheckCircle size={18} className="text-green-600" />, title: "4. Complete & Earn", sub: "Mark complete after payment" },
                                ].map((step, i, arr) => (
                                    <div key={step.title} className="flex items-center gap-2">
                                        <div className="flex items-start gap-2">
                                            {step.icon}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-800">{step.title}</p>
                                                <p className="text-xs text-gray-400">{step.sub}</p>
                                            </div>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}