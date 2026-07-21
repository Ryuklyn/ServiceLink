"use client";

import { useEffect, useMemo, useRef } from "react";
import {
    CheckCircle2,
    Clock,
    Briefcase,
    MapPin,
    Star,
    FileText,
    ChevronRight,
    Smile,
    Meh,
    Frown,
    Camera,
    Loader2,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchProviderProfile,
    uploadProviderPicture,
} from "@/store/slices/providerProfileSlice";

// ─── Presentational helpers ────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={i < Math.round(rating) ? "fill-[#e8683f] text-[#e8683f]" : "fill-gray-200 text-gray-200"}
                />
            ))}
        </div>
    );
}

function RatingBar({ label, pct }: { label: string; pct: number }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-gray-500">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#e8683f]" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right text-gray-500">{pct}%</span>
        </div>
    );
}

function CircularProgress({ percentage }: { percentage: number }) {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f1f1" strokeWidth="7" />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="#e8683f"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-base font-bold text-gray-900">{percentage}%</span>
        </div>
    );
}

// Loose shape used only to safely read an optional `rating` off recentReviews,
// which is typed `unknown[]` upstream since the backend shape isn't pinned down.
interface ReviewLike {
    rating?: number;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function ProfileOverview() {
    const dispatch = useAppDispatch();
    const { data: profile, loading, uploadingPicture, error } = useAppSelector(
        (state) => state.providerProfile,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchProviderProfile());
    }, [dispatch]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) dispatch(uploadProviderPicture(file));
        e.target.value = "";
    };

    // ── Derived data — all computed from the real profile, no fabricated numbers ──

    const stats = useMemo(() => {
        if (!profile) return [];
        return [
            {
                icon: Clock,
                value: profile.experienceYears != null ? String(profile.experienceYears) : "—",
                label: "Years Experience",
            },
            {
                icon: Briefcase,
                value: profile.totalJobs != null ? String(profile.totalJobs) : "0",
                label: "Jobs Completed",
            },
            {
                icon: CheckCircle2,
                value: profile.avgResponseMinutes != null ? `${profile.avgResponseMinutes} min` : "—",
                label: "Avg. Response Time",
            },
            {
                icon: MapPin,
                value: profile.travelRadiusKm != null ? `${profile.travelRadiusKm} km` : "—",
                label: "Service Radius",
            },
        ];
    }, [profile]);

    const skills = useMemo(() => {
        const names = profile?.services?.map((s) => s.subServiceName).filter(Boolean) ?? [];
        return Array.from(new Set(names));
    }, [profile]);
    const visibleSkills = skills.slice(0, 4);
    const extraSkillsCount = Math.max(skills.length - visibleSkills.length, 0);

    // Real per-category subscores (punctuality/quality/communication/value),
    // replacing a fabricated 5★–1★ histogram the backend doesn't provide.
    const ratingCategories = useMemo(() => {
        if (!profile) return [];
        const fallback = profile.averageRating ?? 0;
        const toPct = (score?: number | null) => Math.round(((score ?? fallback) / 5) * 100);
        return [
            { label: "Punctuality", pct: toPct(profile.punctualityScore) },
            { label: "Quality", pct: toPct(profile.qualityScore) },
            { label: "Communication", pct: toPct(profile.communicationScore) },
            { label: "Value", pct: toPct(profile.valueScore) },
        ];
    }, [profile]);

    const sentimentBreakdown = useMemo(() => {
        const reviews = (profile?.recentReviews ?? []) as ReviewLike[];
        const rated = reviews.filter((r) => typeof r.rating === "number");
        if (rated.length === 0) return null;

        const positive = rated.filter((r) => (r.rating as number) >= 4).length;
        const neutral = rated.filter((r) => (r.rating as number) === 3).length;
        const negative = rated.filter((r) => (r.rating as number) < 3).length;
        const total = rated.length;

        return [
            { icon: Smile, label: "Positive", pct: Math.round((positive / total) * 100), bg: "bg-green-50", text: "text-green-700" },
            { icon: Meh, label: "Neutral", pct: Math.round((neutral / total) * 100), bg: "bg-orange-50", text: "text-orange-700" },
            { icon: Frown, label: "Negative", pct: Math.round((negative / total) * 100), bg: "bg-red-50", text: "text-red-700" },
        ];
    }, [profile]);

    const completeness = useMemo(() => {
        if (!profile) return { pct: 0, missing: [] as { label: string; pct: string }[] };

        const checks = [
            { label: "Add profile photo", weight: 15, done: !!profile.profilePictureUrl },
            { label: "Add business description", weight: 15, done: !!profile.bio },
            { label: "Add years of experience", weight: 10, done: !!profile.experienceYears },
            { label: "Add your services", weight: 20, done: (profile.services?.length ?? 0) > 0 },
            { label: "Add portfolio photos", weight: 15, done: (profile.portfolio?.length ?? 0) > 0 },
            { label: "Set your coverage area", weight: 10, done: !!(profile.baseDistrict || profile.coveredDistricts) },
            { label: "Complete KYC verification", weight: 15, done: !!profile.isVerified },
        ];

        const pct = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
        const missing = checks.filter((c) => !c.done).map((c) => ({ label: c.label, pct: `+${c.weight}%` }));
        return { pct, missing };
    }, [profile]);

    // ── Render states ──

    if (loading && !profile) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm text-sm text-slate-500">
                Loading account details…
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm text-sm text-red-600">
                Couldn&apos;t load your profile: {error}
            </div>
        );
    }

    if (!profile) return null;

    const initials = getInitials(profile.fullName ?? "");
    const subtitle = [profile.primaryService, profile.baseDistrict].filter(Boolean).join(" • ") || "—";

    return (
        <div className="space-y-6">
            {/* Non-blocking error banner (e.g. a failed picture upload after initial load) */}
            {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="relative shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#e8683f] text-xl font-bold text-white">
                            {profile.profilePictureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.profilePictureUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                            ) : (
                                initials || "?"
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPicture}
                            title="Change profile photo"
                            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1e3a8a] text-white shadow-sm hover:bg-[#1e3a8a]/90 disabled:opacity-60"
                        >
                            {uploadingPicture ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Camera className="h-3 w-3" />
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">{profile.fullName ?? "—"}</h2>
                            {profile.isVerified && (
                                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verified Provider
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

                        <div className="mt-2 flex items-center gap-2">
                            <StarRating rating={profile.averageRating ?? 0} />
                            <span className="text-sm font-bold text-gray-900">
                                {(profile.averageRating ?? 0).toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-400">({profile.totalReviews ?? 0} reviews)</span>
                        </div>

                        {profile.bio && <p className="mt-3 text-sm text-gray-600">{profile.bio}</p>}

                        {skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {visibleSkills.map((skill) => (
                                    <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1e3a8a]">
                                        {skill}
                                    </span>
                                ))}
                                {extraSkillsCount > 0 && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                                        +{extraSkillsCount} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {stats.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center">
                                <stat.icon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                                <span className="text-xs text-gray-500">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3 Column Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* KYC Verification */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">KYC Verification</h3>
                    {profile.isVerified ? (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            KYC Approved
                        </span>
                    ) : (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            Pending Verification
                        </span>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                        {profile.hasCompletedOnboarding ? "Onboarding complete." : "Onboarding incomplete — finish your profile setup."}
                    </p>

                    <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-gray-50">
                        <FileText className="h-4 w-4" />
                        View Documents
                    </button>
                </div>

                {/* Recent Reviews */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
                        <button className="flex items-center gap-0.5 text-xs font-medium text-[#1e3a8a] hover:underline">
                            View All Reviews
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">{(profile.averageRating ?? 0).toFixed(1)}</span>
                        <div>
                            <StarRating rating={profile.averageRating ?? 0} />
                            <p className="text-xs text-gray-400">({profile.totalReviews ?? 0} reviews)</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                        {ratingCategories.map((r) => (
                            <RatingBar key={r.label} label={r.label} pct={r.pct} />
                        ))}
                    </div>

                    {sentimentBreakdown && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-medium text-gray-500">
                                Customer Sentiment <span className="text-gray-400">· Based on recent reviews</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sentimentBreakdown.map((s) => (
                                    <span
                                        key={s.label}
                                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
                                    >
                                        <s.icon className="h-3.5 w-3.5" />
                                        {s.pct}% {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Completeness */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
                    <p className="mt-1 text-xs text-gray-500">Complete your profile to get more bookings</p>

                    <div className="mt-4 flex items-center gap-4">
                        <CircularProgress percentage={completeness.pct} />
                        {completeness.missing.length > 0 ? (
                            <ul className="flex-1 space-y-2">
                                {completeness.missing.map((item) => (
                                    <li key={item.label} className="flex items-center justify-between text-xs text-gray-600">
                                        <span>{item.label}</span>
                                        <span className="font-semibold text-[#e8683f]">{item.pct}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="flex-1 text-xs text-gray-500">Your profile is fully complete. 🎉</p>
                        )}
                    </div>

                    {completeness.missing.length > 0 && (
                        <button className="mt-5 w-full rounded-lg border border-[#e8683f] py-2 text-sm font-semibold text-[#e8683f] hover:bg-[#e8683f]/5">
                            Improve Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Subscription Banner — still placeholder; wire to a subscription slice when available */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8683f]/10">
                        <FaCrown className="h-4 w-4 text-[#e8683f]" />
                    </div>
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            Subscription Plan
                        </p>
                        <p className="text-xs text-gray-500">Manage your subscription and billing details.</p>
                    </div>
                </div>
                <button className="rounded-lg border border-[#e8683f] px-4 py-2 text-sm font-semibold text-[#e8683f] hover:bg-[#e8683f]/5">
                    Manage Subscription
                </button>
            </div>
        </div>
    );
}