"use client";

import { useState } from "react";
import {
    X, CheckCircle2, XCircle, Video,
    Calendar, Clock, Send, Link2, Sparkles,
    User, MapPin, Briefcase, FileText, ExternalLink,
    Mail, Phone, ShieldCheck, AlertCircle, Image as ImageIcon,
    Check, CalendarDays, RefreshCw
} from "lucide-react";
import { kycAdminApi } from "@/store/slices/features/kyc/kycAdminApi";
import type {
    KycDetail, ScheduleVideoAuditRequest, VerificationStatus,
} from "@/store/slices/features/kyc/kycTypes";
import { toBadgeStatus } from "@/store/slices/features/kyc/kycTypes";
import StatusBadge from "./StatusBadge";
import KycDecisionModal from "./KycDecisionModal";

type Tab = "overview" | "address" | "professional" | "documents" | "video";
type DecisionAction = "approve" | "reject";

interface Props {
    provider: KycDetail;
    initialTab?: Tab;
    onClose: () => void;
    onChange: () => void;
}

const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: "overview",     label: "Overview",     Icon: User },
    { key: "address",      label: "Address",      Icon: MapPin },
    { key: "professional", label: "Professional", Icon: Briefcase },
    { key: "documents",    label: "Documents",    Icon: FileText },
    { key: "video",        label: "Video Audit",  Icon: Video },
];

export default function KycDetailModal({
                                           provider, initialTab = "overview", onClose, onChange,
                                       }: Props) {
    const [tab, setTab] = useState<Tab>(initialTab);
    const [busy, setBusy] = useState(false);
    const [inlineError, setInlineError] = useState<string | null>(null);

    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const [meetDate, setMeetDate]   = useState(tomorrow.toISOString().slice(0, 10));
    const [meetTime, setMeetTime]   = useState("14:00");
    const [meetLink, setMeetLink]   = useState("");
    const [sendEmail,    setSendEmail]    = useState(true);
    const [sendWhatsApp, setSendWhatsApp] = useState(true);

    const [isRescheduling, setIsRescheduling] = useState(false);

    // Approve / Reject confirmation dialog
    const [decision, setDecision] = useState<DecisionAction | null>(null);

    const [overrideStatus, setOverrideStatus] = useState<VerificationStatus | null>(null);
    const liveStatus = overrideStatus ?? toBadgeStatus(provider.status);

    const photoSrc = provider.profilePhotoUrl || provider.photoPath;
    const hasScheduledMeet = Boolean(provider.scheduledMeetLink || provider.scheduledMeetAt || liveStatus === "manual_audit");

    const run = async (fn: () => Promise<unknown>) => {
        setBusy(true);
        setInlineError(null);
        try {
            await fn();
            onChange();
            onClose();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Request failed";
            setInlineError(msg);
        } finally {
            setBusy(false);
        }
    };

    const openDecision = (action: DecisionAction) => {
        setInlineError(null);
        setDecision(action);
    };

    const closeDecision = () => {
        if (busy) return;
        setDecision(null);
        setInlineError(null);
    };

    // note is optional for approve, required for reject (enforced in KycDecisionModal).
    // Both are stored as reviewNotes on the backend when present.
    const confirmDecision = (note: string) => {
        if (decision === "approve") {
            run(async () => {
                setOverrideStatus("verified");
                await kycAdminApi.approve(provider.id, note || undefined);
            });
        } else if (decision === "reject") {
            run(async () => {
                setOverrideStatus("suspended");
                await kycAdminApi.reject(provider.id, note);
            });
        }
    };

    const handleScheduleVideo = () => {
        const body: ScheduleVideoAuditRequest = {
            meetDate,
            meetTime,
            meetLink: meetLink.trim() || undefined,
            sendEmail,
            sendWhatsApp,
        };
        run(async () => {
            setOverrideStatus("manual_audit");
            await kycAdminApi.scheduleVideoAudit(provider.id, body);
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/60 overflow-hidden max-h-[92vh] flex flex-col">
                    <style jsx>{`
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>

                    {busy && (
                        <div className="px-5 py-2 text-[11px] font-semibold tracking-wide text-indigo-700 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600" />
                            </span>
                            SUBMITTING DECISION
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-slate-100">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-900 text-white overflow-hidden flex items-center justify-center text-base font-semibold tracking-tight border border-slate-200">
                                {photoSrc ? (
                                    <img
                                        src={photoSrc}
                                        alt={provider.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    provider.fullName?.charAt(0)?.toUpperCase() ?? "?"
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[19px] font-semibold text-slate-900 tracking-tight truncate">
                                    {provider.fullName}
                                </h3>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] tracking-tight text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-[3px]">
                                        {provider.referenceNumber}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="truncate">{provider.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge status={liveStatus} />
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-7 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px pt-3">
                            {TABS.map(({ key, label, Icon }) => {
                                const active = tab === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setTab(key)}
                                        className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-[12.5px] font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                                            active
                                                ? "bg-white text-slate-900 border border-b-0 border-slate-200"
                                                : "text-slate-500 hover:text-slate-800 border border-transparent"
                                        }`}
                                    >
                                        <Icon size={14} className={active ? "text-indigo-600" : "text-slate-400"} />
                                        {label}
                                        {active && (
                                            <span className="absolute -bottom-px left-0 right-0 h-px bg-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="px-7 py-6 overflow-y-auto text-sm space-y-6 flex-1 bg-white">

                        {inlineError && !decision && (
                            <div className="text-[12.5px] text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                <span>{inlineError}</span>
                            </div>
                        )}

                        {/* Overview Tab */}
                        {tab === "overview" && (
                            <div className="space-y-5">
                                {provider.reviewedAt && (
                                    <div className="p-4 bg-amber-50 border border-amber-200/70 rounded-2xl text-xs space-y-1.5">
                                        <p className="font-semibold text-amber-900 flex items-center gap-1.5 text-[12.5px]">
                                            <ShieldCheck size={14} className="text-amber-600" />
                                            Previous Audit Record
                                        </p>
                                        <p className="text-amber-800">
                                            Reviewed on{" "}
                                            <span className="font-medium">
                                                {new Date(provider.reviewedAt).toLocaleString()}
                                            </span>
                                        </p>
                                        {provider.reviewNotes && (
                                            <p className="text-amber-700/90 mt-2 pt-2 border-t border-amber-200/60">
                                                &ldquo;{provider.reviewNotes}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <SectionLabel text="Identity" />
                                    <div>
                                        <AttributeRow label="Full Name" value={provider.fullName} icon={<User size={12} />} />
                                        <AttributeRow label="Date of Birth" value={provider.dob} icon={<Calendar size={12} />} />
                                        <AttributeRow label="Gender" value={provider.gender} />
                                        <AttributeRow label="Submitted" value={new Date(provider.submittedAt).toLocaleString()} icon={<Clock size={12} />} />
                                    </div>
                                </div>

                                <div>
                                    <SectionLabel text="Contact" />
                                    <div>
                                        <AttributeRow label="Phone Number" value={provider.phone} icon={<Phone size={12} />} />
                                        <AttributeRow label="Email Address" value={provider.email} icon={<Mail size={12} />} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Address Tab */}
                        {tab === "address" && (
                            <div>
                                <AttributeRow label="Province" value={provider.province} icon={<MapPin size={12} />} />
                                <AttributeRow label="District" value={provider.district} />
                                <AttributeRow label="Municipality" value={provider.municipality} />
                                <AttributeRow label="Ward Number" value={provider.ward} />
                                <AttributeRow label="Tole / Local Area" value={provider.tole} />
                            </div>
                        )}

                        {/* Professional Tab */}
                        {tab === "professional" && (
                            <div className="space-y-4">
                                <div>
                                    <AttributeRow label="Primary Specialty" value={provider.primaryService} icon={<Briefcase size={12} />} />
                                    <AttributeRow label="Secondary Specialty" value={provider.otherService} />
                                    <AttributeRow label="Experience" value={provider.experienceYears ? `${provider.experienceYears} Years` : null} />
                                    <AttributeRow label="Coverage Radius" value={provider.travelRadius} />
                                    <AttributeRow label="Primary Operational District" value={provider.primaryDistrict} />
                                    <AttributeRow label="Secondary Operational Districts" value={provider.secondaryDistricts?.join(", ")} />
                                    <AttributeRow label="Additional Services Provided" value={provider.additionalServices?.join(", ")} />
                                </div>
                                <div className="pt-1 space-y-1.5">
                                    <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Professional Bio</p>
                                    <p className="text-slate-700 text-[12.5px] leading-relaxed bg-slate-50 rounded-xl px-3.5 py-3">
                                        {provider.bio || "No biography provided."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {tab === "documents" && (
                            <div className="grid grid-cols-2 gap-3">
                                <DocCard
                                    label="Profile Photo / Avatar"
                                    url={provider.profilePhotoUrl || provider.photoPath}
                                    icon={<ImageIcon size={16} />}
                                />
                                <DocCard label="Citizenship (Front)" url={provider.citizenshipFrontPath} />
                                <DocCard label="Citizenship (Back)" url={provider.citizenshipBackPath} />
                                <DocCard label="Applicant Photo Document" url={provider.photoPath} />
                                <DocCard label="PAN Card Document" url={provider.panPath} />
                                {(provider.professionalCertPaths ?? []).map((u, i) => (
                                    <DocCard key={i} label={`Professional License / Cert ${i + 1}`} url={u} />
                                ))}
                            </div>
                        )}

                        {/* Video Audit Tab */}
                        {tab === "video" && (
                            <div className="space-y-5">
                                {hasScheduledMeet && !isRescheduling ? (
                                    <div className="bg-indigo-50/60 border border-slate-200 rounded-2xl p-6 space-y-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                                                    <Check size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-semibold text-slate-900">
                                                        Meeting Has Been Scheduled
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        An audit invitation has already been dispatched for this provider.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsRescheduling(true)}
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm transition-colors"
                                            >
                                                <RefreshCw size={13} /> Reschedule
                                            </button>
                                        </div>

                                        {provider.scheduledMeetAt && (
                                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                                    <Clock size={14} className="text-indigo-500" /> Scheduled Time
                                                </span>
                                                <span className="font-semibold text-slate-800">
                                                    {new Date(provider.scheduledMeetAt).toLocaleString([], {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            {provider.scheduledMeetLink && (
                                                <a
                                                    href={provider.scheduledMeetLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full px-4 py-3 rounded-xl bg-black text-white text-[12.5px] font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20"
                                                >
                                                    <Video size={16} /> Go to Google Meet
                                                </a>
                                            )}
                                            <a
                                                href="https://calendar.google.com"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12.5px] font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CalendarDays size={16} className="text-slate-500" /> Go to Calendar
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                                        {isRescheduling && (
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                                                    <Sparkles size={14} /> Rescheduling Audit Session
                                                </p>
                                                <button
                                                    onClick={() => setIsRescheduling(false)}
                                                    className="text-xs text-slate-500 hover:text-slate-800"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        <div>
                                            <label className="font-semibold text-slate-700 block mb-1.5 text-[12.5px]">
                                                Schedule Date &amp; Time
                                            </label>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <FieldShell icon={<Calendar size={14} />}>
                                                    <input
                                                        type="date"
                                                        value={meetDate}
                                                        onChange={(e) => setMeetDate(e.target.value)}
                                                        className="w-full focus:outline-none bg-transparent text-[12.5px] text-slate-800"
                                                    />
                                                </FieldShell>
                                                <FieldShell icon={<Clock size={14} />}>
                                                    <input
                                                        type="time"
                                                        value={meetTime}
                                                        onChange={(e) => setMeetTime(e.target.value)}
                                                        className="w-full focus:outline-none bg-transparent text-[12.5px] text-slate-800"
                                                    />
                                                </FieldShell>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="font-semibold text-slate-700 block mb-1.5 text-[12.5px]">
                                                Google Meet Video Link <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <FieldShell icon={<Link2 size={14} />}>
                                                <input
                                                    type="url"
                                                    value={meetLink}
                                                    onChange={(e) => setMeetLink(e.target.value)}
                                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                    className="w-full focus:outline-none bg-transparent text-[12.5px] text-slate-800 placeholder:text-slate-400"
                                                />
                                            </FieldShell>
                                            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                                                <Sparkles size={12} className="text-amber-500 shrink-0" />
                                                Leaving this empty auto-generates a video link via API integrations.
                                            </p>
                                        </div>

                                        <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2.5">
                                            <p className="font-semibold text-[12px] flex items-center gap-1.5 text-slate-700">
                                                <Send size={13} className="text-indigo-600" /> Dispatch Notification Channels
                                            </p>
                                            <div className="space-y-2">
                                                <ToggleRow
                                                    checked={sendEmail}
                                                    onChange={setSendEmail}
                                                    label="Send Email Invitation"
                                                    detail={provider.email}
                                                />
                                                <ToggleRow
                                                    checked={sendWhatsApp}
                                                    onChange={setSendWhatsApp}
                                                    label="Send WhatsApp Notification"
                                                    detail={provider.phone}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleScheduleVideo}
                                            disabled={busy}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-[12.5px] font-semibold hover:bg-slate-800 active:bg-slate-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                                        >
                                            <Video size={15} /> {isRescheduling ? "Confirm Reschedule" : "Schedule Video Audit Session"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {tab !== "video" && (
                        <div className="flex items-center justify-end gap-2.5 px-7 py-4 bg-white border-t border-slate-100">
                            <button
                                onClick={() => openDecision("reject")}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                            >
                                <XCircle size={15} /> Reject
                            </button>
                            <button
                                onClick={() => setTab("video")}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                            >
                                <Video size={15} /> Manual Video Audit
                            </button>
                            <button
                                onClick={() => openDecision("approve")}
                                disabled={busy}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[12.5px] font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                            >
                                <CheckCircle2 size={15} /> Approve Provider
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {decision && (
                <KycDecisionModal
                    action={decision}
                    targetName={provider.fullName}
                    busy={busy}
                    error={inlineError}
                    onCancel={closeDecision}
                    onConfirm={confirmDecision}
                />
            )}
        </>
    );
}

// ── Subcomponents ────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
    return (
        <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            {text}
        </p>
    );
}

function AttributeRow({
                          label,
                          value,
                          icon,
                          className = "",
                      }: {
    label: string;
    value?: string | null;
    icon?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex items-center justify-between gap-6 py-2.5 border-b border-slate-100 last:border-0 ${className}`}>
            <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                {icon}
                <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
            </span>
            <span className="text-[12.5px] font-semibold text-slate-800 text-right truncate">
                {value || "—"}
            </span>
        </div>
    );
}

function DocCard({ label, url, icon }: { label: string; url?: string | null; icon?: React.ReactNode }) {
    if (!url) return null;
    return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <div className="text-slate-400 shrink-0">{icon || <FileText size={16} />}</div>
                <span className="text-xs font-medium text-slate-700 truncate">{label}</span>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
            >
                View <ExternalLink size={12} />
            </a>
        </div>
    );
}

function FieldShell({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <div className="text-slate-400 shrink-0">{icon}</div>
            {children}
        </div>
    );
}

function ToggleRow({
                       checked,
                       onChange,
                       label,
                       detail,
                   }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    detail?: string | null;
}) {
    return (
        <label className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{label}</p>
                {detail && <p className="text-[11px] text-slate-400 truncate">{detail}</p>}
            </div>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
        </label>
    );
}