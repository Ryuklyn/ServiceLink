"use client";

import { useState, useEffect, useRef } from "react";
import {
    Camera, Phone, Mail, CalendarDays, ShieldCheck, ClipboardEdit,
    MapPin, Pencil, X, Save, Monitor, Sun, Moon, Zap, Star,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchProviderProfile,
    updateProviderProfile,
    uploadProviderPicture,
} from "@/store/slices/providerProfileSlice";

import dynamic from "next/dynamic";

const MapComponent = dynamic(
    () => import("@/components/dashboard/user/map/MapComponent"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading map...
            </div>
        ),
    }
);

type Theme = "system" | "light" | "dark";
type Language = "en" | "ne";

// NOTE: backend (ProviderProfileDTO) currently only exposes a single
// isVerified boolean — no per-check timestamps. These stay static until
// the backend adds individual verification records/dates.
type VerificationItem = { label: string; date: string };
const VERIFICATIONS: VerificationItem[] = [
    { label: "Identity Verification", date: "Verified on May 12, 2022" },
    { label: "Phone Verification", date: "Verified on May 12, 2022" },
    { label: "Email Verification", date: "Verified on May 12, 2022" },
    { label: "Background Check", date: "Verified on May 20, 2022" },
    { label: "Trade Certification", date: "Verified on Jun 05, 2022" },
];

export default function AccountTab() {
    const dispatch = useAppDispatch();
    const { data: profile, loading, saving, uploadingPicture, error } = useAppSelector(
        (state) => state.providerProfile,
    );

    const [theme, setTheme] = useState<Theme>("system");
    const [language, setLanguage] = useState<Language>("en");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const DEFAULT_COORDS: [number, number] = [27.6915, 85.342];
    const coordinates: [number, number] =
        profile?.latitude != null && profile?.longitude != null
            ? [profile.latitude, profile.longitude]
            : DEFAULT_COORDS;

    const [isBioModalOpen, setIsBioModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const [tempBio, setTempBio] = useState("");
    const [tempLocation, setTempLocation] = useState("");
    const [tempRadius, setTempRadius] = useState(10);

    useEffect(() => {
        dispatch(fetchProviderProfile());
    }, [dispatch]);

    const openBioModal = () => {
        setTempBio(profile?.bio ?? "");
        setIsBioModalOpen(true);
    };

    const openMapModal = () => {
        setTempLocation(profile?.serviceAreaText ?? "");
        setTempRadius(profile?.travelRadiusKm ?? 10);
        setIsMapModalOpen(true);
    };

    const saveBio = async () => {
        await dispatch(updateProviderProfile({ bio: tempBio }));
        setIsBioModalOpen(false);
    };

    const saveServiceArea = async () => {
        await dispatch(
            updateProviderProfile({
                serviceAreaText: tempLocation,
                travelRadiusKm: tempRadius,
            }),
        );
        setIsMapModalOpen(false);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) dispatch(uploadProviderPicture(file));
        e.target.value = "";
    };

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

    const initials = (profile?.fullName ?? "")
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="space-y-6">
            {/* Profile header card */}
            <div className="w-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8683f] text-2xl font-semibold text-white tracking-wide overflow-hidden">
                                {profile?.profilePictureUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.profilePictureUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                                ) : (
                                    initials || "?"
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPicture}
                                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                <Camera className="h-3.5 w-3.5 text-slate-500" />
                                {uploadingPicture ? "Uploading…" : "Upload Photo"}
                            </button>
                            <span className="text-[10px] text-slate-400">JPG, PNG. Max 2MB</span>
                        </div>

                        <div className="pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                    {profile?.fullName ?? "—"}
                                </h2>
                                {profile?.isVerified && (
                                    <span className="inline-flex items-center gap-1 bg-green-500/10 text-[#10b981] text-[11px] font-semibold px-2 py-0.5 rounded-md border border-green-500/20">
                                        <ShieldCheck className="h-3.5 w-3.5 fill-[#10b981]/10" strokeWidth={2.5} />
                                        KYC VERIFIED
                                    </span>
                                )}
                            </div>

                            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                <Zap className="h-3.5 w-3.5 text-slate-400 fill-slate-400/20" />
                                {profile?.primaryService ?? "—"}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                {profile?.serviceAreaText ?? profile?.baseDistrict ?? "Not set"}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-0.5" />
                                {profile?.averageRating?.toFixed(1) ?? "—"}
                                <span className="text-slate-400 font-normal ml-0.5">
                                    ({profile?.totalReviews ?? 0} reviews)
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-6 lg:gap-0 mt-4 lg:mt-0">
                        <div className="flex items-center gap-3 lg:px-8 border-slate-100 lg:first:border-l-0 lg:border-l">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50/60 text-indigo-600">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-slate-400">Phone Number</p>
                                <p className="text-sm font-semibold text-slate-700">{profile?.phone ?? "—"}</p>
                                {profile?.isVerified && (
                                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30">
                                        <ShieldCheck className="w-3.5 h-3.5 fill-[#10b981]/10" strokeWidth={2.5} />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:px-8 border-slate-100 lg:border-l">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8683f]/10 text-[#e8683f]">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-slate-400">Email Address</p>
                                <p className="text-sm font-semibold text-slate-700">{profile?.email ?? "—"}</p>
                                {profile?.isVerified && (
                                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30">
                                        <ShieldCheck className="w-3.5 h-3.5 fill-[#10b981]/10" strokeWidth={2.5} />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:pl-8 border-slate-100 lg:border-l">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50/60 text-indigo-600">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-slate-400">Member Since</p>
                                <p className="text-sm font-bold text-slate-700 pt-0.5">
                                    {profile?.memberSince
                                        ? new Date(profile.memberSince).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Verified Information */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#1e3a8a]" />
                        <h3 className="text-sm font-semibold text-slate-900">
                            Verified Information
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {VERIFICATIONS.map((item) => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                                        <path
                                            d="M5 13l4 4L19 7"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-slate-400">{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-5 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                        View All Verification
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardEdit className="h-4 w-4 text-slate-700" />
                                <h3 className="text-sm font-semibold text-slate-900">Professional Bio</h3>
                            </div>
                            <button
                                onClick={openBioModal}
                                className="flex items-center gap-1 text-xs font-medium text-[#e8683f] hover:text-[#d4562e] transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
                            {profile?.bio || <span className="text-slate-400 italic">No professional bio summary provided yet.</span>}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-700" />
                                <h3 className="text-sm font-semibold text-slate-900">Service Area Coverage</h3>
                            </div>
                            <button
                                onClick={openMapModal}
                                className="flex items-center gap-1 text-xs font-medium text-[#e8683f] hover:text-[#d4562e] transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-slate-400">Primary Location Hub</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                                        {profile?.serviceAreaText ?? profile?.baseDistrict ?? "Not set"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">Operational Radius Limit</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                                        {profile?.travelRadiusKm ?? "—"} km Coverage
                                    </p>
                                </div>
                            </div>

                            <div className="h-28 w-full rounded-xl overflow-hidden border border-slate-100 relative z-0 shadow-inner">
                                <MapComponent
                                    center={coordinates}
                                    radius={profile?.travelRadiusKm ?? 10}
                                    interactive={false}
                                />
                            </div>
                        </div>
                    </div>

                    {isBioModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                            <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-6 shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-800">Modify Professional Summary</h3>
                                    <button onClick={() => setIsBioModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <textarea
                                        value={tempBio}
                                        onChange={(e) => setTempBio(e.target.value)}
                                        maxLength={2000}
                                        rows={5}
                                        className="w-full resize-none rounded-lg border border-slate-200 p-3.5 text-sm text-slate-700 outline-none transition-all focus:border-[#e8683f] focus:ring-2 focus:ring-[#e8683f]/10"
                                        placeholder="Write down your business description, training competencies..."
                                    />
                                    <div className="mt-1 flex justify-end">
                                        <span className="text-xs text-slate-400 font-medium">{tempBio.length} / 2000 characters</span>
                                    </div>
                                </div>
                                <div className="mt-5 flex gap-3 justify-end border-t border-slate-100 pt-4">
                                    <button onClick={() => setIsBioModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                                    <button onClick={saveBio} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#e8683f] hover:bg-[#d4562e] rounded-lg transition-colors shadow-sm disabled:opacity-50">
                                        <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Bio"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isMapModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                            <div className="w-full max-w-2xl rounded-xl border border-slate-100 bg-white p-6 shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-800">Update Distribution Coverage</h3>
                                    <button onClick={() => setIsMapModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-4 md:col-span-1">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">HQ Center Address</label>
                                            <input
                                                type="text"
                                                value={tempLocation}
                                                onChange={(e) => setTempLocation(e.target.value)}
                                                maxLength={1000}
                                                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-[#e8683f] transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 block mb-1">Range Limit: {tempRadius} km</label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="30"
                                                value={tempRadius}
                                                onChange={(e) => setTempRadius(Number(e.target.value))}
                                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#e8683f]"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                                                <span>1 km</span>
                                                <span>30 km</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-56 md:h-full min-h-[220px] md:col-span-2 rounded-xl overflow-hidden border border-slate-100 relative z-0">
                                        <MapComponent
                                            center={coordinates}
                                            radius={tempRadius}
                                            interactive={true}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-3 justify-end border-t border-slate-100 pt-4">
                                    <button onClick={() => setIsMapModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                                    <button onClick={saveServiceArea} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#e8683f] hover:bg-[#d4562e] rounded-lg transition-colors shadow-sm disabled:opacity-50">
                                        <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Configurations"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">Preferences</h3>
                    <p className="mb-2 text-xs font-medium text-slate-500">Theme</p>
                    <div className="mb-5 grid grid-cols-3 gap-2">
                        <button onClick={() => setTheme("system")} className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${theme === "system" ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                            <Monitor className="h-3.5 w-3.5" /> System
                        </button>
                        <button onClick={() => setTheme("light")} className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${theme === "light" ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                            <Sun className="h-3.5 w-3.5" /> Light
                        </button>
                        <button onClick={() => setTheme("dark")} className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${theme === "dark" ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                            <Moon className="h-3.5 w-3.5" /> Dark
                        </button>
                    </div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Language</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setLanguage("en")} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${language === "en" ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                            English
                        </button>
                        <button onClick={() => setLanguage("ne")} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${language === "ne" ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                            नेपाली
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}