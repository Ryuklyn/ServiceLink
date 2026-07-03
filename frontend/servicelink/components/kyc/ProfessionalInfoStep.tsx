"use client";

import { useCallback, useRef, useState } from "react";
import {
  X,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Info,
  Camera,
} from "lucide-react";
import { storageApi } from "@/lib/api/storageApi";
import { SERVICE_OPTIONS } from "@/lib/constants/serviceCategory";

/* ========================= TYPES ========================= */
type FormState = {
  primaryService: string;
  otherService: string;
  additionalServices: string[];
  experienceYears: number;
  primaryDistrict: string;
  secondaryDistricts: string[];
  travelRadius: string;
  bio: string;
  image: string | null;
  photoConfirmed: boolean;
};

/* ========================= CONSTANTS ========================= */
const primaryServiceOptions = SERVICE_OPTIONS;

const additionalServiceOptions = primaryServiceOptions;

const districts = [
  "Kathmandu", "Bhaktapur", "Lalitpur", "Chitwan", "Sunsari", "Bardiya",
  "Banke", "Kaski", "Morang", "Kailali", "Rupandehi", "Surkhet", "Kavre",
  "Nuwakot", "Makwanpur", "Dhading", "Sindhuli", "Ramechhap",
];

const travelOptions = [
  { value: "selected", label: "No, only in selected districts" },
  { value: "50km", label: "Yes, within 50 km radius" },
  { value: "anywhere", label: "Yes, anywhere in Nepal" },
];

const bioGuidelines = [
  "Clear face visible (no sunglasses)",
  "Good lighting",
  "Neutral background",
  "JPG or PNG (Max 5MB)",
  "4x6 cm recommended",
];

function createInitialForm(initialData?: Partial<FormState>): FormState {
  return {
    primaryService: initialData?.primaryService || "",
    otherService: initialData?.otherService || "",
    additionalServices: initialData?.additionalServices || [],
    experienceYears: initialData?.experienceYears || 0,
    primaryDistrict: initialData?.primaryDistrict || "",
    secondaryDistricts: initialData?.secondaryDistricts || [],
    travelRadius: initialData?.travelRadius || "selected",
    bio: initialData?.bio || "",
    image: initialData?.image || null,
    photoConfirmed: initialData?.photoConfirmed || false,
  };
}

interface Props {
  onNext?: (data: FormState) => void;
  onBack?: () => void;
  initialData?: Partial<FormState>;
  draftSessionId?: string | null;
}

/* ========================= HELPERS ========================= */
function getExperienceLabel(years: number): string {
  if (years === 0) return "No experience yet";
  if (years === 1) return "1 year";
  return `${years} years`;
}

/* ========================= COMPONENT ========================= */
export default function SkillsServicesForm({ onNext, onBack, initialData, draftSessionId }: Props) {
  const initialForm = createInitialForm(initialData);
  const [primaryService, setPrimaryService] = useState(initialForm.primaryService);
  const [otherService, setOtherService] = useState(initialForm.otherService);
  const [additionalServices, setAdditionalServices] = useState<string[]>(initialForm.additionalServices);
  const [experienceYears, setExperienceYears] = useState<number>(initialForm.experienceYears);
  const [primaryDistrict, setPrimaryDistrict] = useState(initialForm.primaryDistrict);
  const [secondaryDistricts, setSecondaryDistricts] = useState<string[]>(initialForm.secondaryDistricts);
  const [travelRadius, setTravelRadius] = useState(initialForm.travelRadius);
  const [bio, setBio] = useState(initialForm.bio);
  const [image, setImage] = useState<string | null>(initialForm.image);
  const [photoConfirmed, setPhotoConfirmed] = useState(initialForm.photoConfirmed);
  const [photoError, setPhotoError] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAdditional = useCallback(
      (value: string) => {
        if (additionalServices.includes(value)) {
          setAdditionalServices((prev) => prev.filter((s) => s !== value));
        } else {
          if (additionalServices.length >= 3) return;
          setAdditionalServices((prev) => [...prev, value]);
        }
      },
      [additionalServices],
  );

  const toggleSecondary = useCallback(
      (district: string) => {
        if (district === primaryDistrict) return;
        setSecondaryDistricts((prev) =>
            prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district],
        );
      },
      [primaryDistrict],
  );

  const [uploading, setUploading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhotoError("Only JPG and PNG files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File size must be under 5MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      if (img.width < 400 || img.height < 600) {
        setPhotoError(`Image resolution too low (${img.width}x${img.height}). Minimum 400x600 px required.`);
        URL.revokeObjectURL(localPreview);
        return;
      }

      setUploading(true);
      try {
        const { url } = await storageApi.uploadFile(
            file,
            `kyc-drafts/${draftSessionId ?? "unsaved"}/profile-photo`
        );
        setImage(url);          // ✅ Supabase URL - persistable
        setPhotoConfirmed(false);
      } catch {
        setPhotoError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        URL.revokeObjectURL(localPreview);
      }
    };

    img.src = localPreview;
  };

  const handleContinue = () => {
    if (!primaryService) {
      setFormError("Please select your primary service.");
      return;
    }
    if (primaryService === "other" && !otherService.trim()) {
      setFormError("Please specify your service.");
      return;
    }
    if (!primaryDistrict) {
      setFormError("Please select your primary operating district.");
      return;
    }
    if (!image) {
      setFormError("Please upload your profile photo.");
      return;
    }
    if (!photoConfirmed) {
      setFormError("Please confirm your profile photo meets the guidelines.");
      return;
    }

    setFormError("");
    onNext?.({
      primaryService, otherService, additionalServices, experienceYears,
      primaryDistrict, secondaryDistricts, travelRadius, bio, image, photoConfirmed,
    });
  };

  const charCount = bio.length;
  const charPct = Math.min((charCount / 150) * 100, 100);

  return (
      <div className="w-full pb-24 sm:pb-0">
        {/* HEADER */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#e8683f]/10 border border-[#e8683f]/20 mb-3 sm:mb-4">
            <Briefcase className="w-5 h-5 text-[#e8683f]" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900">Your Skills &amp; Services</h1>
          <p className="text-xs sm:text-sm text-stone-500">Tell customers what you can do</p>
        </div>

        {/* PRIMARY SERVICE */}
        <div className="mb-5">
          <label htmlFor="primaryService" className="text-sm font-semibold text-stone-700 flex items-center gap-1">
            What service do you provide? <span className="text-red-500 text-xs">*</span>
          </label>
          <p className="text-xs text-stone-400 mt-0.5 mb-2">Select your main service category</p>

          <div className="relative">
            <select
                id="primaryService"
                value={primaryService}
                onChange={(e) => {
                  setPrimaryService(e.target.value);
                  setOtherService("");
                }}
                className="w-full appearance-none px-3 py-3 sm:py-2.5 pr-10 border border-stone-200 rounded-xl text-stone-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#e8683f]"
            >
              <option value="">-- Select primary service --</option>
              {primaryServiceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>

          {primaryService === "other" && (
              <input
                  type="text"
                  value={otherService}
                  onChange={(e) => setOtherService(e.target.value)}
                  placeholder="Please specify your service..."
                  className="w-full mt-2 px-3 py-2.5 border border-[#e8683f]/30 rounded-xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#e8683f] bg-[#e8683f]/10"
              />
          )}
        </div>

        {/* ADDITIONAL SERVICES */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-stone-700">
            Additional Services <span className="font-normal text-stone-400">(Optional)</span>
          </label>
          <p className="text-xs text-stone-400 mt-0.5 mb-2">
            Select up to 3 more categories
            {additionalServices.length > 0 && (
                <span className="ml-2 text-[#e8683f] font-medium">{additionalServices.length}/3 selected</span>
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 border border-stone-100 rounded-xl max-h-48 overflow-y-auto">
            {additionalServiceOptions
                .filter((opt) => opt.value !== primaryService)
                .map((opt) => {
                  const isChecked = additionalServices.includes(opt.value);
                  const isDisabled = !isChecked && additionalServices.length >= 3;
                  return (
                      <label
                          key={opt.value}
                          className={`flex items-center gap-2.5 text-sm cursor-pointer py-1.5 sm:py-0.5 rounded transition-colors ${
                              isDisabled ? "opacity-40 cursor-not-allowed" : "hover:text-[#d95a2f]"
                          } ${isChecked ? "text-[#d95a2f] font-medium" : "text-stone-600"}`}
                      >
                        <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => toggleAdditional(opt.value)}
                            className="accent-amber-500 w-4 h-4 flex-shrink-0"
                        />
                        {opt.label}
                      </label>
                  );
                })}
          </div>
        </div>

        {/* EXPERIENCE SLIDER */}
        <div className="mb-7">
          <label className="text-sm font-semibold text-stone-700 flex items-center justify-between">
            <span>Years of Experience <span className="text-red-500 text-xs">*</span></span>
            <span className="text-sm font-medium text-stone-900">{getExperienceLabel(experienceYears)}</span>
          </label>

          <div className="mt-3 px-3 sm:px-4 py-5 rounded-xl border border-stone-200 bg-white">
            <input
                type="range"
                id="experience"
                min={0}
                max={50}
                step={1}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="experience-slider w-full cursor-pointer touch-none"
                style={{ "--progress": `${(experienceYears / 50) * 100}%` } as React.CSSProperties}
            />
            <div className="flex justify-between text-[10px] sm:text-xs text-stone-400 mt-2">
              <span>0</span><span>10</span><span>20</span><span>30</span><span>50 yrs</span>
            </div>
          </div>

          <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            Experience helps customers evaluate your expertise level
          </p>
        </div>

        {/* PRIMARY DISTRICT */}
        <div className="mb-5">
          <label htmlFor="primaryDistrict" className="text-sm font-semibold text-stone-700 flex items-center gap-1">
            Primary Operating District <span className="text-red-500 text-xs">*</span>
          </label>
          <p className="text-xs text-stone-400 mt-0.5 mb-2">Where you are primarily based</p>

          <div className="relative">
            <select
                id="primaryDistrict"
                value={primaryDistrict}
                onChange={(e) => {
                  setPrimaryDistrict(e.target.value);
                  setSecondaryDistricts((prev) => prev.filter((d) => d !== e.target.value));
                }}
                className="w-full appearance-none px-3 py-3 sm:py-2.5 pr-10 border border-stone-200 rounded-xl text-stone-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#e8683f]"
            >
              <option value="">-- Select primary district --</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* SECONDARY DISTRICTS */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-stone-700">
            Secondary Service Areas <span className="font-normal text-stone-400">(Optional)</span>
          </label>
          <p className="text-xs text-stone-400 mt-0.5 mb-2">Select districts where you can travel</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3 border border-stone-100 rounded-xl max-h-44 overflow-y-auto">
            {primaryDistrict && (
                <label className="flex items-center gap-2 text-xs sm:text-sm text-stone-400 cursor-not-allowed py-1">
                  <input type="checkbox" checked disabled className="accent-amber-500 w-3.5 h-3.5" />
                  {primaryDistrict} <span className="text-[10px] text-[#e8683f]">(Primary)</span>
                </label>
            )}
            {districts.filter((d) => d !== primaryDistrict).map((d) => (
                <label
                    key={d}
                    className={`flex items-center gap-2 text-xs sm:text-sm cursor-pointer py-1 rounded transition-colors ${
                        secondaryDistricts.includes(d) ? "text-[#d95a2f] font-medium" : "text-stone-600 hover:text-[#d95a2f]"
                    }`}
                >
                  <input
                      type="checkbox"
                      checked={secondaryDistricts.includes(d)}
                      onChange={() => toggleSecondary(d)}
                      className="accent-amber-500 w-3.5 h-3.5"
                  />
                  {d}
                </label>
            ))}
          </div>
        </div>

        {/* TRAVEL RADIUS */}
        <div className="mb-7">
          <label className="text-sm font-semibold text-stone-700">Willing to travel outside these areas?</label>
          <div className="mt-2 space-y-2">
            {travelOptions.map((opt) => (
                <label
                    key={opt.value}
                    className={`flex items-center gap-2.5 text-sm cursor-pointer px-3 py-3 sm:py-2.5 rounded-xl border transition-all ${
                        travelRadius === opt.value
                            ? "border-[#e8683f] bg-[#e8683f]/10 text-[#d95a2f] font-medium"
                            : "border-stone-100 text-stone-600 hover:border-stone-200"
                    }`}
                >
                  <input
                      type="radio"
                      name="travelRadius"
                      value={opt.value}
                      checked={travelRadius === opt.value}
                      onChange={() => setTravelRadius(opt.value)}
                      className="accent-amber-500 w-4 h-4"
                  />
                  {opt.label}
                </label>
            ))}
          </div>
        </div>

        {/* BIO */}
        <div className="mb-7">
          <label htmlFor="bio" className="text-sm font-semibold text-stone-700 flex items-center gap-1 flex-wrap">
            Professional Bio
            <span className="text-xs font-normal text-stone-400 ml-1">(150 characters max)</span>
          </label>
          <p className="text-xs text-stone-400 mt-0.5 mb-2">
            Example: 15 years in plumbing. Expert at complex water systems. Emergency services available. 24/7 support.
          </p>

          <textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                const val = e.target.value;
                const hasUrl = /https?:\/\/|www\./i.test(val);
                const hasPhone = /\b\d{7,}\b/.test(val);
                if (!hasUrl && !hasPhone) setBio(val.slice(0, 150));
              }}
              maxLength={150}
              rows={4}
              placeholder="Introduce yourself clearly and professionally..."
              className="w-full px-3 py-2.5 border border-stone-200 placeholder:text-stone-300 text-stone-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8683f] resize-none"
          />

          <div className="flex items-center justify-between mt-1 gap-2">
            <span className="text-[11px] sm:text-xs text-stone-400">Plain text only — no URLs or phone numbers</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-1 w-12 sm:w-16 rounded-full bg-stone-100 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${charPct}%`,
                      background: charPct >= 90 ? "#ef4444" : charPct >= 70 ? "#e8683f" : "#22c55e",
                    }}
                />
              </div>
              <span className={`text-xs font-medium ${
                  charPct >= 90 ? "text-red-500" : charPct >= 70 ? "text-[#e8683f]" : "text-stone-400"
              }`}>
              {charCount}/150
            </span>
            </div>
          </div>
        </div>

        {/* PROFILE PHOTO */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-stone-700 flex items-center gap-1">
            Profile Photo Upload <span className="text-red-500 text-xs">*</span>
          </label>

          <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden">
            {uploading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-8 h-8 border-2 border-[#e8683f] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-stone-500">Uploading photo...</p>
                </div>
            ) : image ? (
                <div className="relative">
                  <img src={image} alt="Profile preview" className="w-full h-44 sm:h-48 object-cover object-top" />
                  <button
                      onClick={() => { setImage(null); setPhotoConfirmed(false); }}
                      aria-label="Remove uploaded photo"
                      title="Remove photo"
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow text-red-500 hover:bg-red-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs text-stone-600 px-2 py-1 rounded-lg shadow">
                    Photo uploaded
                  </div>
                </div>
            ) : (
                <label
                    className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer hover:bg-stone-50 transition-colors active:bg-stone-100"
                    htmlFor="photoUpload"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center border-2 border-dashed border-stone-300">
                    <Camera className="w-6 h-6 text-stone-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-stone-600 font-medium">Tap to take photo or upload</p>
                    <span className="inline-block mt-2 px-4 py-1.5 bg-[#e8683f] text-white text-xs font-semibold rounded-full">
                  Choose Photo
                </span>
                  </div>
                </label>
            )}

            <div className="px-4 py-3 bg-stone-50 border-t border-stone-100">
              <p className="text-xs font-semibold text-stone-500 flex items-center gap-1 mb-1.5">
                <Info className="w-3.5 h-3.5" /> Photo Guidelines:
              </p>
              <ul className="space-y-0.5">
                {bioGuidelines.map((g) => (
                    <li key={g} className="text-xs text-stone-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0" />
                      {g}
                    </li>
                ))}
              </ul>
            </div>
          </div>

          <input
              ref={fileInputRef}
              id="photoUpload"
              type="file"
              hidden
              accept="image/jpeg,image/png"
              onChange={handleImage}
          />

          {photoError && <p className="mt-1.5 text-xs text-red-500 font-medium">{photoError}</p>}
          {formError && <p className="mt-1.5 text-xs text-red-500 font-medium">{formError}</p>}

          {image && (
              <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={photoConfirmed}
                    onChange={(e) => setPhotoConfirmed(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-stone-600">
              I confirm this is my recent photo and it meets the guidelines
            </span>
              </label>
          )}
        </div>

        {/* ACTIONS — sticky on mobile */}
        <div
            className="
          fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-stone-100 p-4 flex gap-3
          sm:static sm:z-auto sm:bg-transparent sm:border-0 sm:p-0 sm:justify-between sm:mt-8
        "
        >
          <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 sm:py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 flex items-center justify-center gap-1 text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
              type="button"
              disabled={uploading}
              onClick={handleContinue}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-[#e8683f] hover:bg-[#d95a2f] active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
}
