// "use client";

// import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
// import {
//   MessageCircle,
//   Phone,
//   Info,
//   CalendarCheck,
//   CalendarDays,
//   X,
//   Mic,
//   MicOff,
//   Upload,
//   MapPin,
//   Navigation,
//   ShieldCheck,
//   ArrowLeft,
// } from "lucide-react";
// import { ProviderData } from "./types";

// // Map imports handled safely for Next.js client component hydration
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// const iconSf = L.icon({
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// interface BookingSidebarProps {
//   provider: ProviderData;
//   selectedServiceIndex: number;
//   onServiceIndexChange:
//     | Dispatch<SetStateAction<number>>
//     | ((index: number) => void);
//   capturedIssueText: string;
//   globalSelectedDate: number;
//   globalSelectedTime: string;
// }

// const COMMON_ISSUES = [
//   "Fan not working",
//   "Switchboard issue",
//   "Wall touch-up",
//   "Door lock replacement",
// ];

// export default function BookingSidebar({
//   provider,
//   selectedServiceIndex,
//   onServiceIndexChange,
//   capturedIssueText,
//   globalSelectedDate,
//   globalSelectedTime,
// }: BookingSidebarProps) {
//   // --- Step Flow Controller ---
//   // false = Standard Pricing Snapshot View
//   // true = Live Data Input / Location Confirmation View
//   const [isConfirmingFlow, setIsConfirmingFlow] = useState(false);

//   // --- Internal Field States ---
//   const [problemDescription, setProblemDescription] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
//   const [position, setPosition] = useState<[number, number]>([
//     27.6756, 85.3452,
//   ]); // Kathmandu Valley Default
//   const [address, setAddress] = useState(
//     "Koteshwor-3, Ring Road, Kathmandu, Nepal",
//   );
//   const [landmark, setLandmark] = useState("");
//   const [isLocating, setIsLocating] = useState(false);

//   const recognitionRef = useRef<any>(null);
//   const activeService =
//     provider.services[selectedServiceIndex] || provider.services[0];

//   // Sync structural problem description if passed down from a parent section
//   useEffect(() => {
//     if (capturedIssueText) {
//       setProblemDescription(capturedIssueText);
//     }
//   }, [capturedIssueText]);

//   // Voice engine initializer
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const SpeechClass =
//         (window as any).SpeechRecognition ||
//         (window as any).webkitSpeechRecognition;
//       if (SpeechClass) {
//         const rec = new SpeechClass();
//         rec.continuous = true;
//         rec.interimResults = true;
//         rec.lang = "en-US";
//         rec.onresult = (e: any) => {
//           let trans = "";
//           for (let i = e.resultIndex; i < e.results.length; ++i) {
//             trans += e.results[i][0].transcript;
//           }
//           setProblemDescription((prev) => (prev ? prev + " " + trans : trans));
//         };
//         rec.onend = () => setIsListening(false);
//         recognitionRef.current = rec;
//       }
//     }
//   }, []);

//   const toggleVoice = () => {
//     if (!recognitionRef.current)
//       return alert("Speech recognition unsupported in this browser header.");
//     if (isListening) {
//       recognitionRef.current.stop();
//     } else {
//       setIsListening(true);
//       recognitionRef.current.start();
//     }
//   };

//   const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const fileUrls = Array.from(e.target.files).map((file) =>
//         URL.createObjectURL(file),
//       );
//       setUploadedPhotos((prev) => [...prev, ...fileUrls]);
//     }
//   };

//   const autoFetchLocation = () => {
//     setIsLocating(true);
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords;
//           setPosition([latitude, longitude]);
//           setAddress(
//             `GPS Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (Verified Location)`,
//           );
//           setIsLocating(false);
//         },
//         () => {
//           setIsLocating(false);
//           alert("Could not pull live GPS. Drag marker directly on map layout.");
//         },
//       );
//     }
//   };

//   function MapMarkerController() {
//     useMapEvents({
//       click(e) {
//         setPosition([e.latlng.lat, e.latlng.lng]);
//         setAddress(
//           `Pinned near Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`,
//         );
//       },
//     });
//     return <Marker position={position} icon={iconSf} />;
//   }

//   // =========================================================================
//   // VIEW 1: STANDALONE SIDEBAR PREVIEW DESIGN
//   // =========================================================================
//   if (!isConfirmingFlow) {
//     return (
//       <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4 select-none animate-fadeIn">
//         <div className="flex items-center justify-between border-b border-slate-50 pb-3">
//           <div>
//             <h2 className="font-extrabold text-slate-900 text-base tracking-tight">
//               Book a Service
//             </h2>
//             <p className="text-xs text-gray-400 mt-0.5">
//               Select from pre-verified tasks
//             </p>
//           </div>
//           <CalendarDays className="text-[#1e3a8a] w-5 h-5 opacity-80" />
//         </div>

//         <div className="space-y-1.5">
//           <label className="text-xs font-bold text-gray-400 block px-0.5">
//             Choose Subservice Type
//           </label>
//           <select
//             value={selectedServiceIndex}
//             onChange={(e) => onServiceIndexChange(Number(e.target.value))}
//             className="w-full border border-gray-200 rounded-xl px-3 py-3 text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 bg-white cursor-pointer"
//           >
//             {provider.services.map((s, idx) => (
//               <option key={s.name} value={idx}>
//                 [{s.category}] {s.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
//           <div>
//             <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
//               Est. Budget Range
//             </span>
//             <span className="text-base font-black text-[#e8683f] mt-0.5 block">
//               Rs. {activeService.priceMin.toLocaleString()} &ndash;{" "}
//               {activeService.priceMax.toLocaleString()}
//             </span>
//           </div>
//           <div className="text-right">
//             <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
//               Duration
//             </span>
//             <span className="text-xs font-bold text-slate-700 mt-0.5 block">
//               {activeService.duration}
//             </span>
//           </div>
//         </div>

//         <div className="bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700">
//           <span className="text-gray-400 font-medium">Selected Schedule:</span>
//           <span>
//             May {globalSelectedDate} ({globalSelectedTime})
//           </span>
//         </div>

//         <div className="bg-amber-50/60 border border-amber-100/70 rounded-xl px-3 py-3 flex gap-2.5 items-start">
//           <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
//           <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
//             Free platform cancellations up to 4 hours before dispatch.
//           </p>
//         </div>

//         <div className="flex flex-col gap-2 mt-2">
//           <button
//             onClick={() => setIsConfirmingFlow(true)}
//             className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white font-extrabold py-3.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 tracking-wide"
//           >
//             <CalendarCheck size={15} strokeWidth={2.5} />
//             Book Appointment Now
//           </button>

//           <a
//             href={`https://wa.me/9779800000000?text=Hello%20ServiceLink,%20I%20want%20to%20book%20${encodeURIComponent(activeService.name)}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
//           >
//             <MessageCircle className="w-4 h-4" />
//             WhatsApp Chat
//           </a>
//         </div>
//       </div>
//     );
//   }

//   // =========================================================================
//   // VIEW 2: OPTIMIZED PROGRESSIVE FORM RE-FLOW (NO MODAL APPROACH)
//   // =========================================================================
//   return (
//     <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-lg flex flex-col gap-5 select-none animate-fadeIn">
//       {/* Header Context Switch */}
//       <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//         <button
//           onClick={() => setIsConfirmingFlow(false)}
//           className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
//         >
//           <ArrowLeft size={14} /> Back
//         </button>
//         <span className="text-xs font-black text-[#1e3a8a] bg-blue-50 px-2.5 py-1 rounded-full">
//           Step 2: Execution Details
//         </span>
//       </div>

//       {/* 1. Task Summary Header Details */}
//       <div className="space-y-1">
//         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
//           Target Service
//         </span>
//         <div className="text-sm font-black text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
//           [{activeService.category}] {activeService.name} &mdash;{" "}
//           <span className="text-gray-500 font-normal">
//             {activeService.duration}
//           </span>
//         </div>
//       </div>

//       {/* 2. Voice / Text Context Diagnostic Engine */}
//       <div className="space-y-2">
//         <label className="text-xs font-extrabold text-slate-800 block">
//           Describe the Problem
//         </label>
//         <div className="relative border border-gray-200 rounded-xl p-3 bg-slate-50">
//           <textarea
//             value={problemDescription}
//             onChange={(e) => setProblemDescription(e.target.value)}
//             placeholder="Explain your diagnostic state details or prompt here..."
//             className="w-full min-h-[70px] bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none resize-none border-0 p-0 focus:ring-0 leading-relaxed"
//           />
//           <button
//             onClick={toggleVoice}
//             className={`absolute bottom-2 right-2 p-2 rounded-full shadow transition-all ${
//               isListening
//                 ? "bg-red-500 text-white animate-pulse"
//                 : "bg-[#1e3a8a] text-white hover:bg-blue-800"
//             }`}
//           >
//             {isListening ? <MicOff size={13} /> : <Mic size={13} />}
//           </button>
//         </div>

//         {isListening && (
//           <div className="text-[10px] text-red-500 font-bold flex items-center gap-1">
//             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
//             Listening to active mic pipeline...
//           </div>
//         )}

//         <div className="flex flex-wrap gap-1.5">
//           {COMMON_ISSUES.map((issue) => (
//             <button
//               key={issue}
//               onClick={() =>
//                 setProblemDescription((prev) =>
//                   prev ? `${prev}, ${issue.toLowerCase()}` : issue,
//                 )
//               }
//               className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 font-medium transition-all"
//             >
//               + {issue}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* 3. Upload Photo Modules */}
//       <div className="space-y-1.5">
//         <label className="text-xs font-extrabold text-slate-800 block">
//           Upload Photos{" "}
//           <span className="text-gray-400 font-normal">(Optional)</span>
//         </label>
//         <div className="grid grid-cols-4 gap-2">
//           <label className="border border-dashed border-gray-300 hover:border-[#1e3a8a] rounded-xl flex flex-col justify-center items-center p-2 cursor-pointer transition-colors bg-slate-50 min-h-[60px]">
//             <Upload size={16} className="text-gray-400" />
//             <span className="text-[9px] font-bold text-gray-500 mt-0.5">
//               Add
//             </span>
//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               className="hidden"
//               onChange={handlePhotoUpload}
//             />
//           </label>
//           {uploadedPhotos.slice(0, 3).map((url, idx) => (
//             <div
//               key={idx}
//               className="rounded-xl overflow-hidden border border-gray-200 bg-slate-100 h-[60px]"
//             >
//               <img
//                 src={url}
//                 alt="Attachment clip preview"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 4. Synced Target Schedule Date String */}
//       <div className="space-y-1">
//         <label className="text-xs font-extrabold text-slate-800 block">
//           Schedule Allocation
//         </label>
//         <div className="flex items-center justify-between text-xs font-bold bg-[#1e3a8a]/5 text-[#1e3a8a] p-3 rounded-xl border border-blue-100/40">
//           <span>📅 May {globalSelectedDate}, 2026</span>
//           <span className="capitalize">⏱️ {globalSelectedTime} Slot</span>
//         </div>
//       </div>

//       {/* 5. Inline Geolocation Map and Landmarks parameters */}
//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <label className="text-xs font-extrabold text-slate-800">
//             Set Service Location
//           </label>
//           <button
//             onClick={autoFetchLocation}
//             disabled={isLocating}
//             className="flex items-center gap-1 text-[10px] font-bold text-[#1e3a8a] hover:underline disabled:opacity-50"
//           >
//             <Navigation
//               size={10}
//               className={isLocating ? "animate-spin" : ""}
//             />
//             Auto-GPS
//           </button>
//         </div>

//         {/* Embedded Mini Leaflet map block inside sidebar container wrapper */}
//         <div className="w-full h-28 rounded-xl overflow-hidden border border-gray-200 relative z-10">
//           <MapContainer
//             center={position}
//             zoom={14}
//             style={{ height: "100%", width: "100%" }}
//             zoomControl={false}
//           >
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//             <MapMarkerController />
//           </MapContainer>
//         </div>

//         <div className="space-y-2 text-[11px]">
//           <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-700">
//             <MapPin size={12} className="text-gray-400 shrink-0" />
//             <input
//               type="text"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               className="bg-transparent border-none p-0 outline-none w-full text-[11px] focus:ring-0 font-medium"
//             />
//           </div>

//           <input
//             type="text"
//             placeholder="Landmark / Ward Note / House No."
//             value={landmark}
//             onChange={(e) => setLandmark(e.target.value)}
//             className="w-full border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 outline-none font-medium focus:border-blue-400"
//           />
//         </div>
//       </div>

//       {/* 6. Pricing Calculation Ledger Ledger System Block & Checkout Execution */}
//       <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
//               Estimated Total Cost
//             </span>
//             <span className="text-lg font-black text-[#e8683f]">
//               Rs. {activeService.priceMin} &ndash; {activeService.priceMax}
//             </span>
//           </div>
//           <div className="text-right text-[9px] text-gray-400 font-medium max-w-[120px] leading-tight">
//             <ShieldCheck size={12} className="text-emerald-500 inline mr-0.5" />{" "}
//             ServiceLink Protection verified.
//           </div>
//         </div>

//         <button
//           onClick={() => {
//             alert(
//               `Booking successfully completed for ${activeService.name}!\nScheduled: May ${globalSelectedDate} during ${globalSelectedTime}.\nLocation string: ${landmark || address}`,
//             );
//             setIsConfirmingFlow(false);
//           }}
//           className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-md tracking-wide text-center"
//         >
//           Confirm & Book Appointment
//         </button>
//       </div>
//     </div>
//   );
// }

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
} from "lucide-react";
import { ProviderData } from "./types";

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

// Default Kathmandu center
const DEFAULT_LAT = 27.7172;
const DEFAULT_LNG = 85.324;

// ─── Map Click Handler ────────────────────────────────────────────────────────

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  // Dynamic import to avoid SSR issues
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
  // ── Step 1 & 2: Services & Task Summary ──────────────────────────────────
  const [taskSummary, setTaskSummary] = useState(externalIssue ?? "");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sync incoming issue description
  useEffect(() => {
    if (externalIssue !== undefined) setTaskSummary(externalIssue);
  }, [externalIssue]);

  // Speech recognition
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

  // ── Step 3: Photos ────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  // ── Step 4: Date & Time ───────────────────────────────────────────────────
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

  const currentDayData = CALENDAR_DATA[selectedDate];
  const calendarDates = Object.keys(CALENDAR_DATA).map(Number);

  // ── Step 5: Location (React Leaflet) ─────────────────────────────────────
  const [markerPos, setMarkerPos] = useState<[number, number]>([
    DEFAULT_LAT,
    DEFAULT_LNG,
  ]);
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [ward, setWard] = useState("");
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

  // ── Step 6: Pricing ───────────────────────────────────────────────────────
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

  // Format date display
  const dayData = CALENDAR_DATA[selectedDate];
  const monthName = selectedDate === 1 ? "Jun" : "May";
  const dateDisplay = dayData
    ? `${dayData.dayName}, ${monthName} ${selectedDate}`
    : "";
  const periodInfo = selectedPeriod ? PERIOD_LABELS[selectedPeriod] : null;

  // Leaflet icon fix (needed for Next.js)
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

  // ─────────────────────────────────────────────────────────────────────────
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

        {/* ── Date & Time ── */}
        <div className="px-5 py-4">
          {/* Mini Calendar Strip */}
          {/* <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
            {calendarDates.map((dateNum) => {
              const d = CALENDAR_DATA[dateNum];
              const isSelected = selectedDate === dateNum;
              return (
                <button
                  key={dateNum}
                  disabled={!d.hasSlots}
                  onClick={() => {
                    if (!d.hasSlots) return;
                    setSelectedDate(dateNum);
                    const first = d.slots.find((s) => s.available);
                    setSelectedPeriod(first ? first.period : null);
                  }}
                  className={`flex flex-col items-center min-w-[40px] py-2 rounded-xl text-xs transition-all ${
                    isSelected
                      ? "bg-[#1e3a8a] text-white"
                      : d.hasSlots
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <span className="font-medium opacity-75">{d.dayName}</span>
                  <span className="font-bold text-sm">{dateNum}</span>
                  {d.hasSlots && (
                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div> */}

          {/* Time slot pills */}
          {/* <div className="flex gap-2">
            {(["morning", "afternoon", "evening"] as const).map((period) => {
              const slot = currentDayData?.slots.find(
                (s) => s.period === period,
              );
              const available = slot?.available ?? false;
              const isSelected = selectedPeriod === period;
              const info = PERIOD_LABELS[period];
              const Icon = info.icon;
              return (
                <button
                  key={period}
                  disabled={!available}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl text-xs border transition-all ${
                    isSelected
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                      : available
                        ? "border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-gray-50"
                        : "border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Icon size={13} className="mb-1" />
                  <span className="font-semibold">{info.label}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}
                  >
                    {info.time}
                  </span>
                </button>
              );
            })}
          </div> */}

          {/* Selected date/time display */}
          {dateDisplay && periodInfo && (
            <div className="flex gap-2 mt-3">
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
        </div>

        {/* ── Location ── */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500">
              Service Location
            </p>
            <button
              onClick={detectCurrentLocation}
              disabled={isGeoLoading}
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

          {/* Address input */}
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

          {/* Landmark & Ward */}
          {/* <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Landmark (e.g. near school)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="Ward no."
              className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div> */}

          {/* Toggle Map */}
          <button
            onClick={() => setShowMap((v) => !v)}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#1e3a8a] border border-[#1e3a8a]/20 rounded-xl py-2 hover:bg-blue-50 transition-colors"
          >
            <MapPin size={13} />
            {showMap ? "Hide Map" : "Pin on Map"}
          </button>

          {/* Leaflet Map */}
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

        {/* ── Cancellation Notice ── */}
        <div className="px-5 py-3">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Free cancellation up to 2 hours before scheduled time
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <button className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-sm">
            Book Now
          </button>
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <MessageCircle size={15} />
              WhatsApp
            </button>
            <button className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Phone size={15} />
              Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
