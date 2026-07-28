"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
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
    AlertTriangle,
} from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import type { RootState } from "@/store"; // adjust to your store path

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Mock data (Organization Profile / Subscription / Notifications) ----------

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

// ---------- Team Members: real API types ----------

type ApiInviteStatus = "PENDING" | "ACCEPTED";
type ApiTeamRole = "ADMIN" | "MANAGER" | "STAFF" | "FINANCE";

interface TeamMemberResponse {
    id: number;
    fullName: string;
    email: string;
    role: ApiTeamRole;
    inviteStatus: ApiInviteStatus;
    invitedAt: string | null;
    lastActiveAt: string | null;
}

const roleDisplay: Record<ApiTeamRole, string> = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    STAFF: "Staff",
    FINANCE: "Finance",
};

const inviteStatusDisplay: Record<ApiInviteStatus, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
};

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

function timeAgo(iso: string | null): string {
    if (!iso) return "—";
    const then = new Date(iso).getTime();
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

function formatLastActive(m: TeamMemberResponse): string {
    if (m.inviteStatus === "PENDING") {
        return `Invite sent ${timeAgo(m.invitedAt)}`;
    }
    return timeAgo(m.lastActiveAt);
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    // Current logged-in user's role IN THIS WORKSPACE — drives who sees
    // the Invite / Edit / Delete controls below.
    const currentRole = useSelector((state: RootState) => state.proSession.role);
    const isAdmin = currentRole === "ADMIN";

    // ----- Organization Profile state (mock, unwired) -----
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

    // ----- Team Members state (wired to backend) -----
    const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [showPermissions, setShowPermissions] = useState(false);

    // Invite/Edit modal — same modal, two modes. `editingMember` set = edit mode.
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMemberResponse | null>(null);
    const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "Manager" });
    const [saving, setSaving] = useState(false);

    const [resendingId, setResendingId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // Delete confirmation
    const [memberToDelete, setMemberToDelete] = useState<TeamMemberResponse | null>(null);

    const fetchTeamMembers = useCallback(async () => {
        try {
            setLoadingTeam(true);
            const { data } = await api.get<TeamMemberResponse[]>("/business/team");
            setTeamMembers(data);
        } catch (error: any) {
            console.error("Fetch team members error:", error);
            toast.error(error?.response?.data?.message ?? "Could not load team members");
        } finally {
            setLoadingTeam(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "team") {
            fetchTeamMembers();
        }
    }, [activeTab, fetchTeamMembers]);

    const openInviteModal = () => {
        setEditingMember(null);
        setInviteForm({ email: "", name: "", role: "Manager" });
        setIsInviteOpen(true);
    };

    const openEditModal = (member: TeamMemberResponse) => {
        setEditingMember(member);
        setInviteForm({
            email: member.email,
            name: member.fullName,
            role: roleDisplay[member.role], // "Manager" / "Staff" / "Finance"
        });
        setIsInviteOpen(true);
    };

    const closeModal = () => {
        setIsInviteOpen(false);
        setEditingMember(null);
        setInviteForm({ email: "", name: "", role: "Manager" });
    };

    const handleSendInvitation = async () => {
        if (!inviteForm.email || !inviteForm.name) return;

        if (editingMember) {
            // ── Edit mode: PATCH fullName + role. Email is fixed (identity). ──
            try {
                setSaving(true);
                const { data } = await api.patch<TeamMemberResponse>(
                    `/business/team/${editingMember.id}`,
                    { fullName: inviteForm.name, role: inviteForm.role.toUpperCase() },
                );
                setTeamMembers((prev) => prev.map((m) => (m.id === editingMember.id ? data : m)));
                toast.success("Member updated");
                closeModal();
            } catch (error: any) {
                console.error("Update member error:", error);
                toast.error(error?.response?.data?.message ?? "Could not update member");
            } finally {
                setSaving(false);
            }
            return;
        }

        // ── Invite mode ──
        try {
            setSaving(true);
            const { data } = await api.post<TeamMemberResponse>("/business/team/invite", {
                fullName: inviteForm.name,
                email: inviteForm.email,
                role: inviteForm.role.toUpperCase(),
            });

            setTeamMembers((prev) => [...prev, data]);
            toast.success("Invitation sent successfully");
            closeModal();
        } catch (error: any) {
            console.error("Invite team member error:", error);
            toast.error(error?.response?.data?.message ?? "Could not send invitation");
        } finally {
            setSaving(false);
        }
    };

    const confirmRemoveMember = async () => {
        if (!memberToDelete) return;
        try {
            setRemovingId(memberToDelete.id);
            await api.delete(`/business/team/${memberToDelete.id}`);
            setTeamMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
            toast.success("Member removed");
            setMemberToDelete(null);
        } catch (error: any) {
            console.error("Remove member error:", error);
            toast.error(error?.response?.data?.message ?? "Could not remove member");
        } finally {
            setRemovingId(null);
        }
    };

    const resendInvite = async (id: number) => {
        try {
            setResendingId(id);
            const { data } = await api.post<TeamMemberResponse>(`/business/team/${id}/resend`);
            setTeamMembers((prev) => prev.map((m) => (m.id === id ? data : m)));
            toast.success("Invite resent successfully");
        } catch (error: any) {
            console.error("Resend invite error:", error);
            toast.error(error?.response?.data?.message ?? "Could not resend invite");
        } finally {
            setResendingId(null);
        }
    };

    // ----- Notifications state (mock, unwired) -----
    const [notifications, setNotifications] = useState(initialNotifications);

    const toggleNotification = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
    };

    const providerPct = Math.min((subscriptionUsage.providers.used / subscriptionUsage.providers.limit) * 100, 100);
    const providerOverLimit = subscriptionUsage.providers.used > subscriptionUsage.providers.limit;
    const storagePct = (subscriptionUsage.storage.usedGb / subscriptionUsage.storage.limitGb) * 100;

    return (
        <main className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Tab bar — horizontally scrollable on mobile, wraps on sm+ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-2 overflow-x-auto sm:flex-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 whitespace-nowrap ${
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

            {/* ================= ORGANIZATION PROFILE (mock, unwired) ================= */}
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
                            <div className="min-w-0">
                                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{orgProfile.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Mail size={15} className="text-slate-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{orgProfile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <FileText size={15} className="text-slate-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-400 font-medium">VAT/PAN Number</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{orgProfile.vatPan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Plan + workspace ID row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                <Crown size={15} className="text-slate-500" />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Current Plan</p>
                                    <p className="text-sm font-bold text-slate-800">{orgProfile.currentPlan}</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab("subscription")}
                                    className="text-xs font-bold px-2.5 py-1 rounded-md border whitespace-nowrap"
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
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-medium">Workspace ID</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{orgProfile.workspaceId}</p>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard?.writeText(orgProfile.workspaceId)}
                                    className="ml-auto w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 shrink-0"
                                    aria-label="Copy workspace ID"
                                >
                                    <Copy size={14} className="text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: NAVY }}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* ================= TEAM MEMBERS (wired) ================= */}
            {activeTab === "team" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between gap-3 p-6 pb-4 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
                        {/* Invite button — admin only */}
                        {isAdmin && (
                            <button
                                onClick={openInviteModal}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors w-full sm:w-auto"
                                style={{ backgroundColor: ORANGE }}
                            >
                                <Plus size={15} />
                                Invite Member
                            </button>
                        )}
                    </div>

                    {loadingTeam ? (
                        <div className="py-16 text-center text-sm text-slate-400 font-medium">Loading team members...</div>
                    ) : teamMembers.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-400 font-medium">No team members yet.</div>
                    ) : (
                        <>
                            {/* Desktop / tablet table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Name</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Role</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Email</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Last Active</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Invite Status</th>
                                        {/* Actions column — admin only */}
                                        {isAdmin && (
                                            <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Actions</th>
                                        )}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {teamMembers.map((m, idx) => {
                                        const roleLabel = roleDisplay[m.role];
                                        const statusLabel = inviteStatusDisplay[m.inviteStatus];
                                        return (
                                            <tr
                                                key={m.id}
                                                className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                                                    idx === teamMembers.length - 1 ? "border-b-0" : ""
                                                }`}
                                            >
                                                <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900">{m.fullName}</td>
                                                <td className="py-3.5 pr-4">
                                                        <span
                                                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRoleBadgeStyles(roleLabel)}`}
                                                            style={roleLabel === "Finance" ? { color: ORANGE } : undefined}
                                                        >
                                                            {roleLabel}
                                                        </span>
                                                </td>
                                                <td className="py-3.5 pr-4 font-medium" style={{ color: NAVY }}>
                                                    {m.email}
                                                </td>
                                                <td className="py-3.5 pr-4 text-slate-500 font-medium">{formatLastActive(m)}</td>
                                                <td className="py-3.5 pr-4">
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getInviteStatusStyles(statusLabel)}`}>
                                                            {statusLabel}
                                                        </span>
                                                </td>
                                                {isAdmin && (
                                                    <td className="py-3.5 pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {m.inviteStatus === "PENDING" && (
                                                                <button
                                                                    onClick={() => resendInvite(m.id)}
                                                                    disabled={resendingId === m.id}
                                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-50"
                                                                >
                                                                    {resendingId === m.id ? "Resending..." : "Resend Invite"}
                                                                </button>
                                                            )}
                                                            {m.role !== "ADMIN" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => openEditModal(m)}
                                                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                                                                        aria-label={`Edit ${m.fullName}`}
                                                                    >
                                                                        <Pencil size={13} className="text-slate-400" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setMemberToDelete(m)}
                                                                        disabled={removingId === m.id}
                                                                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50"
                                                                        aria-label={`Remove ${m.fullName}`}
                                                                    >
                                                                        <Trash2 size={13} className="text-slate-400 hover:text-red-500" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile card list */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {teamMembers.map((m) => {
                                    const roleLabel = roleDisplay[m.role];
                                    const statusLabel = inviteStatusDisplay[m.inviteStatus];
                                    return (
                                        <div key={m.id} className="p-4 space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{m.fullName}</p>
                                                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: NAVY }}>
                                                        {m.email}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${getRoleBadgeStyles(roleLabel)}`}
                                                    style={roleLabel === "Finance" ? { color: ORANGE } : undefined}
                                                >
                                                    {roleLabel}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getInviteStatusStyles(statusLabel)}`}>
                                                    {statusLabel}
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium">{formatLastActive(m)}</span>
                                            </div>

                                            {isAdmin && (m.inviteStatus === "PENDING" || m.role !== "ADMIN") && (
                                                <div className="flex items-center gap-2 pt-1">
                                                    {m.inviteStatus === "PENDING" && (
                                                        <button
                                                            onClick={() => resendInvite(m.id)}
                                                            disabled={resendingId === m.id}
                                                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {resendingId === m.id ? "Resending..." : "Resend Invite"}
                                                        </button>
                                                    )}
                                                    {m.role !== "ADMIN" && (
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(m)}
                                                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setMemberToDelete(m)}
                                                                disabled={removingId === m.id}
                                                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            >
                                                                {removingId === m.id ? "Removing..." : "Remove"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* View role permissions collapsible — untouched, mock table */}
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

            {/* ================= SUBSCRIPTION (mock, unwired) ================= */}
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
                                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
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
                                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
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
                                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
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
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap"
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

            {/* ================= NOTIFICATIONS (mock, unwired) ================= */}
            {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-5">Notification Preferences</h2>
                    <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <div key={n.id} className="flex items-center justify-between gap-4 py-5">
                                <div className="min-w-0">
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

            {/* ================= INVITE / EDIT TEAM MEMBER MODAL (wired) ================= */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingMember ? "Edit Team Member" : "Invite Team Member"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Work Email</label>
                                <input
                                    type="email"
                                    placeholder="colleague@yourorg.com"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    disabled={saving || !!editingMember}
                                    className="w-full text-slate-900 placeholder:text-slate-400 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50 disabled:bg-slate-50"
                                />
                                {editingMember && (
                                    <p className="text-xs text-slate-400 mt-1.5">Email can't be changed after inviting.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Priya Sharma"
                                    value={inviteForm.name}
                                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                                    disabled={saving}
                                    className="w-full text-slate-900 placeholder:text-slate-400  rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Role</label>
                                <select
                                    value={inviteForm.role}
                                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                    disabled={saving}
                                    className="w-full text-slate-900 placeholder:text-slate-400  rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
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

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 flex-wrap">
                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendInvitation}
                                disabled={!inviteForm.email || !inviteForm.name || saving}
                                className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors ${
                                    !inviteForm.email || !inviteForm.name || saving ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                style={{ backgroundColor: ORANGE }}
                            >
                                {saving
                                    ? editingMember
                                        ? "Saving..."
                                        : "Sending..."
                                    : editingMember
                                        ? "Save Changes"
                                        : "Send Invitation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELETE CONFIRMATION MODAL ================= */}
            {memberToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Remove team member?</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Are you sure you want to remove{" "}
                                    <span className="font-semibold text-slate-700">{memberToDelete.fullName}</span> from
                                    this workspace? They'll immediately lose access, and this can't be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 flex-wrap">
                            <button
                                onClick={() => setMemberToDelete(null)}
                                disabled={removingId === memberToDelete.id}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveMember}
                                disabled={removingId === memberToDelete.id}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors disabled:opacity-50"
                            >
                                {removingId === memberToDelete.id ? "Removing..." : "Yes, Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}