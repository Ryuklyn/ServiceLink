"use client";

import React, { useState } from "react";
import {
    Building2,
    Users,
    CreditCard,
    Bell,
    Pencil,
    Upload,
    X,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Copy,
    Crown,
    Hash,
    Phone,
    Mail,
    FileText,
} from "lucide-react";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Mock data, mirroring the reference screens ----------

const initialOrgProfile = {
    name: "Hotel Annapurna",
    branch: "Thamel, Kathmandu",
    services: ["HVAC", "Electrical", "Cleaning", "Plumbing"],
    phone: "+977-1-4221711",
    email: "rajesh@hotelannapurna.com",
    vatPan: "987654321",
    currentPlan: "Growth Plan — Rs. 4,000/mo",
    workspaceId: "ws-001",
};

const ALL_SERVICE_OPTIONS = ["HVAC", "Electrical", "Cleaning", "Plumbing", "Security", "Pest Control"];

const initialTeamMembers = [
    { id: "t1", name: "Rajesh Shrestha", role: "Admin", email: "rajesh@hotelannapurna.com", lastActive: "2 hours ago", inviteStatus: "Accepted" },
    { id: "t2", name: "Priya Sharma", role: "Staff", email: "priya@hotelannapurna.com", lastActive: "30 minutes ago", inviteStatus: "Accepted" },
    { id: "t3", name: "Arun KC", role: "Finance", email: "arun@hotelannapurna.com", lastActive: "Yesterday", inviteStatus: "Accepted" },
    { id: "t4", name: "Sunita Paudel", role: "Staff", email: "sunita@hotelannapurna.com", lastActive: "1 hour ago", inviteStatus: "Accepted" },
    { id: "t5", name: "Mohan Thapa", role: "Manager", email: "mohan@hotelannapurna.com", lastActive: "Invite sent 3 days ago", inviteStatus: "Pending" },
];

const PERMISSION_ROWS = [
    { action: "Create job tickets", Admin: true, Manager: true, Staff: true, Finance: false },
    { action: "Assign providers", Admin: true, Manager: true, Staff: false, Finance: false },
    { action: "View SLA dashboard", Admin: true, Manager: true, Staff: false, Finance: false },
    { action: "View & pay invoices", Admin: true, Manager: false, Staff: false, Finance: true },
    { action: "Manage provider pool", Admin: true, Manager: true, Staff: false, Finance: false },
    { action: "View audit log", Admin: true, Manager: true, Staff: false, Finance: true },
    { action: "Invite team members", Admin: true, Manager: false, Staff: false, Finance: false },
    { action: "Workspace settings", Admin: true, Manager: false, Staff: false, Finance: false },
];

const ROLE_OPTIONS = ["Manager", "Staff", "Finance"];

const subscriptionUsage = {
    plan: "Growth",
    renewalDate: "January 15, 2025",
    priceLabel: "Rs. 4,000/month",
    providers: { used: 34, limit: 30 },
    jobsThisMonth: { used: 127, limit: null }, // null = unlimited
    storage: { usedGb: 2.3, limitGb: 10 },
};

const plans = [
    {
        name: "Starter",
        price: "Rs. 1,000",
        period: "/mo",
        features: ["Up to 10 providers", "50 jobs/month", "Basic SLA tracking", "Email support"],
        cta: "Downgrade",
        isCurrent: false,
        tier: "starter",
    },
    {
        name: "Growth",
        price: "Rs. 4,000",
        period: "/mo",
        features: [
            "Up to 30 providers",
            "Unlimited jobs",
            "Advanced SLA + analytics",
            "CSV bulk import",
            "Compliance module",
            "Priority support",
        ],
        cta: "Current Plan",
        isCurrent: true,
        tier: "growth",
    },
    {
        name: "Enterprise",
        price: "Rs. 12,000",
        period: "/mo",
        features: [
            "Unlimited providers",
            "Unlimited jobs",
            "Custom SLA rules",
            "API access",
            "White-label option",
            "Dedicated manager",
            "Custom integrations",
        ],
        cta: "Upgrade to Enterprise",
        isCurrent: false,
        tier: "enterprise",
    },
];

const initialNotifications = [
    { id: "n1", title: "SLA breach alerts", desc: "Get notified when a job exceeds its SLA deadline", enabled: true },
    { id: "n2", title: "New job requests", desc: "Notify when staff submit new service requests", enabled: true },
    { id: "n3", title: "Invoice due reminders", desc: "Reminder 3 days before invoice due date", enabled: true },
    { id: "n4", title: "Provider KYB expiry", desc: "Alert when a provider's KYB verification is expiring", enabled: false },
    { id: "n5", title: "New provider onboarding", desc: "Notify when a provider accepts your onboarding invite", enabled: true },
    { id: "n6", title: "Weekly summary report", desc: "Email summary of job stats every Monday", enabled: true },
    { id: "n7", title: "Monthly billing statement", desc: "Detailed billing summary at month end", enabled: false },
];

const TABS = [
    { key: "profile", label: "Organization Profile", icon: Building2 },
    { key: "team", label: "Team Members", icon: Users },
    { key: "subscription", label: "Subscription", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell },
];

const getRoleBadgeStyles = (role: string) => {
    if (role === "Admin") return "bg-slate-100 text-slate-700";
    if (role === "Manager") return "bg-blue-50 text-[#1e3a8a]";
    if (role === "Finance") return "bg-orange-50";
    return "bg-slate-100 text-slate-600"; // Staff
};

const getInviteStatusStyles = (status: string) => {
    if (status === "Accepted") return "bg-emerald-50 text-emerald-600";
    if (status === "Pending") return "bg-amber-50 text-amber-600";
    return "bg-slate-100 text-slate-600";
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    // ----- Organization Profile state -----
    const [orgProfile, setOrgProfile] = useState(initialOrgProfile);
    const [newService, setNewService] = useState("");
    const [showServiceInput, setShowServiceInput] = useState(false);

    const removeService = (service: string) => {
        setOrgProfile((prev) => ({ ...prev, services: prev.services.filter((s) => s !== service) }));
    };

    const addService = (service: string) => {
        if (service && !orgProfile.services.includes(service)) {
            setOrgProfile((prev) => ({ ...prev, services: [...prev.services, service] }));
        }
        setNewService("");
        setShowServiceInput(false);
    };

    // ----- Team Members state -----
    const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
    const [showPermissions, setShowPermissions] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "Manager" });

    const handleSendInvitation = () => {
        if (!inviteForm.email || !inviteForm.name) return;
        const newMember = {
            id: `t${teamMembers.length + 1}`,
            name: inviteForm.name,
            role: inviteForm.role,
            email: inviteForm.email,
            lastActive: "Invite sent just now",
            inviteStatus: "Pending",
        };
        setTeamMembers([...teamMembers, newMember]);
        setIsInviteOpen(false);
        setInviteForm({ email: "", name: "", role: "Manager" });
    };

    const removeMember = (id: string) => {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const resendInvite = (id: string) => {
        setTeamMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, lastActive: "Invite sent just now" } : m))
        );
    };

    // ----- Notifications state -----
    const [notifications, setNotifications] = useState(initialNotifications);

    const toggleNotification = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
    };

    const providerPct = Math.min((subscriptionUsage.providers.used / subscriptionUsage.providers.limit) * 100, 100);
    const providerOverLimit = subscriptionUsage.providers.used > subscriptionUsage.providers.limit;
    const storagePct = (subscriptionUsage.storage.usedGb / subscriptionUsage.storage.limitGb) * 100;

    return (
        <main className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-wrap gap-2">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                active ? "text-white" : "text-slate-500 hover:bg-slate-50"
                            }`}
                            style={active ? { backgroundColor: NAVY } : undefined}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ================= ORGANIZATION PROFILE ================= */}
            {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Organization Profile</h2>
                        <p className="text-sm text-slate-400 mt-0.5">Manage your organization's information and workspace details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
                        {/* Logo uploader */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Organization Logo</label>
                            <div className="relative w-full aspect-square rounded-2xl border border-gray-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
                                <div className="text-center px-4">
                                    <p className="font-extrabold text-lg leading-tight" style={{ color: NAVY }}>
                                        HOTEL
                                    </p>
                                    <p className="font-extrabold text-lg leading-tight" style={{ color: NAVY }}>
                                        ANNAPURNA
                                    </p>
                                </div>
                                <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-slate-50">
                                    <Pencil size={13} className="text-slate-500" />
                                </button>
                            </div>
                            <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                <Upload size={14} />
                                Upload or Change
                            </button>
                            <p className="text-xs text-slate-400 mt-2">JPG, PNG or SVG. Max size 2MB.</p>
                        </div>

                        {/* Right column fields */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Organization Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={orgProfile.name}
                                            onChange={(e) => setOrgProfile({ ...orgProfile, name: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 pr-9 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                        />
                                        <Pencil size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Primary Branch</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={orgProfile.branch}
                                            onChange={(e) => setOrgProfile({ ...orgProfile, branch: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 pr-9 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                        />
                                        <Pencil size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Services</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {orgProfile.services.map((service) => (
                                        <span
                                            key={service}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold"
                                        >
                                            {service}
                                            <button onClick={() => removeService(service)} className="text-slate-400 hover:text-slate-700">
                                                <X size={13} />
                                            </button>
                                        </span>
                                    ))}

                                    {showServiceInput ? (
                                        <select
                                            autoFocus
                                            value={newService}
                                            onChange={(e) => addService(e.target.value)}
                                            onBlur={() => setShowServiceInput(false)}
                                            className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-[#1e3a8a]"
                                        >
                                            <option value="">Select service...</option>
                                            {ALL_SERVICE_OPTIONS.filter((s) => !orgProfile.services.includes(s)).map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <button
                                            onClick={() => setShowServiceInput(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <Plus size={13} />
                                            Add Service
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact info row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Phone size={15} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                <p className="text-sm font-bold text-slate-800">{orgProfile.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Mail size={15} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                <p className="text-sm font-bold text-slate-800">{orgProfile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <FileText size={15} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">VAT/PAN Number</p>
                                <p className="text-sm font-bold text-slate-800">{orgProfile.vatPan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Plan + workspace ID row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Crown size={15} className="text-slate-500" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Current Plan</p>
                                    <p className="text-sm font-bold text-slate-800">{orgProfile.currentPlan}</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab("subscription")}
                                    className="text-xs font-bold px-2.5 py-1 rounded-md border"
                                    style={{ color: ORANGE, borderColor: "#fed7aa" }}
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Hash size={15} className="text-slate-500" />
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Workspace ID</p>
                                    <p className="text-sm font-bold text-slate-800">{orgProfile.workspaceId}</p>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard?.writeText(orgProfile.workspaceId)}
                                    className="ml-auto w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50"
                                    aria-label="Copy workspace ID"
                                >
                                    <Copy size={14} className="text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: NAVY }}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* ================= TEAM MEMBERS ================= */}
            {activeTab === "team" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
                        <button
                            onClick={() => setIsInviteOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: ORANGE }}
                        >
                            <Plus size={15} />
                            Invite Member
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-100 text-left">
                                <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Name</th>
                                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Role</th>
                                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Email</th>
                                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Last Active</th>
                                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Invite Status</th>
                                <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {teamMembers.map((m, idx) => (
                                <tr
                                    key={m.id}
                                    className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                                        idx === teamMembers.length - 1 ? "border-b-0" : ""
                                    }`}
                                >
                                    <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900">{m.name}</td>
                                    <td className="py-3.5 pr-4">
                                            <span
                                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRoleBadgeStyles(m.role)}`}
                                                style={m.role === "Finance" ? { color: ORANGE } : undefined}
                                            >
                                                {m.role}
                                            </span>
                                    </td>
                                    <td className="py-3.5 pr-4 font-medium" style={{ color: NAVY }}>
                                        {m.email}
                                    </td>
                                    <td className="py-3.5 pr-4 text-slate-500 font-medium">{m.lastActive}</td>
                                    <td className="py-3.5 pr-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getInviteStatusStyles(m.inviteStatus)}`}>
                                                {m.inviteStatus}
                                            </span>
                                    </td>
                                    <td className="py-3.5 pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {m.inviteStatus === "Pending" && (
                                                <button
                                                    onClick={() => resendInvite(m.id)}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                                                >
                                                    Resend Invite
                                                </button>
                                            )}
                                            <button
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                                aria-label={`Edit ${m.name}`}
                                            >
                                                <Pencil size={13} className="text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => removeMember(m.id)}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors"
                                                aria-label={`Remove ${m.name}`}
                                            >
                                                <Trash2 size={13} className="text-slate-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* View role permissions collapsible */}
                    <div className="border-t border-gray-100">
                        <button
                            onClick={() => setShowPermissions(!showPermissions)}
                            className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold border-l-4"
                            style={{ color: NAVY, borderLeftColor: NAVY, backgroundColor: "#f8fafc" }}
                        >
                            <span>View role permissions</span>
                            {showPermissions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showPermissions && (
                            <div className="px-6 pb-6 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Action</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Admin</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Manager</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Staff</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Finance</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {PERMISSION_ROWS.map((row) => (
                                        <tr key={row.action} className="border-b border-gray-50 last:border-b-0">
                                            <td className="py-3 pr-4 font-semibold" style={{ color: NAVY }}>
                                                {row.action}
                                            </td>
                                            {(["Admin", "Manager", "Staff", "Finance"] as const).map((role) => (
                                                <td key={role} className="py-3 pr-4 text-center">
                                                    {row[role] ? (
                                                        <span className="text-emerald-500 font-bold">✓</span>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= SUBSCRIPTION ================= */}
            {activeTab === "subscription" && (
                <div className="space-y-6">
                    {/* Usage card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Current Plan: {subscriptionUsage.plan}</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Renewal date: {subscriptionUsage.renewalDate}</p>
                            </div>
                            <p className="text-2xl font-extrabold text-slate-900">
                                {subscriptionUsage.priceLabel.split("/")[0]}
                                <span className="text-base font-semibold text-slate-400">/{subscriptionUsage.priceLabel.split("/")[1]}</span>
                            </p>
                        </div>

                        <div className="space-y-5 mt-6">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-semibold text-slate-700">Providers</span>
                                    <span className="text-sm font-bold" style={{ color: providerOverLimit ? ORANGE : "#0f172a" }}>
                                        {subscriptionUsage.providers.used} / {subscriptionUsage.providers.limit}
                                        {providerOverLimit ? " (over limit)" : ""}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${providerPct}%`, backgroundColor: providerOverLimit ? ORANGE : NAVY }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-semibold text-slate-700">Jobs this month</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {subscriptionUsage.jobsThisMonth.used} / {subscriptionUsage.jobsThisMonth.limit ?? "Unlimited"}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: "42%", backgroundColor: NAVY }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-semibold text-slate-700">Storage</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {subscriptionUsage.storage.usedGb} GB / {subscriptionUsage.storage.limitGb} GB
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${storagePct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative bg-white rounded-2xl border p-6 shadow-sm flex flex-col ${
                                    plan.isCurrent ? "shadow-md" : "border-gray-100"
                                }`}
                                style={plan.isCurrent ? { borderColor: NAVY, borderWidth: 2 } : undefined}
                            >
                                {plan.isCurrent && (
                                    <span
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full"
                                        style={{ backgroundColor: NAVY }}
                                    >
                                        Current Plan
                                    </span>
                                )}
                                <p className="text-base font-bold text-slate-900 mt-2">{plan.name}</p>
                                <p className="text-3xl font-extrabold text-slate-900 mt-2">
                                    {plan.price}
                                    <span className="text-base font-semibold text-slate-400">{plan.period}</span>
                                </p>
                                <ul className="space-y-2.5 mt-5 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    disabled={plan.isCurrent}
                                    className={`mt-6 w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                        plan.isCurrent
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : plan.tier === "starter"
                                                ? "bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-not-allowed"
                                                : "text-white shadow-sm"
                                    }`}
                                    style={!plan.isCurrent && plan.tier === "enterprise" ? { backgroundColor: ORANGE } : undefined}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= NOTIFICATIONS ================= */}
            {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-5">Notification Preferences</h2>
                    <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <div key={n.id} className="flex items-center justify-between gap-4 py-5">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{n.title}</p>
                                    <p className="text-sm text-slate-400 mt-0.5">{n.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(n.id)}
                                    className="relative w-12 h-6 rounded-full shrink-0 transition-colors"
                                    style={{ backgroundColor: n.enabled ? NAVY : "#cbd5e1" }}
                                    aria-pressed={n.enabled}
                                    aria-label={`Toggle ${n.title}`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                            n.enabled ? "translate-x-6" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= INVITE TEAM MEMBER MODAL ================= */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
                            <h2 className="text-lg font-bold text-slate-900">Invite Team Member</h2>
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Work Email</label>
                                <input
                                    type="email"
                                    placeholder="colleague@yourorg.com"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Priya Sharma"
                                    value={inviteForm.name}
                                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Role</label>
                                <select
                                    value={inviteForm.role}
                                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1.5">Admin role is reserved for the workspace owner (KYB registrant).</p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendInvitation}
                                disabled={!inviteForm.email || !inviteForm.name}
                                className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors ${
                                    !inviteForm.email || !inviteForm.name ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                style={{ backgroundColor: ORANGE }}
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}