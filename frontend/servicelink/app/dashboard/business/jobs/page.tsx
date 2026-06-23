"use client";

import React, { useState } from "react";
import {
    Briefcase,
    Clock,
    AlertTriangle,
    User,
    Users,
    Repeat,
    X,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Circle,
    MapPin,
    Calendar,
    DollarSign,
    FileText
} from "lucide-react";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Static reference data ----------

const PROVIDER_DIRECTORY = [
    { id: "p1", name: "Ram Shrestha", role: "HVAC", initial: "RS" },
    { id: "p2", name: "Nepal Electricals", role: "Electrical", initial: "NE" },
    { id: "p3", name: "Sparkle Cleaning Co.", role: "Cleaning", initial: "SC" },
    { id: "p4", name: "Purna Plumbing", role: "Plumbing", initial: "PP" },
    { id: "p5", name: "Gurkha Security Services", role: "Security", initial: "GS" },
    { id: "p6", name: "Cooling Masters", role: "HVAC", initial: "CM" },
    { id: "p7", name: "Eco Cleaners", role: "Cleaning", initial: "EC" },
    { id: "p8", name: "SafeGuard Nepal", role: "Security", initial: "SN" },
    { id: "p9", name: "Bug Busters", role: "Pest Control", initial: "BB" },
];

// ---------- Mock job data, mirroring the reference screens ----------

const initialJobs = [
    {
        id: "JOB-1001",
        category: "HVAC",
        location: "Floor 3, Room 312",
        requestedBy: "Rajesh Shrestha",
        priority: "HIGH",
        mode: "Direct",
        assignmentMode: "Single",
        status: "IN PROGRESS",
        providerStatus: "ACCEPTED",
        providers: [{ name: "Ram Shrestha", role: "Lead Technician", initial: "RS", status: "ACCEPTED" }],
        duration: "1 day",
        budget: 4500,
        sla: "Jun 25, 2025 7:45 PM",
        description: "Central AC unit is not cooling. Requires inspection and possible refrigerant top-up.",
        type: "One-off",
        recurring: false,
        checklist: [
            { text: "Inspect AC unit", checked: true },
            { text: "Check refrigerant levels", checked: true },
            { text: "Clean filters", checked: false },
            { text: "Test cooling output", checked: false },
        ],
        notes: "Guest complained about warm temperature in Room 312. Ensure quiet operation during working hours.",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Rajesh Shrestha", state: "done" },
            { label: "Assigned", desc: "Assigned to Ram Shrestha", state: "done" },
            { label: "Provider Response", desc: "Ram Shrestha accepted this job", state: "active" },
            { label: "In Progress", desc: "Work underway", state: "done" },
            { label: "Completion pending", desc: "Job still in progress", state: "pending" },
        ],
    },
    {
        id: "JOB-1002",
        category: "Electrical",
        location: "Basement, Main Panel",
        requestedBy: "Priya Sharma",
        priority: "CRITICAL",
        mode: "Pool",
        assignmentMode: "Single",
        status: "REQUESTED",
        providerStatus: "Awaiting pool response",
        providers: [],
        duration: "Half day",
        budget: 3200,
        sla: "Jun 26, 2025 3:45 PM",
        description: "Circuit breaker tripping repeatedly on the east wing. Needs diagnosis and possible panel work.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        poolWarning: "No Electrical providers in your pool for this job.",
        timeline: [
            { label: "Requested", desc: "By Priya Sharma", state: "done" },
            { label: "Assigned", desc: "Pending strategy step", state: "pending" },
            { label: "In Progress", desc: "Work underway", state: "pending" },
        ],
    },
    {
        id: "JOB-1003",
        category: "Cleaning",
        location: "All Guest Floors",
        requestedBy: "Hotel Manager",
        priority: "MEDIUM",
        mode: "Direct",
        assignmentMode: "Team",
        status: "IN PROGRESS",
        providerStatus: "4 providers assigned",
        providers: [
            { name: "Sparkle Cleaning Co.", role: "Lead", initial: "SC", status: "ACCEPTED" },
            { name: "Eco Cleaners", role: "Member", initial: "EC", status: "ACCEPTED" },
            { name: "SafeGuard Nepal", role: "Member", initial: "SR", status: "ACCEPTED" },
            { name: "Karki Group", role: "Member", initial: "KG", status: "ACCEPTED" },
        ],
        duration: "1 month",
        budget: 42000,
        sla: "Jul 20, 2025 2:45 PM",
        description: "Recurring deep cleaning rotation across all guest floors.",
        type: "Recurring",
        recurring: true,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Hotel Manager", state: "done" },
            { label: "Assigned", desc: "4 providers assigned", state: "done" },
            { label: "In Progress", desc: "Work underway", state: "active" },
        ],
    },
    {
        id: "JOB-1004",
        category: "Plumbing",
        location: "Room 108, Bathroom",
        requestedBy: "Front Desk",
        priority: "CRITICAL",
        mode: "Direct",
        assignmentMode: "Single",
        status: "ASSIGNED",
        providerStatus: "PENDING",
        providers: [{ name: "Purna Plumbing", role: "Technician", initial: "PP", status: "PENDING" }],
        duration: "2 hours",
        budget: 1800,
        sla: "Jun 25, 2025 10:45 PM",
        description: "Leaking pipe under the bathroom sink reported by housekeeping.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Front Desk", state: "done" },
            { label: "Assigned", desc: "Assigned to Purna Plumbing", state: "active" },
            { label: "In Progress", desc: "Work underway", state: "pending" },
        ],
    },
    {
        id: "JOB-1005",
        category: "Security",
        location: "Main Entrance & Perimeter",
        requestedBy: "Hotel Manager",
        priority: "HIGH",
        mode: "Direct",
        assignmentMode: "Team",
        status: "IN PROGRESS",
        providerStatus: "3 providers assigned",
        providers: [
            { name: "Gurkha Security Services", role: "Lead", initial: "GS", status: "ACCEPTED" },
            { name: "Bright Rover", role: "Member", initial: "BR", status: "ACCEPTED" },
            { name: "Night Team", role: "Member", initial: "NT", status: "ACCEPTED" },
        ],
        duration: "Reserved for 1 month",
        budget: 28000,
        sla: "Jun 30, 2025 11:45 PM",
        description: "Dedicated perimeter and entrance security coverage.",
        type: "Dedicated",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Hotel Manager", state: "done" },
            { label: "Assigned", desc: "3 providers assigned", state: "done" },
            { label: "In Progress", desc: "Work underway", state: "active" },
        ],
    },
    {
        id: "JOB-1006",
        category: "HVAC",
        location: "Rooftop, Unit R-2",
        requestedBy: "Maintenance Team",
        priority: "LOW",
        mode: "Pool",
        assignmentMode: "Single",
        status: "CANCELLED",
        providerStatus: "DECLINED",
        providers: [{ name: "Cooling Masters", role: "Technician", initial: "CM", status: "DECLINED" }],
        duration: "Half day",
        budget: 2200,
        sla: "Jun 22, 2025 5:45 PM",
        description: "Routine rooftop unit inspection, cancelled by requester.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "CANCELLED",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Maintenance Team", state: "done" },
            { label: "Assigned", desc: "Cooling Masters declined", state: "done" },
            { label: "Cancelled", desc: "Job cancelled by requester", state: "active" },
        ],
    },
    {
        id: "JOB-1007",
        category: "Electrical",
        location: "Conference Room A & B",
        requestedBy: "Arun KC",
        priority: "CRITICAL",
        mode: "Pool",
        assignmentMode: "Team",
        status: "COMPLETED",
        providerStatus: "2 providers assigned",
        providers: [
            { name: "Nepal Electricals", role: "Lead Technician", initial: "NE", status: "ACCEPTED" },
            { name: "Dipesh Karki", role: "Assistant", initial: "DK", status: "ACCEPTED" },
        ],
        duration: "2 days",
        budget: 18500,
        sla: "Jun 15, 2025 9:45 PM",
        description: "Full rewiring of the conference room lighting and AV power circuits.",
        type: "Dedicated",
        recurring: false,
        checklist: [
            { text: "Isolate circuits", checked: true },
            { text: "Replace wiring", checked: true },
            { text: "Test AV power", checked: true },
        ],
        notes: "",
        actualCost: 18200,
        paymentStatus: "PAID",
        invoice: "INV-2007",
        timeline: [
            { label: "Requested", desc: "By Arun KC", state: "done" },
            { label: "Assigned", desc: "2 providers assigned", state: "done" },
            { label: "In Progress", desc: "Work completed", state: "done" },
            { label: "Completed", desc: "Job closed and invoiced", state: "active" },
        ],
    },
    {
        id: "JOB-1008",
        category: "Pest Control",
        location: "Kitchen & Storage",
        requestedBy: "Kitchen Supervisor",
        priority: "HIGH",
        mode: "Pool",
        assignmentMode: "Single",
        status: "REQUESTED",
        providerStatus: "Awaiting pool response",
        providers: [],
        duration: "2 hours",
        budget: 3500,
        sla: "Jun 27, 2025 4:45 PM",
        description: "Pest sighting reported near dry storage. Requires inspection and treatment.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        poolWarning: "No Pest Control providers in your pool for this job.",
        timeline: [
            { label: "Requested", desc: "By Kitchen Supervisor", state: "done" },
            { label: "Assigned", desc: "Pending strategy step", state: "pending" },
            { label: "In Progress", desc: "Work underway", state: "pending" },
        ],
    },
    {
        id: "JOB-1010",
        category: "Plumbing",
        location: "Laundry Room, Floor B1",
        requestedBy: "Housekeeping",
        priority: "HIGH",
        mode: "Pool",
        assignmentMode: "Single",
        status: "IN PROGRESS",
        providerStatus: "ACCEPTED",
        providers: [{ name: "Purna Plumbing", role: "Technician", initial: "PP", status: "ACCEPTED" }],
        duration: "2 hours",
        budget: 2800,
        sla: "Jun 25, 2025 10:45 PM",
        description: "Drainage backup in the laundry room floor drain.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Housekeeping", state: "done" },
            { label: "Assigned", desc: "Assigned to Purna Plumbing", state: "done" },
            { label: "In Progress", desc: "Work underway", state: "active" },
        ],
    },
    {
        id: "JOB-1011",
        category: "Security",
        location: "Parking & Vehicle Entry",
        requestedBy: "Hotel Manager",
        priority: "MEDIUM",
        mode: "Direct",
        assignmentMode: "Single",
        status: "COMPLETED",
        providerStatus: "ACCEPTED",
        providers: [{ name: "SafeGuard Nepal", role: "Supervisor", initial: "SN", status: "ACCEPTED" }],
        duration: "Reserved for 1 month",
        budget: 28000,
        sla: "May 10, 2025 2:45 PM",
        description: "Dedicated parking and vehicle entry monitoring for the month.",
        type: "Dedicated",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: 28000,
        paymentStatus: "PAID",
        invoice: "INV-2011",
        timeline: [
            { label: "Requested", desc: "By Hotel Manager", state: "done" },
            { label: "Assigned", desc: "Assigned to SafeGuard Nepal", state: "done" },
            { label: "Completed", desc: "Engagement period ended", state: "active" },
        ],
    },
    {
        id: "JOB-1012",
        category: "HVAC",
        location: "Server Room, Floor 1",
        requestedBy: "IT Department",
        priority: "CRITICAL",
        mode: "Pool",
        assignmentMode: "Single",
        status: "REQUESTED",
        providerStatus: "Awaiting pool response",
        providers: [],
        duration: "Half day",
        budget: 6000,
        sla: "Jun 24, 2025 5:45 PM",
        description: "Server room cooling unit alarm triggered. Needs urgent inspection.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        poolWarning: "No HVAC providers in your pool for this job.",
        timeline: [
            { label: "Requested", desc: "By IT Department", state: "done" },
            { label: "Assigned", desc: "Pending strategy step", state: "pending" },
            { label: "In Progress", desc: "Work underway", state: "pending" },
        ],
    },
    {
        id: "JOB-1013",
        category: "Electrical",
        location: "Lobby Entrance",
        requestedBy: "Front Desk",
        priority: "LOW",
        mode: "Direct",
        assignmentMode: "Single",
        status: "CANCELLED",
        providerStatus: "DECLINED",
        providers: [{ name: "Bright Light Electric", role: "Technician", initial: "BE", status: "DECLINED" }],
        duration: "2 hours",
        budget: 900,
        sla: "Jun 22, 2025 7:45 PM",
        description: "Flickering lobby entrance light fixture.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "CANCELLED",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Front Desk", state: "done" },
            { label: "Assigned", desc: "Bright Light Electric declined", state: "done" },
            { label: "Cancelled", desc: "Job cancelled by requester", state: "active" },
        ],
    },
    {
        id: "JOB-1014",
        category: "Cleaning",
        location: "Banquet Hall & Events Area",
        requestedBy: "Events Team",
        priority: "MEDIUM",
        mode: "Direct",
        assignmentMode: "Team",
        status: "IN PROGRESS",
        providerStatus: "3 providers assigned",
        providers: [
            { name: "Sparkle Cleaning Co.", role: "Lead", initial: "SC", status: "ACCEPTED" },
            { name: "Ram Maya", role: "Member", initial: "RM", status: "ACCEPTED" },
            { name: "Puja Adhikari", role: "Member", initial: "PA", status: "ACCEPTED" },
        ],
        duration: "1 week",
        budget: 22000,
        sla: "Jun 26, 2025 8:45 PM",
        description: "Recurring weekly deep clean of the banquet hall and events area.",
        type: "Recurring",
        recurring: true,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Events Team", state: "done" },
            { label: "Assigned", desc: "3 providers assigned", state: "done" },
            { label: "In Progress", desc: "Work underway", state: "active" },
        ],
    },
    {
        id: "JOB-1015",
        category: "Pest Control",
        location: "Garden & Outdoor Terrace",
        requestedBy: "Grounds Team",
        priority: "MEDIUM",
        mode: "Direct",
        assignmentMode: "Single",
        status: "ASSIGNED",
        providerStatus: "PENDING",
        providers: [{ name: "Bug Busters", role: "Specialist", initial: "BB", status: "PENDING" }],
        duration: "2 hours",
        budget: 3500,
        sla: "Jun 27, 2025 4:45 PM",
        description: "Routine outdoor terrace and garden pest treatment.",
        type: "One-off",
        recurring: false,
        checklist: [],
        notes: "",
        actualCost: null,
        paymentStatus: "PENDING",
        invoice: null,
        timeline: [
            { label: "Requested", desc: "By Grounds Team", state: "done" },
            { label: "Assigned", desc: "Assigned to Bug Busters", state: "active" },
            { label: "In Progress", desc: "Work underway", state: "pending" },
        ],
    },
];

const DURATION_OPTIONS = ["2 hours", "Half day", "1 day", "2 days", "1 week", "2 weeks", "1 month", "3 months", "Custom"];

export default function JobTicketPage() {
    const [jobs, setJobs] = useState(initialJobs);
    const [activeTab, setActiveTab] = useState("All Jobs");
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [modalSubTab, setModalSubTab] = useState("Summary");

    // Create Job Wizard state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: "HVAC",
        location: "",
        priority: "MEDIUM",
        recruitment: "Direct", // "Direct" | "Pool"
        assignmentMode: "Single", // "Single" | "Team"
        selectedProvider: "",
        selectedTeam: [] as string[],
        budget: "",
        duration: "1 day",
        description: "",
        recurring: false,
        slaDeadline: "",
        requestedBy: "Rajesh Shrestha",
    });

    const filteredJobs = jobs.filter((job) => {
        if (activeTab === "All Jobs") return true;
        return job.type === activeTab;
    });

    const getPriorityStyles = (priority: string) => {
        if (priority === "CRITICAL") return "bg-red-50 text-red-600 border border-red-100";
        if (priority === "HIGH") return `bg-orange-50 border border-orange-100`;
        if (priority === "LOW") return "bg-blue-50 text-[#1e3a8a] border border-blue-100";
        return "bg-blue-50 text-[#1e3a8a] border border-blue-100";
    };

    const getStatusStyles = (status: string) => {
        if (status === "IN PROGRESS") return "bg-amber-50 text-amber-700";
        if (status === "REQUESTED") return "bg-slate-100 text-slate-600";
        if (status === "ASSIGNED") return "bg-indigo-50 text-indigo-700";
        if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700";
        if (status === "CANCELLED") return "bg-red-50 text-red-600";
        return "bg-gray-100 text-gray-700";
    };

    const getProviderStatusStyles = (status: string) => {
        if (status === "ACCEPTED") return "bg-emerald-50 text-emerald-600";
        if (status === "DECLINED") return "bg-red-50 text-red-500";
        if (status === "PENDING") return "bg-amber-50 text-amber-600";
        return "bg-slate-100 text-slate-500";
    };

    const toggleTeamMember = (id: string) => {
        setFormData((prev) => {
            const exists = prev.selectedTeam.includes(id);
            return {
                ...prev,
                selectedTeam: exists ? prev.selectedTeam.filter((p) => p !== id) : [...prev.selectedTeam, id],
            };
        });
    };

    const resetForm = () =>
        setFormData({
            category: "HVAC",
            location: "",
            priority: "MEDIUM",
            recruitment: "Direct",
            assignmentMode: "Single",
            selectedProvider: "",
            selectedTeam: [],
            budget: "",
            duration: "1 day",
            description: "",
            recurring: false,
            slaDeadline: "",
            requestedBy: "Rajesh Shrestha",
        });

    const handleCreateSubmit = () => {
        const assignedProviders =
            formData.recruitment === "Direct"
                ? formData.assignmentMode === "Team"
                    ? formData.selectedTeam.map((id) => {
                        const p = PROVIDER_DIRECTORY.find((d) => d.id === id)!;
                        return { name: p.name, role: "Member", initial: p.initial, status: "PENDING" };
                    })
                    : formData.selectedProvider
                        ? (() => {
                            const p = PROVIDER_DIRECTORY.find((d) => d.id === formData.selectedProvider)!;
                            return [{ name: p.name, role: "Technician", initial: p.initial, status: "PENDING" }];
                        })()
                        : []
                : [];

        const newJob = {
            id: `JOB-${1000 + jobs.length + 1}`,
            category: formData.category,
            location: formData.location || "General Premises",
            requestedBy: formData.requestedBy || "Hotel Manager",
            priority: formData.priority,
            mode: formData.recruitment,
            assignmentMode: formData.assignmentMode,
            status: "REQUESTED",
            providerStatus:
                formData.recruitment === "Pool"
                    ? "Awaiting pool response"
                    : assignedProviders.length > 1
                        ? `${assignedProviders.length} providers assigned`
                        : "PENDING",
            providers: assignedProviders,
            duration: formData.duration,
            budget: Number(formData.budget) || 0,
            sla: formData.slaDeadline || "24 Hours from now",
            description: formData.description,
            type: formData.recurring ? "Recurring" : "One-off",
            recurring: formData.recurring,
            checklist: [],
            notes: "",
            actualCost: null,
            paymentStatus: "PENDING",
            invoice: null,
            poolWarning:
                formData.recruitment === "Pool"
                    ? `No ${formData.category} providers in your pool for this job.`
                    : undefined,
            timeline: [
                { label: "Requested", desc: `By ${formData.requestedBy || "Hotel Manager"}`, state: "done" },
                { label: "Assigned", desc: "Pending strategy step", state: "pending" },
                { label: "In Progress", desc: "Work underway", state: "pending" },
            ],
        };

        setJobs([newJob, ...jobs]);
        setIsCreateOpen(false);
        resetForm();
    };

    const canSubmit =
        formData.category &&
        formData.duration &&
        (formData.recruitment === "Pool" ||
            (formData.assignmentMode === "Single" && formData.selectedProvider) ||
            (formData.assignmentMode === "Team" && formData.selectedTeam.length >= 2));

    const detailTabs = ["Summary", "Providers", "Timeline", "Engagement", "Checklist", "Billing"];

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Header Navigation Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-2">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {[
                        { label: "All Jobs", count: jobs.length },
                        { label: "One-off", count: jobs.filter((j) => j.type === "One-off").length },
                        { label: "Dedicated", count: jobs.filter((j) => j.type === "Dedicated").length },
                        { label: "Recurring", count: jobs.filter((j) => j.type === "Recurring").length },
                    ].map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.label)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                                activeTab === tab.label
                                    ? "bg-white text-[#1e3a8a] font-bold shadow-sm border border-gray-200"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    activeTab === tab.label ? "bg-[#1e3a8a] text-white" : "bg-slate-200/70 text-slate-600"
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2 text-sm font-bold text-white bg-[#e8683f] hover:bg-[#d45b34] transition-colors rounded-xl shadow-sm self-end sm:self-auto"
                >
                    Create Job
                </button>
            </div>

            {/* Core Job Display Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => {
                            setSelectedJob(job);
                            setModalSubTab("Summary");
                        }}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2 text-xs text-gray-400 font-medium mb-1">
                                <span>{job.id}</span>
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] uppercase ${getStatusStyles(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900">{job.category}</h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin size={13} className="text-slate-400" />
                                {job.location}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${getPriorityStyles(job.priority)}`}
                                    style={job.priority === "HIGH" ? { color: ORANGE } : undefined}
                                >
                                    {job.priority}
                                </span>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1e3a8a] border border-blue-100 flex items-center gap-1">
                                    {job.mode === "Direct" ? <User size={11} /> : <Users size={11} />}
                                    {job.mode}
                                </span>
                                {job.assignmentMode === "Team" && (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-50 border border-orange-100 flex items-center gap-1" style={{ color: ORANGE }}>
                                        <Users size={11} />
                                        Team
                                    </span>
                                )}
                                {job.type === "Dedicated" && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1e3a8a] text-white flex items-center gap-1">
                                        <Briefcase size={11} />
                                        Dedicated
                                    </span>
                                )}
                                {job.recurring && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                                        <Repeat size={11} />
                                        Recurring
                                    </span>
                                )}
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3 mt-4 text-xs">
                                {job.providers && job.providers.length > 1 ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {job.providers.slice(0, 4).map((p: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="w-6 h-6 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] border-2 border-white flex items-center justify-center font-bold text-[10px]"
                                                >
                                                    {p.initial}
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{job.providerStatus}</p>
                                            <p className="text-[11px] text-slate-400">
                                                {job.providers[0].name} {job.providers.length > 1 ? `+ ${job.providers.length - 1} others` : ""}
                                            </p>
                                        </div>
                                    </div>
                                ) : job.providers && job.providers.length === 1 ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center font-bold text-[10px]">
                                                {job.providers[0].initial}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{job.providers[0].name}</p>
                                                <p className="text-[11px] text-slate-400">{job.providers[0].role}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${getProviderStatusStyles(job.providers[0].status)}`}>
                                            {job.providers[0].status}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="italic text-slate-400 font-medium">{job.providerStatus}</p>
                                        {job.poolWarning && (
                                            <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                                                <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-amber-700 leading-tight">
                                                    {job.poolWarning}{" "}
                                                    <span className="font-bold underline cursor-pointer" style={{ color: ORANGE }}>
                                                        Browse Directory →
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 mt-5 pt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                            <div className="flex items-center gap-1">
                                <Clock size={14} className="text-gray-400" />
                                <span>{job.duration}</span>
                            </div>
                            <span className="font-bold text-slate-900 text-sm">Rs. {job.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
                            <Calendar size={12} />
                            <span>SLA: {job.sla}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE JOB STEPPER MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                        {/* Top Bar Header */}
                        <div className="flex items-start justify-between border-b border-gray-100 p-6 pb-4 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Create New Job Ticket</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Define the service work, provider requirements, and engagement terms.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-slate-100 rounded-lg shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form body — single scroll surface, no step gating */}
                        <div className="flex-1 space-y-5 overflow-y-auto p-6 pt-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Service Type</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                    >
                                        <option value="HVAC">HVAC</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Security">Security</option>
                                        <option value="Pest Control">Pest Control</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                    >
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                        <option value="CRITICAL">CRITICAL</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Location / Room</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Floor 3, Room 302"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the job requirements, scope, and any special instructions..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] resize-none"
                                />
                            </div>

                            {/* Recruitment Type block */}
                            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2.5">Recruitment Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setFormData({ ...formData, recruitment: "Direct" })}
                                            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                                                formData.recruitment === "Direct"
                                                    ? "border-[#1e3a8a] text-[#1e3a8a] bg-white"
                                                    : "border-transparent bg-white text-slate-600"
                                            }`}
                                        >
                                            <User size={15} />
                                            Direct Assign
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, recruitment: "Pool" })}
                                            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                                                formData.recruitment === "Pool"
                                                    ? "border-[#1e3a8a] text-[#1e3a8a] bg-blue-50/40"
                                                    : "border-transparent bg-white text-slate-600"
                                            }`}
                                        >
                                            <Users size={15} />
                                            Open to Pool
                                        </button>
                                    </div>
                                </div>

                                {formData.recruitment === "Pool" && (
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                                        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            Matching providers in your pool will be notified. The first qualified provider to accept will be assigned.
                                        </p>
                                    </div>
                                )}

                                {formData.recruitment === "Direct" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2.5">Assignment Mode</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setFormData({ ...formData, assignmentMode: "Single" })}
                                                    className={`rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                                                        formData.assignmentMode === "Single"
                                                            ? "border-[#1e3a8a] text-[#1e3a8a] bg-blue-50/40"
                                                            : "border-transparent bg-white text-slate-600"
                                                    }`}
                                                >
                                                    Single Provider
                                                </button>
                                                <button
                                                    onClick={() => setFormData({ ...formData, assignmentMode: "Team" })}
                                                    className={`rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                                                        formData.assignmentMode === "Team"
                                                            ? "border-[#1e3a8a] text-[#1e3a8a] bg-white"
                                                            : "border-transparent bg-white text-slate-600"
                                                    }`}
                                                >
                                                    Team Assignment
                                                </button>
                                            </div>
                                        </div>

                                        {formData.assignmentMode === "Single" ? (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign Provider</label>
                                                <select
                                                    value={formData.selectedProvider}
                                                    onChange={(e) => setFormData({ ...formData, selectedProvider: e.target.value })}
                                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white"
                                                >
                                                    <option value="">Select a provider...</option>
                                                    {PROVIDER_DIRECTORY.filter((p) => p.role === formData.category).length > 0
                                                        ? PROVIDER_DIRECTORY.filter((p) => p.role === formData.category).map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name}
                                                            </option>
                                                        ))
                                                        : PROVIDER_DIRECTORY.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({p.role})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                                                    Select Team Members{" "}
                                                    <span className="font-medium text-slate-400">({formData.selectedTeam.length} selected)</span>
                                                </label>
                                                <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2">
                                                    {PROVIDER_DIRECTORY.map((p) => {
                                                        const selected = formData.selectedTeam.includes(p.id);
                                                        return (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => toggleTeamMember(p.id)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                                                                    selected
                                                                        ? "border-[#1e3a8a] bg-[#1e3a8a]/5 text-[#1e3a8a]"
                                                                        : "border-gray-200 text-slate-600 hover:border-slate-300"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`w-2 h-2 rounded-full ${selected ? "bg-[#1e3a8a]" : "bg-slate-300"}`}
                                                                />
                                                                {p.name}
                                                                <span className="text-slate-400 font-normal">{p.role}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {formData.selectedTeam.length < 2 && (
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <AlertTriangle size={12} className="text-orange-400" />
                                                        <p className="text-xs font-medium" style={{ color: ORANGE }}>
                                                            Select at least 2 providers for team assignment
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Engagement Duration</label>
                                    <select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                    >
                                        {DURATION_OPTIONS.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Budget / Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Rs. 5,000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                    />
                                </div>
                            </div>

                            <label
                                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                                    formData.recurring ? "bg-emerald-50/60 border-emerald-200" : "bg-emerald-50/30 border-emerald-100"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.recurring}
                                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm">
                                    <span className="font-bold text-emerald-800">Recurring service contract</span>
                                    <span className="text-emerald-700"> — Mark this as a repeating engagement</span>
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">SLA Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.slaDeadline}
                                        onChange={(e) => setFormData({ ...formData, slaDeadline: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Requested By</label>
                                    <input
                                        type="text"
                                        value={formData.requestedBy}
                                        onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Options Controls */}
                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
                            <button
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubmit}
                                disabled={!canSubmit}
                                className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${
                                    canSubmit ? "bg-[#e8683f] hover:bg-[#d45b34]" : "bg-orange-200 cursor-not-allowed"
                                }`}
                            >
                                Create Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* JOB DETAILS MODAL */}
            {selectedJob && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6 pb-0 border-b border-gray-100 shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-xl font-bold text-slate-900">{selectedJob.id}</h2>
                                        <span className="text-slate-300">·</span>
                                        <span className="text-base font-semibold text-slate-600">{selectedJob.category}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase ${getStatusStyles(selectedJob.status)}`}>
                                            {selectedJob.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {selectedJob.location} · Requested by{" "}
                                        <span className="font-semibold text-slate-700">{selectedJob.requestedBy}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-slate-100 rounded-lg shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex border-b border-gray-200 text-sm font-semibold gap-6 mt-5 overflow-x-auto">
                                {detailTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setModalSubTab(tab)}
                                        className={`pb-3 relative transition-colors whitespace-nowrap ${
                                            modalSubTab === tab ? "text-[#1e3a8a] font-bold" : "text-gray-400 hover:text-gray-700"
                                        }`}
                                    >
                                        {tab}
                                        {modalSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a8a]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                            {modalSubTab === "Summary" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Priority</p>
                                            <span
                                                className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded ${getPriorityStyles(selectedJob.priority)}`}
                                                style={selectedJob.priority === "HIGH" ? { color: ORANGE } : undefined}
                                            >
                                                {selectedJob.priority}
                                            </span>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Budget</p>
                                            <p className="text-lg font-extrabold text-slate-900 mt-1">Rs. {selectedJob.budget.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Duration</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1.5">{selectedJob.duration}</p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Providers Needed</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1.5">
                                                {selectedJob.assignmentMode === "Team"
                                                    ? `${Math.max(selectedJob.providers.length, 2)} providers`
                                                    : "1 provider"}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Recruitment</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1.5">
                                                {selectedJob.mode === "Direct" ? "Direct Assign" : "Open to Pool"}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Assignment Mode</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1.5">
                                                {selectedJob.assignmentMode === "Team" ? "Team Assignment" : "Single Provider"}
                                            </p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">SLA Deadline</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1.5">{selectedJob.sla}</p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs text-gray-400 font-medium">Requested By</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1.5">{selectedJob.requestedBy}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-xs text-gray-400 font-medium mb-2">Description</p>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedJob.description}</p>
                                    </div>

                                    {selectedJob.poolWarning && (
                                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                                            <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-amber-700 leading-relaxed">
                                                {selectedJob.poolWarning}{" "}
                                                <span className="font-bold underline cursor-pointer" style={{ color: ORANGE }}>
                                                    Browse Provider Directory →
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalSubTab === "Providers" && (
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
                                    {selectedJob.providers && selectedJob.providers.length > 0 ? (
                                        selectedJob.providers.map((p: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between border border-gray-100 p-4 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center font-bold">
                                                        {p.initial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{p.role}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${getProviderStatusStyles(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                                            <Users size={32} className="text-gray-300" />
                                            <p className="text-sm text-gray-500 font-medium">Waiting for pool providers to respond.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalSubTab === "Timeline" && (
                                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
                                    {selectedJob.timeline.map((step: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 relative">
                                            {idx < selectedJob.timeline.length - 1 && (
                                                <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gray-100" />
                                            )}
                                            <div
                                                className={`w-5 h-5 rounded-full z-10 shrink-0 flex items-center justify-center mt-0.5 ${
                                                    step.state === "active"
                                                        ? "bg-emerald-500"
                                                        : step.state === "done"
                                                            ? "bg-[#1e3a8a]"
                                                            : "bg-gray-200"
                                                }`}
                                            >
                                                {step.state !== "pending" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${step.state === "pending" ? "text-slate-400" : "text-slate-800"}`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 font-medium">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {modalSubTab === "Engagement" && (
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                            <Briefcase size={20} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {selectedJob.type === "Recurring"
                                                    ? "Recurring Job"
                                                    : selectedJob.type === "Dedicated"
                                                        ? "Dedicated Block"
                                                        : "One-off Job"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {selectedJob.type === "Recurring"
                                                    ? "Repeating engagement"
                                                    : selectedJob.type === "Dedicated"
                                                        ? "Reserved engagement"
                                                        : "Single service engagement"}
                                                , duration: {selectedJob.duration}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalSubTab === "Checklist" && (
                                <div className="space-y-4">
                                    <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm space-y-1.5">
                                        {selectedJob.checklist && selectedJob.checklist.length > 0 ? (
                                            selectedJob.checklist.map((item: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 text-sm text-slate-700 font-medium px-3 py-2.5 rounded-lg"
                                                >
                                                    {item.checked ? (
                                                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle size={18} className="text-slate-300 shrink-0" />
                                                    )}
                                                    <span className={item.checked ? "line-through text-gray-400" : ""}>{item.text}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 font-medium italic px-3 py-6 text-center">No checklist items for this job.</p>
                                        )}
                                    </div>
                                    {selectedJob.notes && (
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 mb-2">Notes</p>
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
                                                {selectedJob.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalSubTab === "Billing" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-xs text-gray-400 font-medium">Estimated Budget</p>
                                        <p className="text-lg font-bold text-slate-900 mt-1">Rs. {selectedJob.budget.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-xs text-gray-400 font-medium">Actual Cost</p>
                                        <p className="text-lg font-bold text-slate-900 mt-1">
                                            {selectedJob.actualCost ? `Rs. ${selectedJob.actualCost.toLocaleString()}` : "—"}
                                        </p>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-xs text-gray-400 font-medium">Payment Status</p>
                                        <span
                                            className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                                selectedJob.paymentStatus === "PAID"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : selectedJob.paymentStatus === "CANCELLED"
                                                        ? "bg-red-50 text-red-500"
                                                        : "bg-amber-50 text-amber-600"
                                            }`}
                                        >
                                            {selectedJob.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-xs text-gray-400 font-medium">Invoice</p>
                                        <p className="text-sm font-bold text-slate-800 mt-1.5">
                                            {selectedJob.invoice || <span className="italic text-slate-400 font-medium">Not yet generated</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="px-5 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#1e3a8a] hover:bg-[#152a66] transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <span>Advance Status</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}