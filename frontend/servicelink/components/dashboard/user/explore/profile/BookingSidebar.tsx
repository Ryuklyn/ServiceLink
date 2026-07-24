"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import axios from "axios";
import {
    Phone, Mic, Upload, CheckCircle2,
    MapPin, Sun, Sunset, Moon, X, Navigation, Loader2,
    Calendar, ShieldCheck, MousePointerClick, Video, Image,
} from "lucide-react";
import type { Map as LeafletMap } from "leaflet";
import { ProviderData } from "./types";
import BookingDetailModal from "./BookingDetailsModal";
import api from "@/utils/axios";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then((m) => m.Marker),       { ssr: false });

interface BookingSidebarProps {
    provider: ProviderData;
    selectedServices?: { name: string; priceMin: number; priceMax: number; catalogId?: number }[];
    issueDescription?: string;
    selectedDate?: Date;
    selectedPeriod?: "morning" | "afternoon" | "evening" | null;
    voiceNoteBlob?: Blob | null;
    voiceNoteUrl?: string | null;
}

interface MediaFileWrapper {
    file: File;
    previewUrl: string;
    type: "image" | "video";
}

interface AppointmentResponse {
    id: number;
    providerId: number;
    providerName: string;
    providerPhone: string;
    providerProfilePicture: string;
    serviceCatalogId: number;
    subServiceName: string;
    pricingUnit: string;
    effectiveDuration: string;
    providerCustomPrice: number;
    totalPrice: number;
    appointmentDate: string;
    timeSlot: string;
    scheduledAt: string;
    estimatedStartTime: string;
    estimatedEndTime: string;
    address: string;
    notes: string;
    status: string;
    attachedImgUrl: string | null;
    attachedVideoUrl: string | null;
    attachedAudioUrl: string | null;
}

// ProviderData doesn't declare `specialties` — kept as an optional extension
// rather than `as any`, so the cast stays type-checked.
interface ProviderWithSpecialties extends ProviderData {
    specialties?: string[];
    phone?: string;
}

const PERIOD_LABELS: Record<string, { label: string; time: string; icon: React.ElementType }> = {
    morning:   { label: "Morning",   time: "8–12 AM",  icon: Sun    },
    afternoon: { label: "Afternoon", time: "12–5 PM",  icon: Sunset },
    evening:   { label: "Evening",   time: "5–8 PM",   icon: Moon   },
};

const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DEFAULT_LAT = 27.7172;
const DEFAULT_LNG = 85.324;

function mapPeriodToTimeSlot(period: string): string {
    const map: Record<string, string> = {
        morning: "MORNING",
        afternoon: "AFTERNOON",
        evening: "EVENING",
    };
    return map[period] ?? "MORNING";
}

function formatDateDisplay(date: Date | undefined): string {
    if (!date) return "";
    return `${DAYS_SHORT[date.getDay()]}, ${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function formatDateForBackend(date: Date | undefined): string {
    if (!date) return "";
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day   = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** Type-safe extraction from an unknown catch value — replaces `catch (err: any)`. */
function extractBookingError(err: unknown): { status: number; message: string } {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        return {
            status: err.response?.status ?? 0,
            message: data?.message ?? err.message ?? "Booking failed. Please try again.",
        };
    }
    if (err instanceof Error) return { status: 0, message: err.message };
    return { status: 0, message: "Booking failed. Please try again." };
}

export default function BookingSidebar({
                                           provider,
                                           selectedServices: externalServices,
                                           issueDescription: externalIssue,
                                           selectedDate: externalDate,
                                           selectedPeriod: externalPeriod,
                                           voiceNoteBlob = null,
                                           voiceNoteUrl  = null,
                                       }: BookingSidebarProps) {
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [taskSummary, setTaskSummary]       = useState(externalIssue ?? "");
    const [media, setMedia]                   = useState<MediaFileWrapper | null>(null);
    const [markerPos, setMarkerPos]           = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG]);
    const [address, setAddress]               = useState("");
    const [isGeoLoading, setIsGeoLoading]     = useState(false);
    const [showMap, setShowMap]               = useState(false);
    const [isBooking, setIsBooking]           = useState(false);
    const [bookedAppointments, setBookedAppointments] = useState<AppointmentResponse[]>([]);

    const [localDate, setLocalDate]     = useState<Date | undefined>(externalDate);
    const [localPeriod, setLocalPeriod] = useState<"morning"|"afternoon"|"evening"|null>(externalPeriod ?? null);

    const [isPlayingNote, setIsPlayingNote] = useState(false);
    const notePlayerRef = useRef<HTMLAudioElement | null>(null);

    const toggleNotePlayback = () => {
        if (!notePlayerRef.current) return;
        if (isPlayingNote) notePlayerRef.current.pause();
        else notePlayerRef.current.play();
        setIsPlayingNote(!isPlayingNote);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mapRef        = useRef<LeafletMap | null>(null);

    const prevIssueRef = useRef(externalIssue);
    if (externalIssue !== undefined && externalIssue !== prevIssueRef.current) {
        prevIssueRef.current = externalIssue;
        setTaskSummary(externalIssue);
    }

    const prevDateRef = useRef(externalDate);
    if (externalDate !== undefined && externalDate !== prevDateRef.current) {
        prevDateRef.current = externalDate;
        setLocalDate(externalDate);
    }

    const prevPeriodRef = useRef(externalPeriod);
    if (externalPeriod !== prevPeriodRef.current) {
        prevPeriodRef.current = externalPeriod;
        setLocalPeriod(externalPeriod ?? null);
    }

    useEffect(() => {
        return () => { if (media) URL.revokeObjectURL(media.previewUrl); };
    }, [media]);

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (media) URL.revokeObjectURL(media.previewUrl);
        const isVideo = file.type.startsWith("video/");
        setMedia({ file, previewUrl: URL.createObjectURL(file), type: isVideo ? "video" : "image" });
        e.target.value = "";
    };

    const removeMedia = () => {
        if (media) URL.revokeObjectURL(media.previewUrl);
        setMedia(null);
    };

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
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
        if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
        setIsGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setMarkerPos([lat, lng]);
                await reverseGeocode(lat, lng);
                setIsGeoLoading(false);
                mapRef.current?.setView([lat, lng], 16);
            },
            () => { setIsGeoLoading(false); alert("Unable to detect location."); },
            { enableHighAccuracy: true }
        );
    };

    // Dynamic import instead of require() — also avoids the SSR/window issue
    // the same way the require() call did, without the lint violation.
    useEffect(() => {
        let cancelled = false;
        import("leaflet").then((L) => {
            if (cancelled) return;
            delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
        });
        return () => { cancelled = true; };
    }, []);

    const validateBooking = (): string | null => {
        if (!services.length)  return "Please select at least one service.";
        if (!localDate)        return "Please select an appointment date.";
        if (!localPeriod)      return "Please select a time slot (Morning / Afternoon / Evening).";
        if (!address.trim())   return "Please enter or detect your service address.";
        return null;
    };

    const handleBookNow = async () => {
        const validationError = validateBooking();
        if (validationError) {
            toast.warning(validationError, { position: "top-right" });
            return;
        }

        const firstService = services.find((svc) => svc.catalogId);
        if (!firstService?.catalogId) {
            toast.warning("Selected service is missing catalog ID.");
            return;
        }

        setIsBooking(true);

        try {
            let attachedImgUrl: string | null = null;
            let attachedVideoUrl: string | null = null;
            let attachedAudioUrl: string | null = null;

            if (media) {
                const formData = new FormData();
                formData.append("file", media.file);

                const { data: uploadData } = await api.post<{ url: string }>(
                    "/media/upload",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                if (media.type === "image") {
                    attachedImgUrl = uploadData.url;
                } else {
                    attachedVideoUrl = uploadData.url;
                }
            }

            if (voiceNoteBlob) {
                const audioFormData = new FormData();
                audioFormData.append("file", voiceNoteBlob, "voice-note.webm");

                const { data: audioUploadData } = await api.post<{ url: string }>(
                    "/media/upload",
                    audioFormData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                attachedAudioUrl = audioUploadData.url;
            }

            const payload = {
                providerId:       Number(provider.id),
                serviceCatalogId: firstService.catalogId,
                appointmentDate:  formatDateForBackend(localDate),
                timeSlot:         mapPeriodToTimeSlot(localPeriod!),
                address:          address.trim(),
                notes:            taskSummary.trim() || null,
                attachedImgUrl,
                attachedVideoUrl,
                attachedAudioUrl,
                itemCount: 1,
            };

            const { data } = await api.post<AppointmentResponse>("/appointments", payload);

            setBookedAppointments([data]);
            toast.success("Appointment booked successfully!", { position: "top-right" });
            setIsModalOpen(true);

        } catch (err: unknown) {
            const { status, message } = extractBookingError(err);

            if (status === 401) {
                toast.error("Please log in as a customer to book.", { position: "top-right" });
            } else if (status === 409 || message.includes("APPOINTMENT_SLOT_TAKEN")) {
                toast.error("That time slot is already booked. Please choose a different time.", { position: "top-right" });
            } else if (message.includes("SERVICE_UNAVAILABLE")) {
                toast.error("This service is currently unavailable.", { position: "top-right" });
            } else if (message.includes("upload") || message.includes("Supabase")) {
                toast.error("Failed to upload media. Please try again or remove the file.", { position: "top-right" });
            } else {
                toast.error(message, { position: "top-right" });
            }
        } finally {
            setIsBooking(false);
        }
    };

    const services     = externalServices ?? [];
    const hasServices  = services.length > 0;
    const estimatedMin = services.reduce((s, svc) => s + svc.priceMin, 0);
    const estimatedMax = services.reduce((s, svc) => s + svc.priceMax, 0);
    const dateDisplay  = formatDateDisplay(localDate);
    const periodInfo   = localPeriod ? PERIOD_LABELS[localPeriod] : null;
    const specialtiesLabel = (provider as ProviderWithSpecialties).specialties?.join(", ") ?? "Certified Local Expert";
    const providerPhone    = (provider as ProviderWithSpecialties).phone ?? "";

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col gap-0 overflow-hidden w-full max-w-sm sm:max-w-md lg:max-w-sm mx-auto">
            {/* Header Title Stack */}
            <div className="px-4 sm:px-5 pt-5 pb-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg leading-tight">Book This Provider</h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{specialtiesLabel}</p>
            </div>

            <div className="flex flex-col gap-0 divide-y divide-gray-100">

                {/* Selected Services Layout */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Selected Services</p>
                    {hasServices ? (
                        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                            {services.map((svc) => (
                                <div key={svc.name} className="flex items-center justify-between gap-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                                    <span className="text-sm font-medium text-gray-800 truncate">{svc.name}</span>
                                    <span className="text-sm font-bold text-[#e8683f] shrink-0">Rs. {svc.priceMin.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-5 px-3 text-center">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <MousePointerClick size={15} className="text-[#1e3a8a]" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500">No services selected yet</p>
                            <p className="text-[11px] text-gray-400 leading-snug">
                                Click the <span className="font-bold text-[#e8683f]">Add</span> button next to any service below.
                            </p>
                        </div>
                    )}
                </div>

                {/* Task Summary Container */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Task Summary</p>
                    <div className="relative border border-gray-200 rounded-xl bg-gray-50 focus-within:border-blue-300 transition-colors">
                        <textarea
                            value={taskSummary}
                            onChange={(e) => setTaskSummary(e.target.value)}
                            placeholder="Briefly explain what needs fixing..."
                            rows={3}
                            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none p-3 rounded-xl"
                        />
                    </div>
                </div>

                {/* Voice Note Module */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                        Voice Note <span className="font-normal text-gray-400">(optional)</span>
                    </p>

                    {!voiceNoteBlob && (
                        <div className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 text-center px-3">
                            <Mic size={13} className="shrink-0" />
                            Record one in &ldquo;Describe Your Issue&rdquo; above
                        </div>
                    )}

                    {voiceNoteBlob && voiceNoteUrl && (
                        <div className="flex items-center gap-3 border border-green-200 bg-green-50 rounded-xl px-3 sm:px-4 py-2.5">
                            <button
                                onClick={toggleNotePlayback}
                                type="button"
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1e3a8a] text-white hover:bg-blue-800 active:scale-95 transition-all shrink-0"
                            >
                                <Mic size={13} />
                            </button>
                            <audio
                                ref={notePlayerRef}
                                src={voiceNoteUrl}
                                onEnded={() => setIsPlayingNote(false)}
                                className="hidden"
                            />
                            <span className="text-xs font-semibold text-green-700 flex-1 truncate">
                                Voice note attached
                            </span>
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        </div>
                    )}
                </div>

                {/* Photo or Video File Picker */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                        Photo or Video <span className="font-normal text-gray-400">(optional, max 1)</span>
                    </p>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                    {!media ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            type="button"
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs sm:text-sm text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            <Upload size={14} /> Upload a photo or video
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 border border-green-200 bg-green-50 rounded-xl px-3 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-green-700">1 item attached</span>
                                        <span className="text-[10px] text-green-600/70 truncate max-w-[140px] sm:max-w-[200px]">{media.file.name}</span>
                                    </div>
                                </div>
                                <button onClick={removeMedia} type="button" className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors shrink-0">
                                    <X size={10} />
                                </button>
                            </div>
                            <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-24 flex items-center justify-center">
                                {media.type === "image" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={media.previewUrl} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <video src={media.previewUrl} className="w-full h-full object-cover" muted playsInline />
                                )}
                                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 text-white rounded-md px-1.5 py-0.5 text-[9px] font-semibold">
                                    {media.type === "video" ? <><Video size={9} /> Video</> : <><Image size={9} /> Photo</>}
                                </div>
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} type="button" className="text-[11px] text-[#1e3a8a] font-semibold text-center hover:underline">
                                Replace file
                            </button>
                        </div>
                    )}
                </div>

                {/* Date & Time Flex Grid Group */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex gap-2">
                    <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Date</p>
                        {dateDisplay ? (
                            <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1 truncate">
                                <Calendar size={13} className="text-[#1e3a8a] shrink-0" /> {dateDisplay}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-0.5 italic">Not selected</p>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Time</p>
                        {periodInfo ? (
                            <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">
                                {periodInfo.label} <span className="text-gray-400 font-normal text-[11px]">({periodInfo.time})</span>
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-0.5 italic">Not selected</p>
                        )}
                    </div>
                </div>

                {/* Service Location Tracking Block */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-gray-500">Service Location</p>
                        <button onClick={detectCurrentLocation} disabled={isGeoLoading} type="button" className="flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:underline disabled:opacity-50 whitespace-nowrap">
                            {isGeoLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                            Auto-detect
                        </button>
                    </div>
                    <div className="relative mb-2">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter or select your address"
                            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white"
                        />
                    </div>
                    <button onClick={() => setShowMap((v) => !v)} type="button" className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#1e3a8a] border border-[#1e3a8a]/20 rounded-xl py-2 hover:bg-blue-50 transition-colors">
                        <MapPin size={13} /> {showMap ? "Hide Map" : "Pin on Live Map"}
                    </button>
                    {showMap && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-44 w-full">
                            {/* MapContainer forwards `ref` to the underlying Leaflet Map instance
                                in react-leaflet v4/v5 — this replaces the old `whenReady`
                                callback (which no longer accepts an argument, causing the
                                TS2769 overload mismatch) and removes the `any` typing. */}
                            <MapContainer ref={mapRef} center={markerPos} zoom={15} style={{ height: "100%", width: "100%" }}>
                                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={markerPos} eventHandlers={{ click: async (e) => { const { lat, lng } = e.latlng; setMarkerPos([lat, lng]); await reverseGeocode(lat, lng); } }} />
                            </MapContainer>
                        </div>
                    )}
                </div>

                {/* Estimated Price Section */}
                <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-gray-50">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Estimated Price</p>
                    {hasServices ? (
                        <p className="text-xl sm:text-2xl font-bold text-[#1e3a8a] leading-none break-words">
                            Rs. {estimatedMin === estimatedMax ? estimatedMin.toLocaleString() : `${estimatedMin.toLocaleString()} – ${estimatedMax.toLocaleString()}`}
                        </p>
                    ) : (
                        <p className="text-xs sm:text-sm text-gray-400 italic">Select services to see estimate</p>
                    )}
                </div>

                {/* Policy Dynamic Box Component */}
                <div className="px-4 sm:px-5 py-3">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full">
                        <div className="flex items-center gap-1.5 bg-slate-50 border-b border-slate-100 px-3 sm:px-4 py-2.5 text-[11px] sm:text-[12px] font-bold text-[#1e3a8a]">
                            <ShieldCheck size={14} className="text-[#1e3a8a] shrink-0" strokeWidth={2.5} />
                            <span className="truncate">Cancellation & Rescheduling Policy</span>
                        </div>
                        <div className="flex flex-col text-[11px] bg-white divide-y divide-slate-100">
                            <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-emerald-50/30">
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-gray-700 text-xs truncate">Before 24 hours</div>
                                    <div className="text-gray-400 text-[10px] leading-tight sm:leading-normal">Applies to changes and cancellations</div>
                                </div>
                                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shrink-0">Free</div>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="p-2 sm:p-3 text-center min-w-0">
                                    <div className="text-gray-400 font-medium mb-1 leading-tight text-[10px] sm:text-[11px]">Under 24 hrs<span className="text-slate-500 block font-semibold text-xs">Reschedule</span></div>
                                    <span className="text-xs sm:text-sm font-bold text-[#e8683f]">Rs. 50</span>
                                </div>
                                <div className="p-2 sm:p-3 text-center min-w-0">
                                    <div className="text-gray-400 font-medium mb-1 leading-tight text-[10px] sm:text-[11px]">Under 24 hrs<span className="text-slate-500 block font-semibold text-xs">Cancel</span></div>
                                    <span className="text-xs sm:text-sm font-bold text-red-500">Rs. 100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action CTA Block */}
                <div className="px-4 sm:px-5 py-4 flex flex-col gap-2">
                    <button
                        onClick={handleBookNow}
                        disabled={!hasServices || isBooking}
                        type="button"
                        className="w-full bg-[#e8683f] hover:bg-[#d75930] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-3.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        {isBooking ? (
                            <><Loader2 size={16} className="animate-spin" /> Booking...</>
                        ) : hasServices ? (
                            "Book Now"
                        ) : (
                            "Select Services to Book"
                        )}
                    </button>
                    <div className="flex gap-2 w-full">
                        {/* Reusable WhatsApp Button Integration — same component/pattern as ExploreSection */}
                        <WhatsAppButton
                            phone={providerPhone}
                            message={`Hi ${provider.name}, I'd like to book your services on ServiceLink.`}
                        />
                        <button type="button" className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 truncate">
                            <Phone size={15} className="shrink-0" /> Call
                        </button>
                    </div>
                </div>

            </div>

            <BookingDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                provider={provider}
                bookingDetails={{
                    services,
                    taskSummary,
                    dateDisplay,
                    timeDisplay: periodInfo ? `${periodInfo.label} (${periodInfo.time})` : "",
                    estimatedMin,
                    estimatedMax,
                    address,
                    photos: media ? [media.file] : [],
                    appointmentIds: bookedAppointments.map((a) => a.id),
                    appointmentStatus: bookedAppointments[0]?.status ?? "PENDING",
                    totalPrice: bookedAppointments.reduce((sum, a) => sum + (a.totalPrice ?? 0), 0),
                    attachedImgUrl: bookedAppointments[0]?.attachedImgUrl ?? null,
                    attachedVideoUrl: bookedAppointments[0]?.attachedVideoUrl ?? null,
                    attachedAudioUrl: bookedAppointments[0]?.attachedAudioUrl ?? null,
                }}
            />
        </div>
    );
}