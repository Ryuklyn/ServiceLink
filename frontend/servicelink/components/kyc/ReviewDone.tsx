"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Home,
  PartyPopper,
} from "lucide-react";
import { useState } from "react";

/* =========================
   TYPES
========================= */
type Address = {
  tole?: string;
  municipality?: string;
  ward?: string;
  district?: string;
  province?: string;
};

type Personal = {
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  currentAddress?: Address;
};

type Professional = {
  primaryService?: string;
  otherService?: string;
  additionalServices?: string[];
  experienceYears?: number;
  primaryDistrict?: string;
  secondaryDistricts?: string[];
  travelRadius?: string;
  bio?: string;
  image?: string | null;
  photoConfirmed?: boolean;
};

type KYC = {
  citizenshipFront?: File | null;
  citizenshipBack?: File | null;
  pan?: File | null;
  professional?: File[];
  photo?: File | null;
};

// type Payment = {
//   method?: string;
// };

type Terms = {
  agreed?: boolean;
};

type AllData = {
  personal?: Personal;
  professional?: Professional;
  kyc?: KYC;
  terms?: Terms;
};

interface Props {
  allData: AllData;
  onSubmit?: () => void;
  onBack?: () => void;
  onGoToStep?: (step: number) => void;
}

// interface DoneProps {
//   onRestart?: () => void;
// }

/* =========================
   UI COMPONENTS
========================= */
function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="flex justify-between py-2 border-b border-stone-100">
      <span className="text-xs font-semibold text-stone-400 uppercase w-40">
        {label}
      </span>
      <span className="text-sm font-medium text-stone-700 text-right">
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
        <h3 className="text-sm font-bold text-stone-700">{title}</h3>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-amber-600"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="px-4">{children}</div>
    </div>
  );
}

/* =========================
   REVIEW STEP
========================= */
export function ReviewDone({ allData, onSubmit, onBack, onGoToStep }: Props) {
  const personal = allData.personal ?? {};
  const professional = allData.professional ?? {};
  const kyc = allData.kyc ?? {};
  const [agreed, setAgreed] = useState(allData.terms?.agreed || false);
  const [error, setError] = useState("");

  const addr = personal.currentAddress ?? {};

  const address = [
    addr.tole,
    addr.municipality,
    addr.ward ? `Ward ${addr.ward}` : "",
    addr.district,
    addr.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="text-center mb-8">
        <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto mb-3" />

        <h1 className="text-2xl font-bold text-gray-900">
          Review Your Details
        </h1>
        <p className="text-sm text-stone-500">
          Confirm before submitting application
        </p>
      </div>

      {/* SECTIONS */}
      <div className="flex flex-col gap-4">
        <Section title="Personal Info" onEdit={() => onGoToStep?.(1)}>
          <Row label="Name" value={personal.fullName} />
          <Row label="DOB" value={personal.dob} />
          <Row label="Gender" value={personal.gender} />
          <Row label="Phone" value={personal.phone} />
          <Row label="Email" value={personal.email} />
          <Row label="Address" value={address} />
        </Section>

        <Section title="Professional" onEdit={() => onGoToStep?.(2)}>
          <Row label="Primary Service" value={professional.primaryService} />
          <Row
            label="Experience"
            value={
              professional.experienceYears
                ? `${professional.experienceYears} years`
                : ""
            }
          />
          <Row label="District" value={professional.primaryDistrict} />
          <Row
            label="Additional Services"
            value={professional.additionalServices?.join(", ")}
          />
          <Row label="Bio" value={professional.bio || "Not provided"} />
        </Section>

        <Section title="KYC" onEdit={() => onGoToStep?.(3)}>
          <Row
            label="Citizenship Front"
            value={kyc.citizenshipFront ? "Uploaded" : ""}
          />
          <Row
            label="Citizenship Back"
            value={kyc.citizenshipBack ? "Uploaded" : ""}
          />
          <Row label="Photo" value={kyc.photo ? "Uploaded" : ""} />
          <Row label="PAN" value={kyc.pan ? "Uploaded" : ""} />
        </Section>

        {/* TERMS & AGREEMENT */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-stone-700 mb-3">
            ⚖️ Terms & Agreements
          </h3>

          <div className="flex flex-col gap-2 text-sm text-stone-600">
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />I agree to ServiceLink
              Terms of Service
            </label>

            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />I agree to Privacy
              Policy & Data Protection
            </label>

            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />I confirm all
              information is accurate and truthful
            </label>

            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />I consent to background
              verification
            </label>

            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />I agree to video call
              verification (if required)
            </label>

            {/* MAIN AGREEMENT */}
            <label className="flex items-start gap-2 mt-2 font-medium text-stone-800">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setError("");
                }}
                className="mt-1"
              />
              I have read and agree to all terms above
            </label>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 border rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg"
          >
            Submit
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
