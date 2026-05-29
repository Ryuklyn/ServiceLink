"use client";

import { useState } from "react";
import {
  Camera,
  MapPin,
  Plus,
  ChevronRight,
  Key,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  LogOut,
  Edit2,
  Sun,
  Moon,
  Laptop,
  MessageSquare,
  Globe,
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

export default function SettingsPage() {
  // Profile Information States
  const [name, setName] = useState("Rukesh Shreshta");
  const [email, setEmail] = useState("rukesh@email.com");
  const [phone, setPhone] = useState("+977-9841234567");

  // Address Mock States (Matching image_b9067f.png)
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: "1", type: "Home", address: "Baneshwor, Kathmandu" },
    { id: "2", type: "Office", address: "New Baneshwor, Kathmandu" },
  ]);

  // Saved Providers Cards Stack (Matching image_b9067f.png footer layout)
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

  // Preference Toggle States (Matching image_b90699.png)
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [arrivalAlerts, setArrivalAlerts] = useState(true);
  const [defaultCity, setDefaultCity] = useState("Kathmandu");

  // Custom requested extended states: System/Light/Dark and ENG/NEP
  const [appearance, setAppearance] = useState<"system" | "light" | "dark">(
    "light",
  );
  const [language, setLanguage] = useState<"ENG" | "NEP">("ENG");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-gray-800">
      {/* ──────────────────────────────────────────────────────── */}
      {/* CARD 1: CORE PROFILE & ADDRESSES SECTION (image_b9067f.png) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-6">
        {/* User Badge Avatar Row */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center text-3xl font-bold tracking-wide shadow-inner">
              RS
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#e8683f] hover:bg-[#d45b34] text-white rounded-full transition-colors shadow-md border-2 border-white">
              <Camera size={14} fill="white" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 group">
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              <Edit2
                size={13}
                className="text-gray-400 cursor-pointer hover:text-gray-600"
              />
            </div>
            <p className="text-sm text-gray-400 font-medium">{email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-500 font-medium">
              <span>{phone}</span>
              <Edit2
                size={11}
                className="text-gray-400 cursor-pointer hover:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Saved Addresses Subsegment */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Saved Addresses
          </h3>

          <div className="space-y-2.5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-center justify-between text-sm py-2 px-3 border border-gray-50 rounded-lg hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span className="min-w-[55px] font-bold text-xs bg-blue-50 text-[#1e3a8a] px-2 py-0.5 rounded-md text-center">
                    {addr.type}
                  </span>
                  <span className="text-gray-600 text-xs font-medium">
                    {addr.address}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <button className="inline-flex items-center gap-1 text-xs font-bold text-[#e8683f] hover:text-[#d45b34] transition-colors mt-1">
            <Plus size={14} strokeWidth={2.5} /> Add New Address
          </button>
        </div>

        {/* Global Save Trigger Block */}
        <div className="pt-2 border-t border-gray-50">
          <button className="w-full py-3 bg-[#e8683f] hover:bg-[#d45b34] text-white font-bold text-sm rounded-xl transition-colors shadow-xs tracking-wide">
            Save Changes
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* CARD 2: SAVED PROVIDERS SCROLLER SECTION (image_b9067f.png) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          Saved Providers
        </h3>

        {/* Horizontal Card Slider Container */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar w-full">
          {savedProviders.map((prov) => (
            <div
              key={prov.id}
              className="min-w-[240px] md:min-w-[260px] bg-white border border-gray-100 rounded-xl p-3.5 space-y-3.5 shadow-2xs shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e3a8a] text-white font-bold text-xs rounded-full flex items-center justify-center shrink-0">
                  {prov.initials}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-gray-900 truncate">
                    {prov.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {prov.specialty}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(prov.rating)].map((_, i) => (
                      <span key={i} className="text-amber-500 text-xs">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Operations Mini Bar */}
              <div className="flex items-center gap-1.5 pt-1">
                <button className="flex-1 py-1.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-[10px] rounded-md transition-colors flex items-center justify-center gap-1 shadow-2xs">
                  <MessageSquare size={11} fill="white" /> WhatsApp
                </button>
                <button className="px-3 py-1.5 border border-[#e8683f] text-[#e8683f] hover:bg-orange-50 font-bold text-[10px] rounded-md transition-colors">
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* CARD 3: PREFERENCES PANEL SECTION (image_b90699.png Customised) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          Preferences
        </h3>

        <div className="divide-y divide-gray-100 text-xs font-medium text-gray-600">
          {/* Booking Updates Toggle */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-gray-700">Booking Updates</span>
            <button
              onClick={() => setBookingUpdates(!bookingUpdates)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${bookingUpdates ? "bg-[#25d366]" : "bg-gray-200"}`}
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${bookingUpdates ? "translate-x-4.5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Promotions & Offers Toggle */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-gray-700">Promotions & Offers</span>
            <button
              onClick={() => setPromotions(!promotions)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${promotions ? "bg-[#25d366]" : "bg-gray-200"}`}
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${promotions ? "translate-x-4.5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Provider Arrival Alerts Toggle */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-gray-700">Provider Arrival Alerts</span>
            <button
              onClick={() => setArrivalAlerts(!arrivalAlerts)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${arrivalAlerts ? "bg-[#25d366]" : "bg-gray-200"}`}
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${arrivalAlerts ? "translate-x-4.5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Default City Dropdown Selection Row */}
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

          {/* Appearance Mode Segment - Enhanced to System/Light/Dark Layout */}
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

          {/* New Custom Language Optimization Switch Row (ENG to NEP) */}
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
      {/* CARD 4: SECURITY & SUPPORT LIST SECTION (image_b90699.png) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          Security & Support
        </h3>

        <div className="space-y-1 text-xs font-medium text-gray-600">
          {/* Item 1 */}
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 text-left transition-colors group">
            <div className="flex items-center gap-3">
              <Key
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
              <span className="text-gray-700">Change Password</span>
            </div>
            <ChevronRight
              size={15}
              className="text-gray-300 group-hover:text-gray-400"
            />
          </button>

          {/* Item 2 */}
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 text-left transition-colors group">
            <div className="flex items-center gap-3">
              <ShieldAlert
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
              <span className="text-gray-700">Two-Factor Authentication</span>
            </div>
            <ChevronRight
              size={15}
              className="text-gray-300 group-hover:text-gray-400"
            />
          </button>

          {/* Item 3 */}
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 text-left transition-colors group">
            <div className="flex items-center gap-3">
              <AlertCircle
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
              <span className="text-gray-700">Report an Issue</span>
            </div>
            <ChevronRight
              size={15}
              className="text-gray-300 group-hover:text-gray-400"
            />
          </button>

          {/* Item 4 */}
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-gray-50 text-left transition-colors group">
            <div className="flex items-center gap-3">
              <HelpCircle
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
              <span className="text-gray-700">Contact Support</span>
            </div>
            <ChevronRight
              size={15}
              className="text-gray-300 group-hover:text-gray-400"
            />
          </button>

          {/* Item 5 - Logout Trigger */}
          <button className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-red-50/50 text-left transition-colors group">
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-red-500" />
              <span className="text-red-600 font-semibold">Logout</span>
            </div>
            <ChevronRight
              size={15}
              className="text-red-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Global Embedded Clean Scrollbar Rules Injection */}
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
