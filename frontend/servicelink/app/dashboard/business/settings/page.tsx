"use client";

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Building2, Users, CreditCard, Bell, Pencil, Upload, X, Plus, Trash2,
    ChevronDown, ChevronUp, Copy, Crown, Hash, Phone, Mail, AlertTriangle,
} from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import type { RootState } from "@/store";
import { getOrganization, updateOrganization, uploadOrgLogo, getWorkspace, updateWorkspace } from "@/lib/api/organizationApi";
import { getSubscriptionByWorkspace, verifyPayment } from "@/lib/api/proSubscriptionApi"; // confirm this filename matches your repo — see note below
import PaymentModal from "@/components/business/payment/PaymentModal";
import type { PlanCheckout } from "@/components/business/PlanStep";
import type { OrganizationResponse, WorkspaceResponse, SubscriptionResponse, PlanType } from "@/types/business";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

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

const PLAN_TYPE_TO_TIER: Record<PlanType, "starter" | "growth" | "enterprise"> = {
    STARTER: "starter", GROWTH: "growth", ENTERPRISE: "enterprise",
};

// ⚠️ Prices + PlanCheckout MUST mirror backend PlanPricing.PRICE_NPR exactly.
// Backend re-derives the charge from these amounts server-side — client
// amount is only used to resolve which plan, never trusted as the charge.
const TIER_TO_PLAN_CHECKOUT: Record<"starter" | "growth", PlanCheckout> = {
    starter: { id: "starter", name: "Starter", price: "NPR 1,999", priceLabel: "per month", amountNpr: 1999 },
    growth: { id: "growth", name: "Growth", price: "NPR 4,999", priceLabel: "per month", amountNpr: 4999 },
};

const plans = [
    { name: "Starter", price: "NPR 1,999", period: "/mo", tier: "starter" as const,
        features: ["14-day free trial", "1 branch location", "Up to 3 team members", "Basic service requests", "Email notifications"] },
    { name: "Growth", price: "NPR 4,999", period: "/mo", tier: "growth" as const,
        features: ["Up to 20 team members", "Up to 10 branch locations", "Vendor verification", "Analytics & reporting", "Asset tracking"] },
    { name: "Enterprise", price: "Custom", period: "", tier: "enterprise" as const,
        features: ["Unlimited members", "Unlimited branches", "Dedicated Support", "Advanced Analytics", "Custom Integrations"] },
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

const roleDisplay: Record<ApiTeamRole, string> = { ADMIN: "Admin", MANAGER: "Manager", STAFF: "Staff", FINANCE: "Finance" };
const inviteStatusDisplay: Record<ApiInviteStatus, string> = { PENDING: "Pending", ACCEPTED: "Accepted" };

const getRoleBadgeStyles = (role: string) => {
    if (role === "Admin") return "bg-slate-100 text-slate-700";
    if (role === "Manager") return "bg-blue-50 text-[#1e3a8a]";
    if (role === "Finance") return "bg-orange-50";
    return "bg-slate-100 text-slate-600";
};

const getInviteStatusStyles = (status: string) => {
    if (status === "Accepted") return "bg-emerald-50 text-emerald-600";
    if (status === "Pending") return "bg-amber-50 text-amber-600";
    return "bg-slate-100 text-slate-600";
};

function timeAgo(iso: string | null): string {
    if (!iso) return "—";
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days} days ago`;
}

function formatLastActive(m: TeamMemberResponse): string {
    return m.inviteStatus === "PENDING" ? `Invite sent ${timeAgo(m.invitedAt)}` : timeAgo(m.lastActiveAt);
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading settings...</div>}>
            <SettingsPageContent />
        </Suspense>
    );
}

function SettingsPageContent() {
    const [activeTab, setActiveTab] = useState("profile");
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentRole = useSelector((state: RootState) => state.proSession.role);
    const isAdmin = currentRole === "ADMIN";
    const { organizationId, workspaceId, planType, subscriptionStatus, trialEndsAt } =
        useSelector((s: RootState) => s.proSession);

    // ===================== ORGANIZATION PROFILE =====================
    const [org, setOrg] = useState<OrganizationResponse | null>(null);
    const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ companyName: "", contactNumber: "", primaryBranchLocation: "" });
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [draftServices, setDraftServices] = useState<string[]>([]);
    const [newService, setNewService] = useState("");
    const [showServiceInput, setShowServiceInput] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!organizationId || !workspaceId) return;
        try {
            setLoadingProfile(true);
            const [orgData, wsData] = await Promise.all([getOrganization(organizationId), getWorkspace(workspaceId)]);
            setOrg(orgData);
            setWorkspace(wsData);
            setDraftServices(wsData.preferredServices ?? []);
            setProfileForm({ companyName: orgData.companyName, contactNumber: orgData.contactNumber, primaryBranchLocation: wsData.primaryBranchLocation });
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Could not load organization profile");
        } finally {
            setLoadingProfile(false);
        }
    }, [organizationId, workspaceId]);

    useEffect(() => { if (activeTab === "profile" && !org) fetchProfile(); }, [activeTab, org, fetchProfile]);

    const handleLogoUpload = async (file: File) => {
        if (!organizationId || !isAdmin) return;
        try {
            setUploadingLogo(true);
            setOrg(await uploadOrgLogo(organizationId, file));
            toast.success("Logo updated");
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Could not upload logo");
        } finally {
            setUploadingLogo(false);
        }
    };

    const saveProfile = async () => {
        if (!organizationId || !workspaceId) return;
        try {
            setSavingProfile(true);
            const [orgData, wsData] = await Promise.all([
                updateOrganization(organizationId, { companyName: profileForm.companyName, contactNumber: profileForm.contactNumber }),
                updateWorkspace(workspaceId, { primaryBranchLocation: profileForm.primaryBranchLocation, preferredServices: draftServices }),
            ]);
            setOrg(orgData);
            setWorkspace(wsData);
            setIsEditingProfile(false);
            toast.success("Organization profile updated");
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? "Could not save changes");
        } finally {
            setSavingProfile(false);
        }
    };

    const removeDraftService = (s: string) => setDraftServices((prev) => prev.filter((x) => x !== s));
    const addDraftService = (s: string) => {
        if (s && !draftServices.includes(s)) setDraftServices((prev) => [...prev, s]);
        setNewService("");
        setShowServiceInput(false);
    };

    // ===================== TEAM MEMBERS =====================
    const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [showPermissions, setShowPermissions] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMemberResponse | null>(null);
    const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "Manager" });
    const [saving, setSaving] = useState(false);
    const [resendingId, setResendingId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<TeamMemberResponse | null>(null);

    const fetchTeamMembers = useCallback(async () => {
        try {
            setLoadingTeam(true);
            const { data } = await api.get<TeamMemberResponse[]>("/business/team");
            setTeamMembers(data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Could not load team members");
        } finally {
            setLoadingTeam(false);
        }
    }, []);

    useEffect(() => { if (activeTab === "team") fetchTeamMembers(); }, [activeTab, fetchTeamMembers]);

    const openInviteModal = () => { setEditingMember(null); setInviteForm({ email: "", name: "", role: "Manager" }); setIsInviteOpen(true); };
    const openEditModal = (member: TeamMemberResponse) => {
        setEditingMember(member);
        setInviteForm({ email: member.email, name: member.fullName, role: roleDisplay[member.role] });
        setIsInviteOpen(true);
    };
    const closeModal = () => { setIsInviteOpen(false); setEditingMember(null); setInviteForm({ email: "", name: "", role: "Manager" }); };

    const handleSendInvitation = async () => {
        if (!inviteForm.email || !inviteForm.name) return;
        if (editingMember) {
            try {
                setSaving(true);
                const { data } = await api.patch<TeamMemberResponse>(`/business/team/${editingMember.id}`, {
                    fullName: inviteForm.name, role: inviteForm.role.toUpperCase(),
                });
                setTeamMembers((prev) => prev.map((m) => (m.id === editingMember.id ? data : m)));
                toast.success("Member updated");
                closeModal();
            } catch (error: any) {
                toast.error(error?.response?.data?.message ?? "Could not update member");
            } finally {
                setSaving(false);
            }
            return;
        }
        try {
            setSaving(true);
            const { data } = await api.post<TeamMemberResponse>("/business/team/invite", {
                fullName: inviteForm.name, email: inviteForm.email, role: inviteForm.role.toUpperCase(),
            });
            setTeamMembers((prev) => [...prev, data]);
            toast.success("Invitation sent successfully");
            closeModal();
        } catch (error: any) {
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
            toast.error(error?.response?.data?.message ?? "Could not resend invite");
        } finally {
            setResendingId(null);
        }
    };

    // ===================== SUBSCRIPTION =====================
    const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"starter" | "growth" | null>(null); // enterprise excluded — not self-serve payable
    const [paymentBanner, setPaymentBanner] = useState<{ type: "success" | "failed"; message: string } | null>(null);
    const paymentCheckStarted = useRef(false);

    const fetchSubscription = useCallback(async () => {
        if (!workspaceId) return;
        try {
            setLoadingSubscription(true);
            setSubscription(await getSubscriptionByWorkspace(workspaceId));
        } catch (e: any) {
            if (e?.response?.status !== 404) toast.error("Could not load subscription");
        } finally {
            setLoadingSubscription(false);
        }
    }, [workspaceId]);

    useEffect(() => { if (activeTab === "subscription" && !subscription) fetchSubscription(); }, [activeTab, subscription, fetchSubscription]);

    // Detect tab param + gateway return on mount, run once
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam) setActiveTab(tabParam);

        const result = searchParams.get("paymentResult");
        if (!result || paymentCheckStarted.current) return;
        paymentCheckStarted.current = true;

        (async () => {
            if (result === "success") {
                try {
                    const res = await verifyPayment(searchParams);
                    if (res.verified) {
                        setPaymentBanner({ type: "success", message: "Payment verified — your plan is now active." });
                        await fetchSubscription(); // re-pulls real planType/status/amountNpr set by backend activateAfterPayment
                    } else {
                        setPaymentBanner({ type: "failed", message: res.error ?? "We received a response but couldn't verify it. Contact support with your reference ID." });
                    }
                } catch (e: any) {
                    setPaymentBanner({ type: "failed", message: e?.response?.data?.message ?? "Verification failed." });
                }
            } else {
                setPaymentBanner({ type: "failed", message: "Payment was not completed. You can try again below." });
            }
            router.replace(`${window.location.pathname}?tab=subscription`);
        })();
    }, [searchParams, router, fetchSubscription]);

    const effectivePlanType = (planType as PlanType | null) ?? subscription?.planType ?? null;
    const effectiveStatus = subscriptionStatus ?? subscription?.status ?? null;
    const effectiveTrialEndsAt = trialEndsAt ?? subscription?.trialEndsAt ?? null;
    const isTrialing = effectiveStatus === "TRIAL";

    const daysRemaining = effectiveTrialEndsAt
        ? Math.max(0, Math.ceil((new Date(effectiveTrialEndsAt).getTime() - Date.now()) / 86_400_000))
        : null;

    const selectTier = (tier: "starter" | "growth" | "enterprise") => {
        if (tier === "enterprise") {
            toast.error("Enterprise plan requires manual contact — reach out to sales");
            return;
        }
        setSelectedTier(tier);
    };

    // ===================== NOTIFICATIONS =====================
    const [notifications, setNotifications] = useState(initialNotifications);
    const toggleNotification = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));

    return (
        <main className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-2 overflow-x-auto sm:flex-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 whitespace-nowrap ${active ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
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
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Organization Profile</h2>
                            <p className="text-sm text-slate-400 mt-0.5">Manage your organization's information and workspace details</p>
                        </div>
                        {isAdmin && !isEditingProfile && org && (
                            <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-slate-700 hover:bg-slate-50">
                                <Pencil size={13} /> Edit
                            </button>
                        )}
                    </div>

                    {loadingProfile || !org || !workspace ? (
                        <div className="py-16 text-center text-sm text-slate-400 font-medium">Loading profile...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Organization Logo</label>
                                    <div className="relative w-full aspect-square rounded-2xl border border-gray-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
                                        {org.logoUrl ? (
                                            <img src={org.logoUrl} alt="Organization logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center px-4">
                                                <Building2 size={28} className="text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs font-semibold text-slate-400">No logo uploaded</p>
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <label className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-slate-50 cursor-pointer">
                                                <Pencil size={13} className="text-slate-500" />
                                                <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                                            </label>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <label className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <Upload size={14} />
                                            {uploadingLogo ? "Uploading..." : "Upload or Change"}
                                            <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" disabled={uploadingLogo} onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                                        </label>
                                    )}
                                    <p className="text-xs text-slate-400 mt-2">JPG or PNG. Max size 10MB.</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Organization Name</label>
                                            <input
                                                type="text"
                                                value={isEditingProfile ? profileForm.companyName : org.companyName}
                                                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:bg-slate-50 disabled:text-slate-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Primary Branch</label>
                                            <input
                                                type="text"
                                                value={isEditingProfile ? profileForm.primaryBranchLocation : workspace.primaryBranchLocation}
                                                onChange={(e) => setProfileForm({ ...profileForm, primaryBranchLocation: e.target.value })}
                                                disabled={!isEditingProfile}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:bg-slate-50 disabled:text-slate-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Services</label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(isEditingProfile ? draftServices : workspace.preferredServices).map((service) => (
                                                <span key={service} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                                                    {service}
                                                    {isEditingProfile && (
                                                        <button onClick={() => removeDraftService(service)} className="text-slate-400 hover:text-slate-700">
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                            {isEditingProfile &&
                                                (showServiceInput ? (
                                                    <select
                                                        autoFocus
                                                        value={newService}
                                                        onChange={(e) => addDraftService(e.target.value)}
                                                        onBlur={() => setShowServiceInput(false)}
                                                        className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-[#1e3a8a]"
                                                    >
                                                        <option value="">Select service...</option>
                                                        {ALL_SERVICE_OPTIONS.filter((s) => !draftServices.includes(s)).map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <button onClick={() => setShowServiceInput(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                                                        <Plus size={13} /> Add Service
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                        <Phone size={15} className="text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                        {isEditingProfile ? (
                                            <input
                                                type="text"
                                                value={profileForm.contactNumber}
                                                onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                                                className="text-sm font-bold text-slate-800 border border-gray-200 rounded-lg px-2 py-1 w-full"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 truncate">{org.contactNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                        <Mail size={15} className="text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{org.workEmail}</p>
                                        <p className="text-[11px] text-slate-400">Login email — not editable here</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                                        <Crown size={15} className="text-slate-500" />
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Current Plan</p>
                                            <p className="text-sm font-bold text-slate-800">{isTrialing ? "Free Trial" : effectivePlanType ?? "—"}</p>
                                        </div>
                                        <button onClick={() => setActiveTab("subscription")} className="text-xs font-bold px-2.5 py-1 rounded-md border whitespace-nowrap" style={{ color: ORANGE, borderColor: "#fed7aa" }}>
                                            Manage Plan
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
                                            <p className="text-sm font-bold text-slate-800 truncate">ws-{workspace.id}</p>
                                        </div>
                                        <button onClick={() => navigator.clipboard?.writeText(String(workspace.id))} className="ml-auto w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 shrink-0">
                                            <Copy size={14} className="text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isEditingProfile && (
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => { setIsEditingProfile(false); fetchProfile(); }} disabled={savingProfile} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
                                        Cancel
                                    </button>
                                    <button onClick={saveProfile} disabled={savingProfile} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-50" style={{ backgroundColor: NAVY }}>
                                        {savingProfile ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ================= TEAM MEMBERS ================= */}
            {activeTab === "team" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between gap-3 p-6 pb-4 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
                        {isAdmin && (
                            <button onClick={openInviteModal} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors w-full sm:w-auto" style={{ backgroundColor: ORANGE }}>
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
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Name</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Role</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Email</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Last Active</th>
                                        <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Invite Status</th>
                                        {isAdmin && <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Actions</th>}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {teamMembers.map((m, idx) => {
                                        const roleLabel = roleDisplay[m.role];
                                        const statusLabel = inviteStatusDisplay[m.inviteStatus];
                                        return (
                                            <tr key={m.id} className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${idx === teamMembers.length - 1 ? "border-b-0" : ""}`}>
                                                <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900">{m.fullName}</td>
                                                <td className="py-3.5 pr-4">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRoleBadgeStyles(roleLabel)}`} style={roleLabel === "Finance" ? { color: ORANGE } : undefined}>{roleLabel}</span>
                                                </td>
                                                <td className="py-3.5 pr-4 font-medium" style={{ color: NAVY }}>{m.email}</td>
                                                <td className="py-3.5 pr-4 text-slate-500 font-medium">{formatLastActive(m)}</td>
                                                <td className="py-3.5 pr-4">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getInviteStatusStyles(statusLabel)}`}>{statusLabel}</span>
                                                </td>
                                                {isAdmin && (
                                                    <td className="py-3.5 pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {m.inviteStatus === "PENDING" && (
                                                                <button onClick={() => resendInvite(m.id)} disabled={resendingId === m.id} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-50">
                                                                    {resendingId === m.id ? "Resending..." : "Resend Invite"}
                                                                </button>
                                                            )}
                                                            {m.role !== "ADMIN" && (
                                                                <>
                                                                    <button onClick={() => openEditModal(m)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-slate-50 transition-colors" aria-label={`Edit ${m.fullName}`}>
                                                                        <Pencil size={13} className="text-slate-400" />
                                                                    </button>
                                                                    <button onClick={() => setMemberToDelete(m)} disabled={removingId === m.id} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50" aria-label={`Remove ${m.fullName}`}>
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

                            <div className="sm:hidden divide-y divide-gray-100">
                                {teamMembers.map((m) => {
                                    const roleLabel = roleDisplay[m.role];
                                    const statusLabel = inviteStatusDisplay[m.inviteStatus];
                                    return (
                                        <div key={m.id} className="p-4 space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm truncate">{m.fullName}</p>
                                                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: NAVY }}>{m.email}</p>
                                                </div>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${getRoleBadgeStyles(roleLabel)}`} style={roleLabel === "Finance" ? { color: ORANGE } : undefined}>{roleLabel}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getInviteStatusStyles(statusLabel)}`}>{statusLabel}</span>
                                                <span className="text-xs text-slate-500 font-medium">{formatLastActive(m)}</span>
                                            </div>
                                            {isAdmin && (m.inviteStatus === "PENDING" || m.role !== "ADMIN") && (
                                                <div className="flex items-center gap-2 pt-1">
                                                    {m.inviteStatus === "PENDING" && (
                                                        <button onClick={() => resendInvite(m.id)} disabled={resendingId === m.id} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                                                            {resendingId === m.id ? "Resending..." : "Resend Invite"}
                                                        </button>
                                                    )}
                                                    {m.role !== "ADMIN" && (
                                                        <>
                                                            <button onClick={() => openEditModal(m)} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">Edit</button>
                                                            <button onClick={() => setMemberToDelete(m)} disabled={removingId === m.id} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
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

                    <div className="border-t border-gray-100">
                        <button onClick={() => setShowPermissions(!showPermissions)} className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold border-l-4" style={{ color: NAVY, borderLeftColor: NAVY, backgroundColor: "#f8fafc" }}>
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
                                            <td className="py-3 pr-4 font-semibold" style={{ color: NAVY }}>{row.action}</td>
                                            {(["Admin", "Manager", "Staff", "Finance"] as const).map((role) => (
                                                <td key={role} className="py-3 pr-4 text-center">
                                                    {row[role] ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-slate-300">—</span>}
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
                    {paymentBanner && (
                        <div className={`rounded-2xl border p-4 flex items-center justify-between gap-3 flex-wrap ${paymentBanner.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                            <p className="text-sm font-semibold">{paymentBanner.message}</p>
                            <button onClick={() => setPaymentBanner(null)} className="text-xs font-bold underline shrink-0">Dismiss</button>
                        </div>
                    )}

                    {loadingSubscription || !subscription ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-sm text-slate-400 font-medium">
                            {loadingSubscription ? "Loading subscription..." : "No subscription found for this workspace."}
                        </div>
                    ) : (
                        <>
                            {isTrialing && effectiveTrialEndsAt ? (
                                <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">14-Day Free Trial</h2>
                                            <p className="text-sm text-slate-400 mt-0.5">
                                                {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining · ends {new Date(effectiveTrialEndsAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#fed7aa", color: ORANGE }}>{daysRemaining} days left</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">
                                                Current Plan: {subscription.planType.charAt(0) + subscription.planType.slice(1).toLowerCase()}
                                            </h2>
                                            <p className="text-sm text-slate-400 mt-0.5">
                                                Status: <span className="font-semibold text-slate-600">{effectiveStatus}</span>
                                                {subscription.currentPeriodEnd && <> · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>}
                                            </p>
                                        </div>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            Rs. {subscription.amountNpr.toLocaleString()}<span className="text-base font-semibold text-slate-400">/mo</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                {plans.map((plan) => {
                                    const isCurrent = !isTrialing && effectivePlanType ? PLAN_TYPE_TO_TIER[effectivePlanType] === plan.tier : false;
                                    const isDowngradeLocked = !isTrialing && plan.tier === "starter" && effectivePlanType && PLAN_TYPE_TO_TIER[effectivePlanType] !== "starter";

                                    return (
                                        <div key={plan.name} className={`relative bg-white rounded-2xl border p-6 shadow-sm flex flex-col ${isCurrent ? "shadow-md" : "border-gray-100"}`} style={isCurrent ? { borderColor: NAVY, borderWidth: 2 } : undefined}>
                                            {isCurrent && (
                                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: NAVY }}>
                                                    Current Plan
                                                </span>
                                            )}
                                            <p className="text-base font-bold text-slate-900 mt-2">{plan.name}</p>
                                            <p className="text-3xl font-extrabold text-slate-900 mt-2">
                                                {plan.price}<span className="text-base font-semibold text-slate-400">{plan.period}</span>
                                            </p>
                                            <ul className="space-y-2.5 mt-5 flex-1">
                                                {plan.features.map((f) => (
                                                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>{f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                disabled={isCurrent || isDowngradeLocked}
                                                onClick={() => selectTier(plan.tier)}
                                                className={`mt-6 w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${isCurrent || isDowngradeLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white shadow-sm"}`}
                                                style={!isCurrent && !isDowngradeLocked ? { backgroundColor: ORANGE } : undefined}
                                            >
                                                {isCurrent ? "Current Plan" : isDowngradeLocked ? "Contact Support to Downgrade" : isTrialing ? "Select Plan" : "Upgrade"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Real payment flow — PaymentModal handles gateway pick, initiate, and redirect internally */}
                    {selectedTier && subscription && (
                        <PaymentModal
                            isOpen={!!selectedTier}
                            plan={TIER_TO_PLAN_CHECKOUT[selectedTier]}
                            workspaceName={workspace?.name ?? ""}
                            subscriptionId={subscription.id}
                            successUrl={`${window.location.origin}${window.location.pathname}?tab=subscription&paymentResult=success`}
                            failureUrl={`${window.location.origin}${window.location.pathname}?tab=subscription&paymentResult=failed`}
                            onClose={() => setSelectedTier(null)}
                            onContinue={() => setSelectedTier(null)}
                        />
                    )}
                </div>
            )}

            {/* ================= NOTIFICATIONS ================= */}
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
                                <button onClick={() => toggleNotification(n.id)} className="relative w-12 h-6 rounded-full shrink-0 transition-colors" style={{ backgroundColor: n.enabled ? NAVY : "#cbd5e1" }} aria-pressed={n.enabled} aria-label={`Toggle ${n.title}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${n.enabled ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= INVITE / EDIT TEAM MEMBER MODAL ================= */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6 pb-4">
                            <h2 className="text-lg font-bold text-slate-900">{editingMember ? "Edit Team Member" : "Invite Team Member"}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-slate-100 rounded-lg">
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
                                {editingMember && <p className="text-xs text-slate-400 mt-1.5">Email can't be changed after inviting.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Priya Sharma"
                                    value={inviteForm.name}
                                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                                    disabled={saving}
                                    className="w-full text-slate-900 placeholder:text-slate-400 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Role</label>
                                <select
                                    value={inviteForm.role}
                                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                    disabled={saving}
                                    className="w-full text-slate-900 placeholder:text-slate-400 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1.5">Admin role is reserved for the workspace owner (KYB registrant).</p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 flex-wrap">
                            <button onClick={closeModal} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
                            <button
                                onClick={handleSendInvitation}
                                disabled={!inviteForm.email || !inviteForm.name || saving}
                                className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors ${!inviteForm.email || !inviteForm.name || saving ? "opacity-50 cursor-not-allowed" : ""}`}
                                style={{ backgroundColor: ORANGE }}
                            >
                                {saving ? (editingMember ? "Saving..." : "Sending...") : editingMember ? "Save Changes" : "Send Invitation"}
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
                                    Are you sure you want to remove <span className="font-semibold text-slate-700">{memberToDelete.fullName}</span> from this workspace? They'll immediately lose access, and this can't be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6 flex-wrap">
                            <button onClick={() => setMemberToDelete(null)} disabled={removingId === memberToDelete.id} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
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