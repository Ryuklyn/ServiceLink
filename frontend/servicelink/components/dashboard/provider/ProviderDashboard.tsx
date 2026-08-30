"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    Navigation,
    MessageCircle,
    MapPin,
    TrendingUp,
    Copy,
    Share2,
    PartyPopper,
} from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "@/hooks/useTranslation";
import api from "@/utils/axios";
import type { AppointmentSummary } from "@/store/slices/providerBookingsSlice";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface ReferralSummary {
    referralCode: string;
    progress: number;
    total: number;
    freeMonthsEarned: number;
}

interface PagedResponse<T> {
    content?: T[];
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const formatAmount = (amount: number | null) =>
    amount == null ? "—" : `Rs. ${amount.toLocaleString()}`;

const formatDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.valueOf())
        ? date
        : new Intl.DateTimeFormat("en-NP", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
};

// ─────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────

const jobStatusStyles: Record<AppointmentSummary["status"], string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    IN_PROGRESS: "bg-[#E8683F] text-white",
    COMPLETED: "bg-green-100 text-green-700 border border-green-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border border-blue-200",
    CANCELLED: "bg-gray-100 text-gray-500 border border-gray-200",
};

// ─────────────────────────────────────────────
// SUB-SECTIONS
// ─────────────────────────────────────────────

/** Active Job Banner */
function ActiveJobBanner({ booking }: { booking: AppointmentSummary | null }) {
    const { t } = useTranslation();
    if (!booking) return null;

    return (
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-text-primary">
            <div className="flex items-start gap-3">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
                        {t("dashboard.inProgress")}
                    </p>
                    <h2 className="font-bold text-lg leading-tight">
                        {booking.subServiceName}
                    </h2>
                    <p className="text-text-secondary text-sm mt-0.5">
                        {booking.customerName} &bull; {booking.address || t("Address unavailable")}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={13} className="text-primary" />
                        <span className="text-sm text-primary font-semibold">
                            {booking.estimatedStartTime ?? booking.timeSlot}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
                <Link href={`/dashboard/provider/bookings?booking=${booking.id}`} className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all w-full sm:w-auto">
                    <Navigation size={15} />
                    {t("View booking")}
                </Link>
                {booking.customerPhone && (
                <a href={`https://wa.me/${booking.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#1ebe5a] transition-all shadow-sm w-full sm:w-auto">
                    <FaWhatsapp size={15} />
                    WhatsApp
                </a>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** ServiceLink Score Donut */
function ServiceLinkScore() {
    const { t } = useTranslation();
    const score = 81;
    const radius = 70;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const stats = [
        { labelKey: "dashboard.responseRate", label: "Response Rate", value: "94%" },
        { labelKey: "dashboard.completion", label: "Completion", value: "98%" },
        { labelKey: "dashboard.avgRating", label: "Avg Rating", value: "4.8★" },
        { labelKey: "dashboard.profile", label: "Profile", value: "72%" },
    ];

    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-6 text-text-primary">
            <h3 className="font-bold text-text-primary text-base mb-5">
                {t("dashboard.serviceLinkScore", "ServiceLink Score")}
            </h3>

            <div className="flex justify-center mb-6">
                <div className="relative w-[140px] h-[140px]">
                    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
                        <circle
                            stroke="#F0F0F0"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        <circle
                            stroke="url(#scoreGrad)"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        <defs>
                            <linearGradient
                                id="scoreGrad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop offset="0%" stopColor="#00C9A7" />
                                <stop offset="100%" stopColor="#00E5C5" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-text-primary">{score}</span>
                        <span className="text-xs text-text-muted font-medium">/100</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                {stats.map(({ labelKey, label, value }) => (
                    <div
                        key={labelKey}
                        className="bg-surface-secondary rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-center border border-border"
                    >
                        <p className="text-[11px] sm:text-xs text-text-muted font-medium mb-0.5">{t(labelKey, label)}</p>
                        <p className="text-base font-extrabold text-text-primary leading-tight">{t(value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Today's Schedule */
function TodaySchedule({ bookings, loading }: { bookings: AppointmentSummary[]; loading: boolean }) {
    const { t } = useTranslation();
    const todayLabel = new Intl.DateTimeFormat("en-NP", {
        weekday: "long", month: "long", day: "numeric",
    }).format(new Date());

    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-6 text-text-primary">
            <h3 className="font-bold text-text-primary text-base mb-1">{todayLabel}</h3>
            <p className="text-xs text-text-muted mb-5">
                {bookings.length} {t("dashboard.jobsScheduled", "jobs scheduled")}
            </p>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <p className="text-sm text-text-muted py-5 text-center">Loading schedule…</p>
                ) : bookings.length === 0 ? (
                    <p className="text-sm text-text-muted py-5 text-center">No upcoming jobs scheduled.</p>
                ) : bookings.map((job) => (
                    <div
                        key={job.id}
                        className="flex items-start justify-between gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-muted font-medium mb-0.5">
                                {formatDate(job.appointmentDate)} · {job.estimatedStartTime ?? job.timeSlot}
                            </p>
                            <p className="text-sm font-bold text-text-primary truncate">
                                {job.subServiceName}
                            </p>
                            <p className="text-xs text-text-secondary mt-0.5">{job.customerName}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <MapPin size={11} className="text-text-muted flex-shrink-0" />
                                <p className="text-xs text-text-muted truncate">{job.address || "Address unavailable"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <p className="text-sm font-bold text-text-primary">{formatAmount(job.totalPrice)}</p>
                            <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                                    jobStatusStyles[job.status]
                                }`}
                            >
                                {t(job.status.replace(/_/g, " "))}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Earnings Card */
function EarningsCard() {
    const { t } = useTranslation();
    const earned = 12450;
    const goal = 16000;
    const percent = Math.round((earned / goal) * 100);

    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-6 text-text-primary">
            <div className="flex flex-col md:flex-row items-stretch md:items-start gap-6">
                {/* Left Progress Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary font-medium mb-1">{t("This Month's Earnings")}</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
                        Rs. {earned.toLocaleString()}
                    </h2>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1.5">
                            <p className="text-xs text-text-muted">{t("Goal")}: Rs. {goal.toLocaleString()}</p>
                            <p className="text-xs font-bold text-primary">{percent}%</p>
                        </div>
                        <div className="h-2.5 bg-primary/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                            {t("You need 7 more jobs to hit your monthly goal.")}
                        </p>
                    </div>
                </div>

                {/* Right Breakdown Metrics Grid */}
                <div className="grid grid-cols-3 md:flex md:flex-col gap-2.5 sm:gap-3 w-full md:w-36 flex-shrink-0">
                    <div className="bg-surface-secondary rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center md:text-left border border-border">
                        <p className="text-[10px] sm:text-xs text-text-muted font-medium">{t("This Week")}</p>
                        <p className="text-sm sm:text-base font-bold text-green-600 mt-0.5">+12%</p>
                    </div>
                    <div className="bg-surface-secondary rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center md:text-left border border-border">
                        <p className="text-[10px] sm:text-xs text-text-muted font-medium">{t("Today")}</p>
                        <p className="text-sm sm:text-base font-bold text-text-primary mt-0.5">2 {t("jobs")}</p>
                    </div>
                    <div className="bg-surface-secondary rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center md:text-left border border-border">
                        <p className="text-[10px] sm:text-xs text-text-muted font-medium">{t("Avg/Job")}</p>
                        <p className="text-sm sm:text-base font-bold text-text-primary mt-0.5">Rs. 520</p>
                    </div>
                </div>
            </div>

            <hr className="border-t border-border mt-5 mb-4" />

            {/* Bottom Row Totals */}
            <div className="flex flex-wrap items-center gap-y-2 text-sm sm:text-base text-text-primary">
                <div className="flex items-center mr-4">
                    <span className="text-xs text-text-muted mr-1.5">{t("Paid")}</span>
                    <span className="font-bold text-primary">Rs. 11,200</span>
                </div>

                <div className="hidden sm:block w-px h-5 bg-border mr-4" />

                <div className="flex items-center">
                    <span className="text-xs text-text-muted mr-1.5">{t("Pending")}</span>
                    <span className="font-bold text-yellow-500">Rs. 1,250</span>
                </div>

                <Link
                    href="/dashboard/provider/earnings"
                    className="ml-auto text-xs sm:text-sm font-semibold text-primary hover:underline"
                >
                    {t("View Earnings")} →
                </Link>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Recent Bookings Table */
function RecentBookings({ bookings, loading }: { bookings: AppointmentSummary[]; loading: boolean }) {
    const { t } = useTranslation();
    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden text-text-primary">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6">
                {t("Recent Bookings")}
            </h3>

            {/* Added container for smooth mobile responsive layout scrolling */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[600px] sm:min-w-full">
                    <thead>
                    <tr className="bg-surface-secondary border-b border-border">
                        {[
                            "Customer",
                            "Service",
                            "Date",
                            "Amount",
                            "Payment",
                            "Rating",
                        ].map((col) => (
                            <th
                                key={col}
                                className="px-4 py-3 sm:px-5 sm:py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
                            >
                                {t(col)}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-text-muted">Loading recent bookings…</td></tr>
                    ) : bookings.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-text-muted">No bookings yet.</td></tr>
                    ) : bookings.map((b) => (
                        <tr
                            key={b.id}
                            className="border-b border-border last:border-0 hover:bg-surface-hover/30 transition-colors"
                        >
                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 font-semibold text-text-primary whitespace-nowrap">
                                {b.customerName || "—"}
                            </td>

                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 text-text-secondary whitespace-nowrap">
                                {b.subServiceName}
                            </td>

                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 text-text-secondary whitespace-nowrap">
                                {formatDate(b.appointmentDate)}
                            </td>

                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 font-semibold text-text-primary whitespace-nowrap">
                                {formatAmount(b.totalPrice)}
                            </td>

                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 whitespace-nowrap">
                                    <span
                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200"
                                    >
                                        {t("—")}
                                    </span>
                            </td>

                            <td className="px-4 py-3.5 sm:px-5 sm:py-4 text-center text-text-muted font-medium whitespace-nowrap">
                                —
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-5 sm:pt-6">
                <Link href={"/dashboard/provider/bookings"}>
                    <button className="flex items-center gap-2 text-sm sm:text-base font-medium text-primary hover:text-primary-hover transition-colors">
                        {t("View All Bookings")}
                        <span className="text-lg sm:text-xl">→</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Referrals Panel */
function ReferralsPanel({ referral, loading }: { referral: ReferralSummary | null; loading: boolean }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const referralCode = referral?.referralCode ?? "—";
    const totalSteps = referral?.total ?? 0;
    const completed = referral?.progress ?? 0;

    const handleCopy = () => {
        if (!referral?.referralCode) return;
        navigator.clipboard.writeText(referral.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-5 text-text-primary">
            <h3 className="font-bold text-text-primary text-base mb-1">{t("navigation.referrals", "Referrals")}</h3>

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-text-primary">
                    {loading ? "Loading…" : `${completed} ${t("dashboard.referralsCompleted", "referrals completed!")}`}
                </p>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <span
                            key={i}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                                i < completed ? "bg-primary" : "bg-border"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="h-1.5 bg-border rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    style={{ width: `${totalSteps ? Math.min(100, (completed / totalSteps) * 100) : 0}%` }}
                />
            </div>

            <p className="text-xs text-text-muted mb-4">
                {referral?.freeMonthsEarned
                    ? `${referral.freeMonthsEarned} free month${referral.freeMonthsEarned === 1 ? "" : "s"} earned from successful referrals.`
                    : t("Share your code with other service providers to earn free subscription months.")}
            </p>

            <div className="flex items-center gap-2 bg-surface-secondary border border-border rounded-xl px-3 py-2.5 mb-4">
                <span className="flex-1 text-xs sm:text-sm font-mono font-semibold text-text-secondary tracking-wide truncate">
                    {referralCode}
                </span>
                <button
                    onClick={handleCopy}
                    className="text-primary hover:text-primary-hover transition p-1"
                >
                    <Copy size={15} />
                </button>
                {copied && (
                    <span className="text-xs text-green-500 font-medium whitespace-nowrap">{t("Copied!")}</span>
                )}
            </div>

            <div className="flex gap-2">
                <button onClick={() => {
                    if (!referral?.referralCode) return;
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Join ServiceLink with my referral code ${referral.referralCode}: ${window.location.origin}/register/provider?ref=${referral.referralCode}`)}`, "_blank", "noopener,noreferrer");
                }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#1ebe5a] transition shadow-sm">
                    <FaWhatsapp size={15} />
                    WhatsApp
                </button>
                <button onClick={() => navigator.share?.({ title: "Join ServiceLink", text: `Join ServiceLink with my referral code ${referralCode}`, url: `${window.location.origin}/register/provider?ref=${referralCode}` })} className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[#1877F2] text-[#1877F2] text-sm font-semibold rounded-xl hover:bg-[#1877F2] hover:text-white transition">
                    <Share2 size={15} />
                    {t("Share")}
                </button>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold mt-3.5">
                {totalSteps > completed
                    ? `${totalSteps - completed} more referral${totalSteps - completed === 1 ? "" : "s"} = 1 month FREE`
                    : "You've unlocked your next free month!"}
                <PartyPopper size={14} className="text-primary rotate-[-10deg]" />
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Monthly Plan Card */
function MonthlyPlanCard() {
    const { t } = useTranslation();
    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-4 sm:p-5 text-text-primary">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-text-primary">{t("Monthly Plan")}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                        {t("18 days left · Expires June 30, 2026")}
                    </p>
                </div>
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {t("common.active", "Active")}
                </span>
            </div>
            <Link href="/dashboard/provider/subscription">
                <button className="mt-4 text-sm font-semibold text-primary hover:underline">
                    {t("dashboard.manage", "Manage")} →
                </button>
            </Link>
        </div>
    );
}

// ─────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────

export default function ProviderDashboard() {
    const [recentBookings, setRecentBookings] = useState<AppointmentSummary[]>([]);
    const [activeBooking, setActiveBooking] = useState<AppointmentSummary | null>(null);
    const [upcomingBookings, setUpcomingBookings] = useState<AppointmentSummary[]>([]);
    const [referral, setReferral] = useState<ReferralSummary | null>(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            try {
                const [recentResponse, activeResponse, upcomingResponse, referralResponse] = await Promise.all([
                    api.get<PagedResponse<AppointmentSummary>>("/appointments/provider", { params: { page: 0, size: 5 } }),
                    api.get<PagedResponse<AppointmentSummary>>("/appointments/provider", { params: { status: "IN_PROGRESS", page: 0, size: 1 } }),
                    api.get<AppointmentSummary[]>("/appointments/provider/upcoming"),
                    api.get<ReferralSummary>("/providers/me/referrals"),
                ]);
                if (cancelled) return;
                setRecentBookings(recentResponse.data.content ?? []);
                setActiveBooking(activeResponse.data.content?.[0] ?? null);
                setUpcomingBookings(upcomingResponse.data);
                setReferral(referralResponse.data);
            } catch (error) {
                console.error("Failed to load provider dashboard data", error);
            } finally {
                if (!cancelled) setDashboardLoading(false);
            }
        }

        loadDashboard();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="flex flex-col gap-4 sm:gap-5 max-w-[1200px] mx-auto w-full">
            {/* 1. Active Job Banner */}
            <ActiveJobBanner booking={activeBooking} />

            {/* 2. Score + Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <ServiceLinkScore />
                <TodaySchedule bookings={upcomingBookings} loading={dashboardLoading} />
            </div>

            {/* 3. Earnings */}
            <EarningsCard />

            {/* 4. Bookings + Right Column */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 sm:gap-5">
                <RecentBookings bookings={recentBookings} loading={dashboardLoading} />
                <div className="flex flex-col gap-4 sm:gap-5">
                    <ReferralsPanel referral={referral} loading={dashboardLoading} />
                    <MonthlyPlanCard />
                </div>
            </div>
        </div>
    );
}
