"use client";

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    Building2, Users, CreditCard, Bell, Pencil, Upload, X, Plus, Trash2,
    ChevronDown, ChevronUp, Copy, Crown, Hash, Phone, Mail, AlertTriangle,
    Shield, Check, Lock, RefreshCw, Download,
} from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";
import type { RootState, AppDispatch } from "@/store";
import { getOrganization, updateOrganization, uploadOrgLogo, getWorkspace, updateWorkspace } from "@/lib/api/organizationApi";
import { getSubscriptionByWorkspace, verifyPayment, getProSubscriptionHistory } from "@/lib/api/proSubscriptionApi";
import PaymentModal from "@/components/business/payment/PaymentModal";
import type { PlanCheckout } from "@/components/business/PlanStep";
import type { OrganizationResponse, WorkspaceResponse, SubscriptionResponse, PlanType } from "@/types/business";
import { fetchProSession } from "@/store/slices/proSessionSlice";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

const ALL_SERVICE_OPTIONS = ["HVAC", "Electrical", "Cleaning", "Plumbing", "Security", "Pest Control"];

const PERMISSION_ROWS = [
    { module: "Dashboard", Admin: "Full", Manager: "Full", Staff: "View", Finance: "View" },
    { module: "Provider Pool", Admin: "Full", Manager: "Full", Staff: "View", Finance: "View" },
    { module: "Provider Directory", Admin: "Full", Manager: "View", Staff: "View", Finance: "View" },
    { module: "Job Tickets", Admin: "Full", Manager: "Full", Staff: "Assigned", Finance: "View" },
    { module: "SLA Dashboard", Admin: "Full", Manager: "Full", Staff: "View", Finance: "View" },
    { module: "Compliance", Admin: "Full", Manager: "Full", Staff: "View", Finance: "View" },
    { module: "Billing", Admin: "Full", Manager: "View", Staff: "—", Finance: "Full" },
    { module: "Subscription", Admin: "Full", Manager: "View", Staff: "—", Finance: "View" },
    { module: "Team Members", Admin: "Full", Manager: "View", Staff: "—", Finance: "—" },
    { module: "Settings", Admin: "Full", Manager: "Limited", Staff: "—", Finance: "—" },
    { module: "Security", Admin: "Full", Manager: "Own", Staff: "Own", Finance: "Own" },
];

const ROLE_OPTIONS = ["Manager", "Staff", "Finance"];

function renderPermissionBadge(value: string) {
    if (value === "Full") {
        return <span className="inline-block text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50">Full</span>;
    }
    if (value === "View") {
        return <span className="inline-block text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100/50">View</span>;
    }
    if (value === "Assigned") {
        return <span className="inline-block text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">Assigned</span>;
    }
    if (value === "Own") {
        return <span className="inline-block text-[11px] font-black text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100/50">Own</span>;
    }
    if (value === "Limited") {
        return <span className="inline-block text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100/50">Limited</span>;
    }
    return <span className="text-slate-300 font-semibold">—</span>;
}

const PLAN_TYPE_TO_TIER: Record<PlanType, "starter" | "growth" | "enterprise"> = {
    STARTER: "starter", GROWTH: "growth", ENTERPRISE: "enterprise",
};

const TIER_TO_PLAN_CHECKOUT: Record<"starter" | "growth", PlanCheckout> = {
    starter: { id: "starter", name: "Starter", price: "NPR 1,999", priceLabel: "per month", amountNpr: 1999, planType: "STARTER" },
    growth: { id: "growth", name: "Growth", price: "NPR 4,999", priceLabel: "per month", amountNpr: 4999, planType: "GROWTH" },
};

const plans = [
    { name: "Starter", price: "NPR 1,999", period: "/mo", tier: "starter" as const,
        features: ["14-day free trial", "1 branch location", "Up to 3 team members", "Basic service requests", "Email notifications"] },
    { name: "Growth", price: "NPR 4,999", period: "/mo", tier: "growth" as const,
        features: ["Up to 20 team members", "Up to 10 branch locations", "Vendor verification", "Analytics & reporting", "Asset tracking"] },
    { name: "Enterprise", price: "Custom", period: "", tier: "enterprise" as const,
        features: ["Unlimited members", "Unlimited branches", "Dedicated Support", "Advanced Analytics", "Custom Integrations"] },
];

const TABS = [
    { key: "profile", label: "Organization Profile", icon: Building2 },
    { key: "team", label: "Team Members", icon: Users },
    { key: "subscription", label: "Subscription", icon: CreditCard },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Shield },
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
    if (role === "Finance") return "bg-orange-50 text-[#e8683f]";
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

function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "response" in error) {
        const resp = (error as { response?: { data?: { message?: string } } }).response;
        return resp?.data?.message ?? fallback;
    }
    return fallback;
}

function getErrorStatus(error: unknown): number | undefined {
    if (error && typeof error === "object" && "response" in error) {
        return (error as { response?: { status?: number } }).response?.status;
    }
    return undefined;
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

    const dispatch = useDispatch<AppDispatch>();

    const currentRole = useSelector((state: RootState) => state.proSession.role);
    const isAdmin = currentRole === "ADMIN";
    const { organizationId, workspaceId, planType, subscriptionStatus, trialEndsAt } =
        useSelector((s: RootState) => s.proSession);

    const filteredTabs = TABS.filter((tab) => {
        if (!currentRole) return true;
        const r = currentRole.toUpperCase();
        if (r === "STAFF") {
            return tab.key === "security" || tab.key === "notifications";
        }
        if (r === "FINANCE") {
            return tab.key === "subscription" || tab.key === "security" || tab.key === "notifications";
        }
        return true;
    });

    useEffect(() => {
        if (currentRole) {
            const hasActiveTab = filteredTabs.some((t) => t.key === activeTab);
            if (!hasActiveTab && filteredTabs.length > 0) {
                setActiveTab(filteredTabs[0].key);
            }
        }
    }, [currentRole, activeTab]);

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

    const effectiveOrgId = organizationId || org?.id || workspace?.organizationId;

    const fetchProfile = useCallback(async () => {
        if (!workspaceId) return;
        try {
            setLoadingProfile(true);
            let orgData: OrganizationResponse;
            let wsData: WorkspaceResponse;

            if (organizationId) {
                const [orgRes, wsRes] = await Promise.all([getOrganization(organizationId), getWorkspace(workspaceId)]);
                orgData = orgRes;
                wsData = wsRes;
            } else {
                wsData = await getWorkspace(workspaceId);
                if (wsData.organizationId) {
                    orgData = await getOrganization(wsData.organizationId);
                } else {
                    throw new Error("Organization ID not found on workspace");
                }
            }
            setOrg(orgData);
            setWorkspace(wsData);
            setDraftServices(wsData.preferredServices ?? []);
            setProfileForm({ companyName: orgData.companyName, contactNumber: orgData.contactNumber, primaryBranchLocation: wsData.primaryBranchLocation });
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not load organization profile"));
        } finally {
            setLoadingProfile(false);
        }
    }, [organizationId, workspaceId]);

    useEffect(() => { if (activeTab === "profile" && !org) fetchProfile(); }, [activeTab, org, fetchProfile]);

    const handleLogoUpload = async (file: File) => {
        if (!effectiveOrgId || !isAdmin) return;
        try {
            setUploadingLogo(true);
            setOrg(await uploadOrgLogo(effectiveOrgId, file));
            toast.success("Logo updated");
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not upload logo"));
        } finally {
            setUploadingLogo(false);
        }
    };

    const saveProfile = async () => {
        if (!effectiveOrgId || !workspaceId) return;
        try {
            setSavingProfile(true);
            const [orgData, wsData] = await Promise.all([
                updateOrganization(effectiveOrgId, { companyName: profileForm.companyName, contactNumber: profileForm.contactNumber }),
                updateWorkspace(workspaceId, { primaryBranchLocation: profileForm.primaryBranchLocation, preferredServices: draftServices }),
            ]);
            setOrg(orgData);
            setWorkspace(wsData);
            setIsEditingProfile(false);
            toast.success("Organization profile updated");
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not save changes"));
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
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not load team members"));
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
            } catch (e: unknown) {
                toast.error(getErrorMessage(e, "Could not update member"));
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
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not send invitation"));
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
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not remove member"));
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
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not resend invite"));
        } finally {
            setResendingId(null);
        }
    };

    // ===================== SUBSCRIPTION =====================
    const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"starter" | "growth" | null>(null);
    const [paymentBanner, setPaymentBanner] = useState<{ type: "success" | "failed"; message: string } | null>(null);
    const paymentCheckStarted = useRef(false);

    const [historyLogs, setHistoryLogs] = useState<any>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchSubscription = useCallback(async () => {
        if (!workspaceId) return;
        try {
            setLoadingSubscription(true);
            const subData = await getSubscriptionByWorkspace(workspaceId);
            setSubscription(subData);
            
            try {
                setLoadingHistory(true);
                const hist = await getProSubscriptionHistory(workspaceId);
                setHistoryLogs(hist);
            } catch (err) {
                console.error("Could not load workspace subscription history:", err);
            } finally {
                setLoadingHistory(false);
            }
        } catch (e: unknown) {
            if (getErrorStatus(e) !== 404) toast.error("Could not load subscription");
        } finally {
            setLoadingSubscription(false);
        }
    }, [workspaceId]);

    useEffect(() => { if (activeTab === "subscription" && !subscription) fetchSubscription(); }, [activeTab, subscription, fetchSubscription]);

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
                        await Promise.all([
                            fetchSubscription(),
                            dispatch(fetchProSession()),
                        ]);
                    } else {
                        setPaymentBanner({ type: "failed", message: res.error ?? "We received a response but couldn't verify it. Contact support with your reference ID." });
                    }
                } catch (e: unknown) {
                    setPaymentBanner({ type: "failed", message: getErrorMessage(e, "Verification failed.") });
                }
            } else {
                setPaymentBanner({ type: "failed", message: "Payment was not completed. You can try again below." });
            }
            router.replace(`${window.location.pathname}?tab=subscription`);
        })();
    }, [searchParams, router, fetchSubscription]);

    const effectivePlanType = subscription?.planType ?? (planType as PlanType | null) ?? null;
    const effectiveStatus = subscription?.status ?? subscriptionStatus ?? null;
    const effectiveTrialEndsAt = subscription?.trialEndsAt ?? trialEndsAt ?? null;
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

    // ===================== SECURITY (2FA) =====================
    const [meUser, setMeUser] = useState<any>(null);
    const [loadingMe, setLoadingMe] = useState(false);

    const [is2faSetupOpen, setIs2faSetupOpen] = useState(false);
    const [setupStep, setSetupStep] = useState(1);
    const [setupPassword, setSetupPassword] = useState("");
    const [setupQrCode, setSetupQrCode] = useState("");
    const [setupSecret, setSetupSecret] = useState("");
    const [setupCode, setSetupCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [loadingSetup, setLoadingSetup] = useState(false);

    const [is2faDisableOpen, setIs2faDisableOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");
    const [loadingDisable, setLoadingDisable] = useState(false);

    const [isRegenerateBackupOpen, setIsRegenerateBackupOpen] = useState(false);
    const [regeneratedCodes, setRegeneratedCodes] = useState<string[]>([]);

    const fetchMe = useCallback(async () => {
        try {
            setLoadingMe(true);
            const { data } = await api.get("/auth/me");
            setMeUser(data);
        } catch (e: unknown) {
            console.error("Could not load user profile:", e);
        } finally {
            setLoadingMe(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "security" && !meUser) {
            fetchMe();
        }
    }, [activeTab, meUser, fetchMe]);

    const handleInit2fa = async () => {
        if (!setupPassword) {
            toast.error("Password is required");
            return;
        }
        if (!meUser) return;
        try {
            setLoadingSetup(true);
            const { data } = await api.post(`/users/${meUser.id}/2fa/init`, {
                currentPassword: setupPassword,
                method: "TOTP"
            });
            setSetupQrCode(data.qrCodeImageBase64);
            setSetupSecret(data.manualSetupKey);
            setSetupStep(2);
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not initiate 2FA setup"));
        } finally {
            setLoadingSetup(false);
        }
    };

    const handleVerify2fa = async () => {
        if (!setupCode || setupCode.length !== 6) {
            toast.error("Enter a 6-digit verification code");
            return;
        }
        if (!meUser) return;
        try {
            setLoadingSetup(true);
            const { data } = await api.post(`/users/${meUser.id}/2fa/verify`, {
                otp: setupCode
            });
            setBackupCodes(data.backupCodes || []);
            setSetupStep(3);
            fetchMe();
            toast.success("Two-Step Verification successfully enabled!");
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Invalid verification code. Please try again."));
        } finally {
            setLoadingSetup(false);
        }
    };

    const handleDisable2fa = async () => {
        if (!disablePassword) {
            toast.error("Password is required");
            return;
        }
        if (!meUser) return;
        try {
            setLoadingDisable(true);
            await api.post(`/users/${meUser.id}/2fa/disable`, {
                currentPassword: disablePassword,
                code: disableCode
            });
            setIs2faDisableOpen(false);
            setDisablePassword("");
            setDisableCode("");
            fetchMe();
            toast.success("Two-Step Verification disabled.");
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Failed to disable 2FA. Verify password and code."));
        } finally {
            setLoadingDisable(false);
        }
    };

    const handleRegenerateBackup = async () => {
        if (!meUser) return;
        try {
            const { data } = await api.post(`/users/${meUser.id}/2fa/regenerate-backup-codes`);
            setRegeneratedCodes(data || []);
            setIsRegenerateBackupOpen(true);
            toast.success("New backup codes generated.");
        } catch (e: unknown) {
            toast.error(getErrorMessage(e, "Could not regenerate backup codes"));
        }
    };

    const downloadBackupCodes = (codes: string[]) => {
        const element = document.createElement("a");
        const file = new Blob([codes.join("\n")], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "servicelink-backup-codes.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <main className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-2 overflow-x-auto sm:flex-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filteredTabs.map((tab) => {
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
                            <p className="text-sm text-slate-400 mt-0.5">Manage your organization&apos;s information and workspace details</p>
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
                                            <Image src={org.logoUrl} alt="Organization logo" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="text-center px-4">
                                                <Building2 size={28} className="text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs font-semibold text-slate-400">No logo uploaded</p>
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <label className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-slate-50 cursor-pointer z-10">
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
                                <Plus size={15} /> Invite Member
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
                                            <tr key={m.id} className={`border-b border-gray-55 hover:bg-slate-50/60 transition-colors ${idx === teamMembers.length - 1 ? "border-b-0" : ""}`}>
                                                <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900">{m.fullName}</td>
                                                <td className="py-3.5 pr-4">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRoleBadgeStyles(roleLabel)}`}>{roleLabel}</span>
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
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${getRoleBadgeStyles(roleLabel)}`}>{roleLabel}</span>
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
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Module</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Admin</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Manager</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Staff</th>
                                        <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-center">Finance</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {PERMISSION_ROWS.map((row) => (
                                        <tr key={row.module} className="border-b border-gray-50 last:border-b-0">
                                            <td className="py-3 pr-4 font-semibold text-slate-800">{row.module}</td>
                                            <td className="py-3 pr-4 text-center">{renderPermissionBadge(row.Admin)}</td>
                                            <td className="py-3 pr-4 text-center">{renderPermissionBadge(row.Manager)}</td>
                                            <td className="py-3 pr-4 text-center">{renderPermissionBadge(row.Staff)}</td>
                                            <td className="py-3 pr-4 text-center">{renderPermissionBadge(row.Finance)}</td>
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
                                    const isDowngradeLocked = !isTrialing && plan.tier === "starter" && !!effectivePlanType && PLAN_TYPE_TO_TIER[effectivePlanType] !== "starter";

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

                            {/* Billing & Invoice History */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
                                <h3 className="text-base font-bold text-slate-900 mb-4">Billing History</h3>
                                {loadingHistory ? (
                                    <div className="py-4 text-center text-sm text-slate-400">Loading history...</div>
                                ) : !historyLogs || !historyLogs.transactions || historyLogs.transactions.length === 0 ? (
                                    <div className="py-4 text-center text-sm text-slate-400">No transactions recorded yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-slate-400 text-xs font-semibold uppercase">
                                                    <th className="py-3">Date</th>
                                                    <th className="py-3">Amount</th>
                                                    <th className="py-3">Reference ID</th>
                                                    <th className="py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyLogs.transactions.map((tx: any) => (
                                                    <tr key={tx.id} className="border-b border-gray-50 text-slate-700 font-medium">
                                                        <td className="py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3">NPR {tx.amountNpr.toLocaleString()}</td>
                                                        <td className="py-3 font-mono text-xs">{tx.referenceId}</td>
                                                        <td className="py-3">
                                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

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
                <NotificationPreferences />
            )}

            {/* ================= SECURITY ================= */}
            {activeTab === "security" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Security Settings</h2>
                        <p className="text-sm text-slate-400 mb-5">Configure two-step verification to protect your business account.</p>

                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-slate-50/50">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Two-Step Verification (2FA)</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Use an authenticator app (TOTP) to secure your logins.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meUser?.is2FAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                    {meUser?.is2FAEnabled ? "Enabled" : "Disabled"}
                                </span>
                                {meUser?.is2FAEnabled ? (
                                    <button onClick={() => setIs2faDisableOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">
                                        Disable
                                    </button>
                                ) : (
                                    <button onClick={() => { setIs2faSetupOpen(true); setSetupStep(1); }} className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-colors" style={{ backgroundColor: ORANGE }}>
                                        Enable
                                    </button>
                                )}
                            </div>
                        </div>

                        {meUser?.is2FAEnabled && (
                            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Backup Verification Codes</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Generate new backup codes to access your account if you lose your device.</p>
                                </div>
                                <button onClick={handleRegenerateBackup} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-slate-700 hover:bg-slate-50 transition-colors">
                                    Regenerate Codes
                                </button>
                            </div>
                        )}
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
                                {editingMember && <p className="text-xs text-slate-400 mt-1.5">Email can&apos;t be changed after inviting.</p>}
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
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 flex-wrap">
                            <button onClick={closeModal} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleSendInvitation} disabled={!inviteForm.email || !inviteForm.name || saving} className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-colors ${!inviteForm.email || !inviteForm.name || saving ? "opacity-50 cursor-not-allowed" : ""}`} style={{ backgroundColor: ORANGE }}>
                                {saving ? (editingMember ? "Saving..." : "Sending...") : (editingMember ? "Save Changes" : "Send Invitation")}
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
                                    Are you sure you want to remove <span className="font-semibold text-slate-700">{memberToDelete.fullName}</span> from this workspace? They&apos;ll immediately lose access, and this can&apos;t be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 flex-wrap">
                            <button onClick={() => setMemberToDelete(null)} disabled={removingId === memberToDelete.id} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={confirmRemoveMember} disabled={removingId === memberToDelete.id} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors disabled:opacity-50">
                                {removingId === memberToDelete.id ? "Removing..." : "Yes, Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= 2FA SETUP MODAL ================= */}
            {is2faSetupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
                        <button onClick={() => setIs2faSetupOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>

                        {setupStep === 1 && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Enable Two-Factor Authentication</h3>
                                <p className="text-sm text-slate-500 mb-5">Please enter your password to start the 2FA setup process.</p>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={setupPassword}
                                    onChange={(e) => setSetupPassword(e.target.value)}
                                    className="w-full text-slate-900 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] mb-4"
                                />
                                <button onClick={handleInit2fa} disabled={loadingSetup} className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: NAVY }}>
                                    {loadingSetup ? "Verifying..." : "Verify Password"}
                                </button>
                            </div>
                        )}

                        {setupStep === 2 && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Scan QR Code</h3>
                                <p className="text-sm text-slate-500 mb-4">Scan the QR code below using your authenticator app (Google Authenticator, Authy, etc.).</p>
                                <div className="flex justify-center mb-4">
                                    {setupQrCode && (
                                        <Image src={`data:image/png;base64,${setupQrCode}`} alt="2FA QR Code" width={192} height={192} className="border border-gray-100 rounded-xl" unoptimized />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-1">Or enter manual key:</p>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mb-4 text-center font-mono text-sm tracking-wider select-all">{setupSecret}</div>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={setupCode}
                                    maxLength={6}
                                    onChange={(e) => setSetupCode(e.target.value)}
                                    className="w-full text-center tracking-[0.5em] text-slate-900 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] mb-4"
                                />
                                <button onClick={handleVerify2fa} disabled={loadingSetup} className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: NAVY }}>
                                    {loadingSetup ? "Enabling..." : "Verify & Enable"}
                                </button>
                            </div>
                        )}

                        {setupStep === 3 && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Two-Step Verification Enabled</h3>
                                <p className="text-sm text-slate-500 mb-4">Save these backup codes. You can use them to sign in if you lose access to your device. Each code can be used only once.</p>
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl mb-4 font-mono text-sm border border-gray-100">
                                    {backupCodes.map((code) => (
                                        <div key={code} className="text-center text-slate-700">{code}</div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => downloadBackupCodes(backupCodes)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <Download size={14} /> Download
                                    </button>
                                    <button onClick={() => { setIs2faSetupOpen(false); setSetupStep(1); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: NAVY }}>
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= 2FA DISABLE MODAL ================= */}
            {is2faDisableOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
                        <button onClick={() => setIs2faDisableOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">Disable Two-Step Verification</h3>
                        <p className="text-sm text-slate-500 mb-4">To disable 2FA, please enter your password and current verification code.</p>
                        
                        <div className="space-y-3 mb-4">
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                className="w-full text-slate-900 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                            />
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={disableCode}
                                maxLength={6}
                                onChange={(e) => setDisableCode(e.target.value)}
                                className="w-full text-center tracking-[0.5em] text-slate-900 rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                            />
                        </div>

                        <button onClick={handleDisable2fa} disabled={loadingDisable} className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                            {loadingDisable ? "Disabling..." : "Disable 2FA"}
                        </button>
                    </div>
                </div>
            )}

            {/* ================= REGENERATE BACKUP CODES MODAL ================= */}
            {isRegenerateBackupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
                        <button onClick={() => setIsRegenerateBackupOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">New Backup Codes Generated</h3>
                        <p className="text-sm text-slate-500 mb-4">Please download or print your new backup codes. Your old codes will no longer work.</p>
                        
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl mb-4 font-mono text-sm border border-gray-100">
                            {regeneratedCodes.map((code) => (
                                <div key={code} className="text-center text-slate-700">{code}</div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => downloadBackupCodes(regeneratedCodes)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                <Download size={14} /> Download
                            </button>
                            <button onClick={() => setIsRegenerateBackupOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: NAVY }}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}