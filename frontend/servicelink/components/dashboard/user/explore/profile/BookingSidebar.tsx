"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Info,
  Mic,
  MicOff,
  Upload,
  CheckCircle2,
  MapPin,
  Sun,
  Sunset,
  Moon,
  X,
  Navigation,
  Loader2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { ProviderData } from "./types";
import BookingDetailModal from "./BookingDetailsModal";

// ─── Leaflet dynamic import (SSR-safe) ───────────────────────────────────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface BookingSidebarProps {
  provider: ProviderData;
  /** Services added via the ServicesPricing "Add" button */
  selectedServices?: { name: string; priceMin: number; priceMax: number }[];
  /** Issue description from DescribeIssue component */
  issueDescription?: string;
  /** Selected date number from AvailabilityCalendar */
  selectedDate?: number;
  /** Selected slot period from AvailabilityCalendar */
  selectedPeriod?: "morning" | "afternoon" | "evening" | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CALENDAR_DATA: Record<
  number,
  {
    dayName: string;
    hasSlots: boolean;
    slots: {
      id: string;
      period: "morning" | "afternoon" | "evening";
      available: boolean;
    }[];
  }
> = {
  26: {
    dayName: "Mon",
    hasSlots: true,
    slots: [
      { id: "m1", period: "morning", available: true },
      { id: "a1", period: "afternoon", available: true },
      { id: "e1", period: "evening", available: false },
    ],
  },
  27: {
    dayName: "Tue",
    hasSlots: true,
    slots: [
      { id: "m2", period: "morning", available: true },
      { id: "a2", period: "afternoon", available: false },
      { id: "e2", period: "evening", available: false },
    ],
  },
  28: {
    dayName: "Wed",
    hasSlots: false,
    slots: [
      { id: "m3", period: "morning", available: false },
      { id: "a3", period: "afternoon", available: false },
      { id: "e3", period: "evening", available: false },
    ],
  },
  29: {
    dayName: "Thu",
    hasSlots: true,
    slots: [
      { id: "m4", period: "morning", available: true },
      { id: "a4", period: "afternoon", available: true },
      { id: "e4", period: "evening", available: true },
    ],
  },
  30: {
    dayName: "Fri",
    hasSlots: true,
    slots: [
      { id: "m5", period: "morning", available: false },
      { id: "a5", period: "afternoon", available: true },
      { id: "e5", period: "evening", available: false },
    ],
  },
  31: {
    dayName: "Sat",
    hasSlots: true,
    slots: [
      { id: "m6", period: "morning", available: true },
      { id: "a6", period: "afternoon", available: true },
      { id: "e6", period: "evening", available: false },
    ],
  },
  1: {
    dayName: "Sun",
    hasSlots: true,
    slots: [
      { id: "m7", period: "morning", available: true },
      { id: "a7", period: "afternoon", available: false },
      { id: "e7", period: "evening", available: false },
    ],
  },
};

const PERIOD_LABELS: Record<
  string,
  { label: string; time: string; icon: React.ElementType }
> = {
  morning: { label: "Morning", time: "8–12 AM", icon: Sun },
  afternoon: { label: "Afternoon", time: "12–5 PM", icon: Sunset },
  evening: { label: "Evening", time: "5–8 PM", icon: Moon },
};

const DEFAULT_LAT = 27.7172;
const DEFAULT_LNG = 85.324;

// ─── Map Click Handler ────────────────────────────────────────────────────────

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const { useMapEvents } = require("react-leaflet");
  useMapEvents({
    click(e: any) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingSidebar({
  provider,
  selectedServices: externalServices,
  issueDescription: externalIssue,
  selectedDate: externalDate,
  selectedPeriod: externalPeriod,
}: BookingSidebarProps) {
  // Modal Open/Close Toggle State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Task Summary State
  const [taskSummary, setTaskSummary] = useState(externalIssue ?? "");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sync incoming external change sets
  useEffect(() => {
    if (externalIssue !== undefined) setTaskSummary(externalIssue);
  }, [externalIssue]);

  // Speech recognition engine instantiation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      setTaskSummary((prev) => (prev ? `${prev} ${final}` : final));
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported. Please type instead.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Photos State Management
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  // Date/Time State Management
  const [selectedDate, setSelectedDate] = useState<number>(externalDate ?? 29);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "morning" | "afternoon" | "evening" | null
  >(externalPeriod ?? "morning");

  useEffect(() => {
    if (externalDate !== undefined) setSelectedDate(externalDate);
  }, [externalDate]);

  useEffect(() => {
    if (externalPeriod !== undefined) setSelectedPeriod(externalPeriod);
  }, [externalPeriod]);

  // Map / Location Geocode States
  const [markerPos, setMarkerPos] = useState<[number, number]>([
    DEFAULT_LAT,
    DEFAULT_LNG,
  ]);
  const [address, setAddress] = useState("");
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<any>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      const addr = data.address;
      const parts = [
        addr.road || addr.pedestrian,
        addr.neighbourhood || addr.suburb,
        addr.city || addr.town || addr.village,
      ].filter(Boolean);
      setAddress(parts.join(", ") || data.display_name);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  }, []);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPos([lat, lng]);
        await reverseGeocode(lat, lng);
        setIsGeoLoading(false);
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
        }
      },
      () => {
        setIsGeoLoading(false);
        alert("Unable to detect location. Please pin it on the map.");
      },
      { enableHighAccuracy: true },
    );
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    await reverseGeocode(lat, lng);
  };

  // Service Breakdown calculations
  const services =
    externalServices && externalServices.length > 0
      ? externalServices
      : provider.services.slice(0, 1).map((s) => ({
          name: s.name,
          priceMin: s.priceMin,
          priceMax: s.priceMax,
        }));

  const estimatedMin = services.reduce((sum, s) => sum + s.priceMin, 0);
  const estimatedMax = services.reduce((sum, s) => sum + s.priceMax, 0);

  const dayData = CALENDAR_DATA[selectedDate];
  const monthName = selectedDate === 1 ? "Jun" : "May";
  const dateDisplay = dayData
    ? `${dayData.dayName}, ${monthName} ${selectedDate}`
    : "";
  const periodInfo = selectedPeriod ? PERIOD_LABELS[selectedPeriod] : null;

  // Leaflet image fixes for Next.js build
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col gap-0 overflow-hidden max-w-sm w-full">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg leading-tight">
          Book This Provider
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {provider.specialties?.join(", ") ??
            "Multi-category certified: Electrical, Carpentry, Painting"}
        </p>
      </div>

      <div className="flex flex-col gap-0 divide-y divide-gray-100">
        {/* ── Selected Services ── */}
        {services.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Selected Services
            </p>
            <div className="flex flex-col gap-1.5">
              {services.map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-3 py-2"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {svc.name}
                  </span>
                  <span className="text-sm font-bold text-[#e8683f]">
                    Rs. {svc.priceMin.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Task Summary (Voice / Text) ── */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Task Summary
          </p>
          <div className="relative border border-gray-200 rounded-xl bg-gray-50 focus-within:border-blue-300 transition-colors">
            <textarea
              value={taskSummary}
              onChange={(e) => setTaskSummary(e.target.value)}
              placeholder="Brief summary of your task..."
              rows={3}
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none p-3 pr-12 rounded-xl"
            />
            <button
              onClick={toggleListening}
              type="button"
              className={`absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow transition-all ${
                isListening
                  ? "bg-red-100 text-red-500 animate-pulse"
                  : "bg-[#1e3a8a] text-white hover:bg-blue-900"
              }`}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          </div>
          {isListening && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 bg-red-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              <span className="text-xs text-red-500 font-medium">
                Listening...
              </span>
            </div>
          )}
        </div>

        {/* ── Photos ── */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Photos (optional)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
          {photos.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <Upload size={15} />
              Upload photos of the issue
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 border border-green-200 bg-green-50 rounded-xl py-2.5 cursor-pointer"
              >
                <CheckCircle2 size={15} className="text-green-500" />
                <span className="text-sm font-semibold text-green-700">
                  {photos.length} photo{photos.length > 1 ? "s" : ""} added
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {photos.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      type="button"
                      className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Selected Date/Time ── */}
        {dateDisplay && periodInfo && (
          <div className="px-5 py-4 flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                Date
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#1e3a8a]" />
                {dateDisplay}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                Time
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {periodInfo.label} ({periodInfo.time})
              </p>
            </div>
          </div>
        )}

        {/* ── Location ── */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500">
              Service Location
            </p>
            <button
              onClick={detectCurrentLocation}
              disabled={isGeoLoading}
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:underline disabled:opacity-50"
            >
              {isGeoLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Navigation size={12} />
              )}
              Auto-detect
            </button>
          </div>

          <div className="relative mb-2">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter or detect your address"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 bg-white"
            />
          </div>

          <button
            onClick={() => setShowMap((v) => !v)}
            type="button"
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#1e3a8a] border border-[#1e3a8a]/20 rounded-xl py-2 hover:bg-blue-50 transition-colors"
          >
            <MapPin size={13} />
            {showMap ? "Hide Map" : "Pin on Map"}
          </button>

          {showMap && (
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-44">
              <MapContainer
                center={markerPos}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={markerPos}>
                  <Popup>Service location</Popup>
                </Marker>
                <MapClickHandler onLocationSelect={handleMapClick} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* ── Estimated Price ── */}
        <div className="px-5 py-4 bg-gray-50">
          <p className="text-xs text-gray-400 font-semibold mb-1">
            Estimated Price
          </p>
          <p className="text-2xl font-bold text-[#1e3a8a] leading-none">
            Rs.{" "}
            {estimatedMin === estimatedMax
              ? estimatedMin.toLocaleString()
              : `${estimatedMin.toLocaleString()} – ${estimatedMax.toLocaleString()}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Final price may vary based on actual work required
          </p>
        </div>

        {/* ── Cancellation & Rescheduling Notice ── */}
        <div className="px-5 py-3">
          {/* Policy Container with sharp brand accents */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm select-none">
            {/* Header Ribbon */}
            <div className="flex items-center gap-1.5 bg-slate-50 border-b border-slate-100 px-4 py-2.5 text-[12px] font-bold text-[#1e3a8a]">
              <ShieldCheck
                size={14}
                className="text-[#1e3a8a] shrink-0"
                strokeWidth={2.5}
              />
              <span>Cancellation & Rescheduling policy</span>
            </div>

            {/* New Policy Structure Matrix */}
            <div className="flex flex-col text-[11px] bg-white divide-y divide-slate-100">
              {/* Safe Window: More than 24 Hours */}
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/30">
                <div>
                  <div className="font-bold text-gray-700 text-xs">
                    Before 24 hours
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    Applies to both changes & cancellations
                  </div>
                </div>
                <div className="text-[14px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  Free
                </div>
              </div>

              {/* Late Window Split: Less than 24 Hours */}
              <div className="grid grid-cols-2 divide-x divide-slate-100">
                {/* Late Rescheduling */}
                <div className="p-3 text-center">
                  <div className="text-gray-400 font-medium mb-1.5 leading-tight">
                    <div>Under 24 hrs</div>
                    <div className="text-slate-500 font-semibold mt-0.5">
                      Reschedule
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[14px] font-bold text-[#e8683f]">
                      Rs. 50
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                      or 1 Token
                    </span>
                  </div>
                </div>

                {/* Late Cancellation */}
                <div className="p-3 text-center">
                  <div className="text-gray-400 font-medium mb-1.5 leading-tight">
                    <div>Under 24 hrs</div>
                    <div className="text-slate-500 font-semibold mt-0.5">
                      Cancel
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[14px] font-bold text-red-500">
                      Rs. 100
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                      or 1 Token
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            Book Now
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              WhatsApp
            </button>
            <button
              type="button"
              className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={15} />
              Call
            </button>
          </div>
        </div>
      </div>

      {/* ── Render State-driven Booking Detailed Modal ── */}
      <BookingDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={provider}
        bookingDetails={{
          services,
          taskSummary,
          dateDisplay,
          timeDisplay: periodInfo
            ? `${periodInfo.label} (${periodInfo.time})`
            : "",
          estimatedMin,
          estimatedMax,
          address,
          photos,
        }}
      />
    </div>
  );
}
