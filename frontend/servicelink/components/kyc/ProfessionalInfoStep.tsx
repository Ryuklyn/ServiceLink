"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Info,
  Camera,
} from "lucide-react";

/* =========================
   TYPES
========================= */
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

/* =========================
   CONSTANTS
========================= */
const primaryServiceOptions = [
  { value: "electrical", label: "Electrical Work" },
  { value: "plumbing", label: "Plumbing & Pipe Work" },
  { value: "carpentry", label: "Carpentry & Woodwork" },
  { value: "painting", label: "Painting & Decorating" },
  { value: "cleaning", label: "House Cleaning & Maintenance" },
  { value: "masonry", label: "Masonry & Brickwork" },
  { value: "general", label: "General Repairs & Renovation" },
  { value: "mechanical", label: "Mechanical & Car Repair" },
  { value: "appliance", label: "Home Appliance Repair" },
  { value: "grooming", label: "Saloon/Grooming Services" },
  { value: "tailoring", label: "Tailoring & Alterations" },
  { value: "furniture", label: "Furniture Repair & Upholstery" },
  { value: "other", label: "Other (Please specify)" },
];

const additionalServiceOptions = [
  { value: "electrical", label: "Electrical Work" },
  { value: "plumbing", label: "Plumbing & Pipe Work" },
  { value: "carpentry", label: "Carpentry & Woodwork" },
  { value: "painting", label: "Painting & Decorating" },
  { value: "cleaning", label: "House Cleaning & Maintenance" },
  { value: "masonry", label: "Masonry & Brickwork" },
  { value: "general", label: "General Repairs & Renovation" },
  { value: "mechanical", label: "Mechanical & Car Repair" },
  { value: "appliance", label: "Home Appliance Repair" },
  { value: "grooming", label: "Saloon/Grooming Services" },
  { value: "tailoring", label: "Tailoring & Alterations" },
  { value: "furniture", label: "Furniture Repair & Upholstery" },
];

const districts = [
  "Kathmandu",
  "Bhaktapur",
  "Lalitpur",
  "Chitwan",
  "Sunsari",
  "Bardiya",
  "Banke",
  "Kaski",
  "Morang",
  "Kailali",
  "Rupandehi",
  "Surkhet",
  "Kavre",
  "Nuwakot",
  "Makwanpur",
  "Dhading",
  "Sindhuli",
  "Ramechhap",
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

interface Props {
  onNext?: (data: FormState) => void;
  onBack?: () => void;
}

/* =========================
   HELPER
========================= */
function getExperienceColor(years: number): string {
  if (years <= 5) return "#3b82f6";
  if (years <= 20) return "#22c55e";
  return "#f59e0b";
}

function getExperienceLabel(years: number): string {
  if (years === 0) return "No experience yet";
  if (years === 1) return "1 year";
  return `${years} years`;
}

/* =========================
   COMPONENT
========================= */
export default function SkillsServicesForm({ onNext, onBack }: Props) {
  const [primaryService, setPrimaryService] = useState("");
  const [otherService, setOtherService] = useState("");
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [primaryDistrict, setPrimaryDistrict] = useState("");
  const [secondaryDistricts, setSecondaryDistricts] = useState<string[]>([]);
  const [travelRadius, setTravelRadius] = useState("selected");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* -------------------------
     TOGGLES
  ------------------------- */
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
        prev.includes(district)
          ? prev.filter((d) => d !== district)
          : [...prev, district],
      );
    },
    [primaryDistrict],
  );

  /* -------------------------
     IMAGE HANDLING
  ------------------------- */
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

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 400 || img.height < 600) {
        setPhotoError(
          `Image resolution too low (${img.width}x${img.height}). Minimum 400x600 px required.`,
        );
        URL.revokeObjectURL(url);
        return;
      }
      setImage(url);
      setPhotoConfirmed(false);
    };
    img.src = url;
  };

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  /* -------------------------
     SUBMIT
  ------------------------- */
  const handleContinue = () => {
    onNext?.({
      primaryService,
      otherService,
      additionalServices,
      experienceYears,
      primaryDistrict,
      secondaryDistricts,
      travelRadius,
      bio,
      image,
      photoConfirmed,
    });
  };

  const expColor = getExperienceColor(experienceYears);
  const charCount = bio.length;
  const charPct = Math.min((charCount / 150) * 100, 100);

  /* =========================
     UI
  ========================= */
  return (
    <div className="w-full">
      {/* ── HEADER (unchanged) ── */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 mb-4">
          <Briefcase className="w-5 h-5 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">
          Your Skills &amp; Services
        </h1>
        <p className="text-sm text-stone-500">Tell customers what you can do</p>
      </div>

      {/* ══════════════════════════════════
          SECTION A — SERVICE CATEGORY
      ══════════════════════════════════ */}
      {/* PRIMARY SERVICE */}
      <div className="mb-5">
        <label
          htmlFor="primaryService"
          className="text-sm font-semibold text-stone-700 flex items-center gap-1"
        >
          What service do you provide?
          <span className="text-red-500 text-xs">*</span>
        </label>
        <p className="text-xs text-stone-400 mt-0.5 mb-2">
          Select your main service category
        </p>

        <div className="relative">
          <select
            id="primaryService"
            value={primaryService}
            onChange={(e) => {
              setPrimaryService(e.target.value);
              setOtherService("");
            }}
            className="w-full appearance-none px-3 py-2.5 pr-10 border border-stone-200 rounded-xl text-stone-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">-- Select primary service --</option>
            {primaryServiceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>

        {/* OTHER SPECIFICATION */}
        {primaryService === "other" && (
          <input
            type="text"
            value={otherService}
            onChange={(e) => setOtherService(e.target.value)}
            placeholder="Please specify your service..."
            className="w-full mt-2 px-3 py-2 border border-amber-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
          />
        )}
      </div>

      {/* ADDITIONAL SERVICES */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-stone-700">
          Additional Services{" "}
          <span className="font-normal text-stone-400">(Optional)</span>
        </label>
        <p className="text-xs text-stone-400 mt-0.5 mb-2">
          Select up to 3 more categories
          {additionalServices.length > 0 && (
            <span className="ml-2 text-amber-500 font-medium">
              {additionalServices.length}/3 selected
            </span>
          )}
        </p>

        <div className="grid grid-cols-1 gap-1.5 p-3 border border-stone-100 rounded-xl max-h-44 overflow-y-auto">
          {additionalServiceOptions
            .filter((opt) => opt.value !== primaryService)
            .map((opt) => {
              const isChecked = additionalServices.includes(opt.value);
              const isDisabled = !isChecked && additionalServices.length >= 3;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 text-sm cursor-pointer py-0.5 rounded transition-colors ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:text-amber-600"
                  } ${isChecked ? "text-amber-600 font-medium" : "text-stone-600"}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => toggleAdditional(opt.value)}
                    className="accent-amber-500 w-3.5 h-3.5 flex-shrink-0"
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
          <span>
            Years of Experience <span className="text-red-500 text-xs">*</span>
          </span>
          <span className="text-sm font-medium text-stone-900">
            {getExperienceLabel(experienceYears)}
          </span>
        </label>

        <div className="mt-3 px-4 py-5 rounded-xl border border-stone-200 bg-white">
          {/* Slider */}

          <input
            type="range"
            id="experience"
            min={0}
            max={50}
            step={1}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="experience-slider w-full cursor-pointer"
            style={
              {
                "--progress": `${(experienceYears / 50) * 100}%`,
              } as React.CSSProperties
            }
          />
          {/* Scale */}
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>0 yrs</span>
            <span>10 yrs</span>
            <span>20 yrs</span>
            <span>30 yrs</span>
            <span>50 yrs</span>
          </div>

          {/* Level indicator */}
          <div className="flex justify-between mt-3 text-xs font-medium">
            <span className="text-stone-400">Beginner</span>
            <span className="text-stone-400">Intermediate</span>
            <span className="text-stone-400">Professional</span>
            <span className="text-stone-400">Expert</span>
          </div>
        </div>

        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Experience helps customers evaluate your expertise level
        </p>
      </div>

      {/* ══════════════════════════════════
          SECTION B — COVERAGE AREA
      ══════════════════════════════════ */}

      {/* PRIMARY DISTRICT */}
      <div className="mb-5">
        <label
          htmlFor="primaryDistrict"
          className="text-sm font-semibold text-stone-700 flex items-center gap-1"
        >
          Primary Operating District
          <span className="text-red-500 text-xs">*</span>
        </label>
        <p className="text-xs text-stone-400 mt-0.5 mb-2">
          Where you are primarily based
        </p>

        <div className="relative">
          <select
            id="primaryDistrict"
            value={primaryDistrict}
            onChange={(e) => {
              setPrimaryDistrict(e.target.value);
              setSecondaryDistricts((prev) =>
                prev.filter((d) => d !== e.target.value),
              );
            }}
            className="w-full appearance-none px-3 py-2.5 pr-10 border border-stone-200 rounded-xl text-stone-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">-- Select primary district --</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* SECONDARY DISTRICTS */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-stone-700">
          Secondary Service Areas{" "}
          <span className="font-normal text-stone-400">(Optional)</span>
        </label>
        <p className="text-xs text-stone-400 mt-0.5 mb-2">
          Select districts where you can travel
        </p>

        <div className="grid grid-cols-2 gap-1.5 p-3 border border-stone-100 rounded-xl max-h-40 overflow-y-auto">
          {primaryDistrict && (
            <label className="flex items-center gap-2 text-sm text-stone-400 cursor-not-allowed py-0.5">
              <input
                type="checkbox"
                checked
                disabled
                className="accent-amber-500 w-3.5 h-3.5"
              />
              {primaryDistrict}{" "}
              <span className="text-xs text-amber-500">(Primary)</span>
            </label>
          )}
          {districts
            .filter((d) => d !== primaryDistrict)
            .map((d) => (
              <label
                key={d}
                className={`flex items-center gap-2 text-sm cursor-pointer py-0.5 rounded transition-colors ${
                  secondaryDistricts.includes(d)
                    ? "text-amber-600 font-medium"
                    : "text-stone-600 hover:text-amber-600"
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
        <label className="text-sm font-semibold text-stone-700">
          Willing to travel outside these areas?
        </label>
        <div className="mt-2 space-y-2">
          {travelOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 text-sm cursor-pointer px-3 py-2.5 rounded-xl border transition-all ${
                travelRadius === opt.value
                  ? "border-amber-400 bg-amber-50/60 text-amber-700 font-medium"
                  : "border-stone-100 text-stone-600 hover:border-stone-200"
              }`}
            >
              <input
                type="radio"
                name="travelRadius"
                value={opt.value}
                checked={travelRadius === opt.value}
                onChange={() => setTravelRadius(opt.value)}
                className="accent-amber-500 w-3.5 h-3.5"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION C — BIO
      ══════════════════════════════════ */}
      <div className="mb-7">
        <label
          htmlFor="bio"
          className="text-sm font-semibold text-stone-700 flex items-center gap-1"
        >
          Professional Bio
          <span className="text-xs font-normal text-stone-400 ml-1">
            (150 characters max)
          </span>
        </label>
        <p className="text-xs text-stone-400 mt-0.5 mb-2">
          Example: 15 years in plumbing. Expert at complex water systems.
          Emergency services available. 24/7 support.
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
          className="w-full px-3 py-2.5 border border-stone-200 placeholder:text-stone-300 text-stone-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-stone-400">
            Plain text only — no URLs or phone numbers
          </span>
          <div className="flex items-center gap-2">
            <div
              className="h-1 w-16 rounded-full bg-stone-100 overflow-hidden"
              title={`${charCount}/150`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${charPct}%`,
                  background:
                    charPct >= 90
                      ? "#ef4444"
                      : charPct >= 70
                        ? "#f59e0b"
                        : "#22c55e",
                }}
              />
            </div>
            <span
              className={`text-xs font-medium ${
                charPct >= 90
                  ? "text-red-500"
                  : charPct >= 70
                    ? "text-amber-500"
                    : "text-stone-400"
              }`}
            >
              {charCount}/150
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION D — PROFILE PHOTO
      ══════════════════════════════════ */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-stone-700 flex items-center gap-1">
          Profile Photo Upload
          <span className="text-red-500 text-xs">*</span>
        </label>

        <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden">
          {/* Preview or Upload Prompt */}
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt="Profile preview"
                className="w-full h-48 object-cover object-top"
              />
              {/* <button
                onClick={() => {
                  setImage(null);
                  setPhotoConfirmed(false);
                }}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow text-red-500 hover:bg-red-50 transition"
              >
                <X className="w-4 h-4" />
              </button> */}
              <button
                onClick={() => {
                  setImage(null);
                  setPhotoConfirmed(false);
                }}
                aria-label="Remove uploaded photo"
                title="Remove photo"
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow text-red-500 hover:bg-red-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs text-stone-600 px-2 py-1 rounded-lg shadow">
                Photo uploaded
              </div>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer hover:bg-stone-50 transition-colors"
              htmlFor="photoUpload"
            >
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center border-2 border-dashed border-stone-300">
                <Camera className="w-6 h-6 text-stone-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-stone-600 font-medium">
                  Tap to take photo or upload
                </p>
                <span className="inline-block mt-2 px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  Choose Photo
                </span>
              </div>
            </label>
          )}

          {/* Guidelines */}
          <div className="px-4 py-3 bg-stone-50 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-500 flex items-center gap-1 mb-1.5">
              <Info className="w-3.5 h-3.5" /> Photo Guidelines:
            </p>
            <ul className="space-y-0.5">
              {bioGuidelines.map((g) => (
                <li
                  key={g}
                  className="text-xs text-stone-400 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="photoUpload"
          type="file"
          hidden
          accept="image/jpeg,image/png"
          onChange={handleImage}
        />

        {/* Photo error */}
        {photoError && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">
            {photoError}
          </p>
        )}

        {/* Confirm checkbox */}
        {image && (
          <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={photoConfirmed}
              onChange={(e) => setPhotoConfirmed(e.target.checked)}
              className="accent-amber-500 w-3.5 h-3.5 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm text-stone-600">
              I confirm this is my recent photo and it meets the guidelines
            </span>
          </label>
        )}
      </div>

      {/* ── ACTIONS (unchanged) ── */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 flex items-center gap-1 text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
