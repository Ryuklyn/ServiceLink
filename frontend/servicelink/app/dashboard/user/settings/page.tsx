"use client";

import { useState } from "react";
import { useEffect } from "react";
import { MeResponse } from "@/lib/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUser, updateUserLocally } from "@/store/slices/userSlice";
import AddPhoneModal from "@/components/dashboard/user/settings/AddPhoneModal";
import EditProfileModal from "@/components/dashboard/user/settings/EditProfileModal";
import AvatarMenu from "@/components/dashboard/user/settings/AvatarMenu";
import api from "@/utils/axios";
import {
  MapPin,
  Plus,
  ChevronRight,
  Key,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Mail,
  Phone,
  PencilLine,
  ShieldCheck,
  Ticket,
  Info,
  Briefcase,
  XCircle,
  Calendar,
  Trash2,
  FileText,
  Smartphone,
} from "lucide-react";

interface SavedAddress {
  id: string;
  type: "Home" | "Office";
  address: string;
}

interface SavedProvider {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  rating: number;
}

// Matches RescheduleTokenBalanceDTO from GET /appointments/reschedule-tokens/me
interface RescheduleTokenBalance {
  year: number;
  tokensTotal: number;
  tokensUsed: number;
  tokensRemaining: number;
}

export default function SettingsPage() {

  const dispatch = useAppDispatch();
  const { data: user, loading, error } = useAppSelector((state) => state.user);

  // ── Modal visibility states ──
  const [showAddPhoneModal, setShowAddPhoneModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // ── Flex Token Wallet — reschedule tokens are real; cancellation tokens
  // have no backend yet (no CancelToken entity/endpoint exists), so that
  // side stays static until that's built. ──
  const [rescheduleTokens, setRescheduleTokens] = useState<RescheduleTokenBalance | null>(null);
  const [tokensLoading, setTokensLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    api
        .get<RescheduleTokenBalance>("/appointments/reschedule-tokens/me")
        .then(({ data }) => setRescheduleTokens(data))
        .catch((err) => {
          console.error(
              "Failed to fetch reschedule token balance:",
              err?.response?.status,
              err?.response?.data ?? err?.message,
          );
          setRescheduleTokens(null);
        })
        .finally(() => setTokensLoading(false));
  }, []);

  // ── Address Mock States ──
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: "1", type: "Home", address: "Baneshwor, Kathmandu" },
    { id: "2", type: "Office", address: "New Baneshwor, Kathmandu" },
  ]);

  // ── Saved Providers (mock) ──
  const savedProviders: SavedProvider[] = [
    {
      id: "1",
      name: "Ram Electrical Services",
      specialty: "Certified Electrician",
      initials: "RE",
      rating: 5,
    },
    {
      id: "2",
      name: "CleanNest Services",
      specialty: "Professional Cleaner",
      initials: "CS",
      rating: 5,
    },
    {
      id: "3",
      name: "WoodCraft Carpentry",
      specialty: "Master Carpenter",
      initials: "WC",
      rating: 5,
    },
  ];

  // ── Preference Toggles ──
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [arrivalAlerts, setArrivalAlerts] = useState(true);
  const [defaultCity, setDefaultCity] = useState("Kathmandu");

  const [appearance, setAppearance] = useState<"system" | "light" | "dark">(
      "light",
  );
  const [language, setLanguage] = useState<"ENG" | "NEP">("ENG");

  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // ── Helper: initials fallback for avatar ──
  const getInitials = (fullName: string) => {
    const trimmed = fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return trimmed || "?";
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
        <div className="mx-auto space-y-6 pb-12">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded mb-8" />
            <div className="flex gap-10">
              <div className="w-40 h-40 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-64 bg-slate-200 rounded mt-6" />
                <div className="h-4 w-64 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
        <div className="mx-auto pb-12 text-center py-16">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-500 text-sm font-medium">{error}</p>
          <button
              onClick={() => window.location.reload()}
              className="mt-3 text-[#e8683f] text-sm font-semibold hover:underline"
          >
            Try again
          </button>
        </div>
    );
  }

  return (
      <div className="mx-auto space-y-6 pb-12 font-sans text-gray-800">
        {/* ── CARD 1: PROFILE INFORMATION ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <h3 className="text-sm font-bold text-[#1e3a8a] tracking-tight mb-8">
            Profile Information
          </h3>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* LEFT SIDE */}
            <div className="flex flex-col md:flex-row items-center gap-10 flex-1">
              {/* AVATAR BLOCK */}
              <div className="relative shrink-0">
                <div className="w-40 h-40 rounded-full bg-[#0a337a] flex items-center justify-center text-white text-6xl font-bold select-none overflow-hidden">
                  {user?.profileImage ? (
                      <img
                          src={user.profileImage}
                          alt={user?.fullName || "Profile"}
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <span>{getInitials(user?.fullName || "")}</span>
                  )}
                </div>

                <AvatarMenu
                    currentImage={user?.profileImage ?? null}
                    onUploadClick={() => setShowEditProfileModal(true)}
                />
              </div>

              {/* User Information */}
              <div className="flex-1 min-w-0">
                {/* Name */}
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {user?.fullName || "—"}
                </h2>

                {/* Verified Account Pill Badge */}
                {user?.verified && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <CheckCircle2
                          size={15}
                          fill="#10b981"
                          className="text-white shrink-0"
                      />
                      <span className="text-xs font-semibold text-[#10b981]">
              Verified Account
            </span>
                    </div>
                )}

                {/* Contact Information */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                    Contact Information
                  </h4>

                  <div className="space-y-4 max-w-md">
                    {/* EMAIL ROW — read-only */}
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 truncate">
                  {user?.email}
                </span>
                      </div>

                      <span className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30">
                <ShieldCheck
                    className="w-3.5 h-3.5 fill-[#10b981]/10"
                    strokeWidth={2.5}
                />
                Verified
              </span>
                    </div>

                    {/* PHONE ROW — 3-state conditional */}
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <Phone size={16} className="text-slate-400 shrink-0" />
                        {user?.phoneNumber ? (
                            <span className="text-sm text-slate-700 truncate">
                    {user.phoneNumber}
                  </span>
                        ) : (
                            <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      Not Available
                    </span>
                              <button
                                  onClick={() => setShowAddPhoneModal(true)}
                                  className="text-[#e8683f] text-sm font-semibold hover:underline"
                              >
                                Add
                              </button>
                            </div>
                        )}
                      </div>

                      {user?.phoneNumber ? (
                          user?.phoneVerified ? (
                              <span className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30">
                    <ShieldCheck
                        className="w-3.5 h-3.5 fill-[#10b981]/10"
                        strokeWidth={2.5}
                    />
                    Verified
                  </span>
                          ) : (
                              <button
                                  onClick={() => setShowAddPhoneModal(true)}
                                  className="text-xs font-bold text-[#e8683f] shrink-0 select-none hover:underline"
                              >
                                Verify Now
                              </button>
                          )
                      ) : (
                          <span className="text-xs font-bold text-red-500 shrink-0 select-none">
                  Unverified
                </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE ACTION */}
            <div className="lg:self-end shrink-0">
              <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e8683f] text-[#e8683f] hover:bg-[#fff7f4] font-medium text-sm transition-all duration-200"
              >
                <PencilLine size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* CARD 2: FLEX TOKEN WALLET SECTION                        */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Flex Token Wallet
            </h3>
            <Info
                size={14}
                className="text-gray-400 cursor-pointer hover:text-gray-600 shrink-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reschedule token — wired to GET /appointments/reschedule-tokens/me */}
            <div className="bg-[#f0f4ff]/60 border border-[#dbe4ff] rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#f0f4ff]/80">
              <div className="w-14 h-14 rounded-full bg-[#dbe4ff] flex items-center justify-center text-[#1e3a8a] shrink-0 shadow-2xs">
                <Ticket size={24} className="rotate-45" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#1e3a8a]">
                  Reschedule Flex Token
                </h4>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#1e3a8a]">
                    {tokensLoading ? (
                        <span className="inline-block w-6 h-6 bg-[#dbe4ff] rounded animate-pulse align-middle" />
                    ) : (
                        rescheduleTokens?.tokensRemaining ?? "—"
                    )}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                  Available
                </span>
                </div>
                <p className="text-[9px] text-gray-400 font-normal italic">
                  {rescheduleTokens
                      ? `${rescheduleTokens.tokensTotal} emergency tokens allocated per year`
                      : "Allocated per year"}
                </p>
              </div>
            </div>

            {/* Cancellation token — NOT wired yet: no CancelToken backend exists.
                Left static intentionally until that entity/endpoint is built. */}
            <div className="bg-[#fff2ee]/60 border border-[#ffe3da] rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#fff2ee]/80">
              <div className="w-14 h-14 rounded-full bg-[#ffe3da] flex items-center justify-center text-[#e8683f] shrink-0 shadow-2xs">
                <Ticket size={24} className="-rotate-45" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900">
                  Cancellation Flex Token
                </h4>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#e8683f]">2</span>
                  <span className="text-[10px] text-gray-500 font-medium">
                  Available
                </span>
                </div>
                <p className="text-[9px] text-gray-400 font-normal italic">
                  2 emergency tokens allocated per year
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1.5 text-xs border-t border-gray-50">
            <p className="text-gray-500 text-[11px] font-medium">
              Use Flex Tokens to reschedule or cancel bookings without
              additional service charges.
            </p>
            <button className="text-[#e8683f] hover:text-[#d45b34] font-bold text-[11px] shrink-0 self-start sm:self-center hover:underline transition-all">
              Learn more
            </button>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* CARD 3: BOOKING ACTIVITY SECTION                         */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Booking Activity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f0f4ff]/60 border border-[#dbe4ff] rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#f0f4ff]/80">
              <div className="w-12 h-12 rounded-full bg-[#dbe4ff] flex items-center justify-center text-[#1e3a8a] shrink-0 shadow-2xs">
                <Calendar size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-gray-500 leading-tight">
                  Upcoming Bookings
                </h4>
                <span className="text-2xl font-black text-[#1e3a8a] block">
                2
              </span>
              </div>
            </div>

            <div className="bg-[#f0fdf4]/60 border border-[#dcfce7] rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#f0fdf4]/80">
              <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0 shadow-2xs">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-gray-500 leading-tight">
                  Completed Services
                </h4>
                <span className="text-2xl font-black text-[#16a34a] block">
                12
              </span>
              </div>
            </div>

            <div className="bg-[#fff2ee]/60 border border-[#ffe3da] rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#fff2ee]/80">
              <div className="w-12 h-12 rounded-full bg-[#ffe3da] flex items-center justify-center text-[#e8683f] shrink-0 shadow-2xs">
                <XCircle size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-gray-500 leading-tight">
                  Cancelled Services
                </h4>
                <span className="text-2xl font-black text-[#e8683f] block">
                1
              </span>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#f1f5f9]">
              <div className="w-12 h-12 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[#334155] shrink-0 shadow-2xs">
                <Briefcase size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-gray-500 leading-tight">
                  Total Bookings
                </h4>
                <span className="text-2xl font-black text-[#1e293b] block">
                15
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* CARD 4: PREFERENCES PANEL SECTION                        */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Preferences
          </h3>

          <div className="divide-y divide-gray-100 text-xs font-medium text-gray-600">
            <div className="flex items-center justify-between py-3.5">
              <span className="text-gray-700">Booking Updates</span>
              <button
                  onClick={() => setBookingUpdates(!bookingUpdates)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${bookingUpdates ? "bg-[#1e3a8a]" : "bg-gray-200"}`}
              >
                <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${bookingUpdates ? "translate-x-4.5" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-gray-700">Promotions & Offers</span>
              <button
                  onClick={() => setPromotions(!promotions)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${promotions ? "bg-[#1e3a8a]" : "bg-gray-200"}`}
              >
                <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${promotions ? "translate-x-4.5" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-gray-700">Provider Arrival Alerts</span>
              <button
                  onClick={() => setArrivalAlerts(!arrivalAlerts)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${arrivalAlerts ? "bg-[#1e3a8a]" : "bg-gray-200"}`}
              >
                <div
                    className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${arrivalAlerts ? "translate-x-4.5" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-gray-700">Default City</span>
              <select
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Bhaktapur">Bhaktapur</option>
                <option value="Pokhara">Pokhara</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-gray-700">Appearance</span>
              <div className="bg-gray-100 rounded-lg p-0.5 flex items-center border border-gray-200/50">
                <button
                    onClick={() => setAppearance("system")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${appearance === "system" ? "bg-[#1e3a8a] text-white shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                >
                  <Laptop size={12} /> System
                </button>
                <button
                    onClick={() => setAppearance("light")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${appearance === "light" ? "bg-[#1e3a8a] text-white shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                >
                  <Sun size={12} /> Light
                </button>
                <button
                    onClick={() => setAppearance("dark")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${appearance === "dark" ? "bg-[#1e3a8a] text-white shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                >
                  <Moon size={12} /> Dark
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-3.5">
            <span className="text-gray-700 flex items-center gap-1.5">
              Language
            </span>
              <div className="bg-gray-100 rounded-lg p-0.5 flex items-center border border-gray-200/50 relative">
                <button
                    onClick={() => setLanguage("ENG")}
                    className={`w-12 py-1 text-center rounded-md text-[10px] font-extrabold transition-all relative z-10 ${language === "ENG" ? "bg-[#1e3a8a] text-white shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                >
                  ENG
                </button>
                <button
                    onClick={() => setLanguage("NEP")}
                    className={`w-12 py-1 text-center rounded-md text-[10px] font-extrabold transition-all relative z-10 ${language === "NEP" ? "bg-[#1e3a8a] text-white shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                >
                  NEP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* CARD 5: SECURITY & SUPPORT SECTION                       */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Security & Support
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Manage your account security configurations, authentication
              factors, and legal resources.
            </p>
          </div>

          <div className="divide-y divide-gray-50 text-xs font-medium">
            <button className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-gray-50/70 text-left transition-colors group rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                  <Key size={15} />
                </div>
                <div className="space-y-0.5">
                <span className="text-gray-800 font-bold block">
                  Change Password
                </span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                  Update your master security passphrase regularly
                </span>
                </div>
              </div>
              <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>

            <button
                onClick={() => setShowAddPhoneModal(true)}
                className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-gray-50/70 text-left transition-colors group rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                  <Smartphone size={15} />
                </div>
                <div className="space-y-0.5">
                <span className="text-gray-800 font-bold block">
                  {user?.phoneNumber ? "Update Contact Number" : "Add Contact Number"}
                </span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                  Modify linked phone for emergency token dynamic alerts
                </span>
                </div>
              </div>
              <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>

            <div className="w-full flex items-center justify-between py-3.5 px-1 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50/50 flex items-center justify-center text-[#1e3a8a]">
                  <ShieldAlert size={15} />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-bold">
                    Two-Factor Authentication
                  </span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold">
                    {is2FAEnabled ? "Enabled" : "Disabled"}
                  </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal block">
                  Secure login sessions using secondary verification strings
                </span>
                </div>
              </div>

              <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`relative inline-flex h-[22px] w-10 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                      is2FAEnabled ? "bg-[#1e3a8a]" : "bg-gray-200"
                  }`}
              >
                <div
                    className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        is2FAEnabled ? "translate-x-[18px]" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            <button className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-gray-50/70 text-left transition-colors group rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                  <AlertCircle size={15} />
                </div>
                <div className="space-y-0.5">
                <span className="text-gray-800 font-bold block">
                  Report an Issue
                </span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                  Flag bugs, incorrect metrics, or provider exceptions
                </span>
                </div>
              </div>
              <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>

            <button className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-gray-50/70 text-left transition-colors group rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                  <HelpCircle size={15} />
                </div>
                <div className="space-y-0.5">
                <span className="text-gray-800 font-bold block">
                  Contact Support
                </span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                  Connect with operations teams regarding flex transactions
                </span>
                </div>
              </div>
              <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>

            <button className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-gray-50/70 text-left transition-colors group rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 transition-colors">
                  <FileText size={15} />
                </div>
                <div className="space-y-0.5">
                <span className="text-gray-800 font-bold block">
                  Terms of Service & Privacy Policy
                </span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                  Review cancellation legalities and account privacy
                  parameters
                </span>
                </div>
              </div>
              <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
            <button className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors group">
              <LogOut
                  size={14}
                  className="text-slate-500 group-hover:text-slate-700"
              />
              <span>Sign Out</span>
            </button>

            <button className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50/40 hover:bg-red-50 text-red-600 border border-transparent hover:border-red-100 font-bold text-xs transition-all group">
              <Trash2 size={14} className="text-red-500" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {showEditProfileModal && (
            <EditProfileModal
                currentName={user?.fullName || ""}
                currentImage={user?.profileImage || null}
                userId={user?.id ?? 0}    // 👈 थप्ने
                onClose={() => setShowEditProfileModal(false)}
                onSaved={(data) => {
                  dispatch(updateUserLocally(data));
                }}
            />
        )}

        {showAddPhoneModal && (
            <AddPhoneModal
                onClose={() => setShowAddPhoneModal(false)}
                onVerified={(verifiedPhone) => {
                  dispatch(updateUserLocally({         // ✅ Redux dispatch
                    phoneNumber: verifiedPhone,
                    phoneVerified: true,
                  }));
                }}
            />
        )}

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
  );
}