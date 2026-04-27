"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Home,
  PartyPopper,
} from "lucide-react";

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
  occupation?: string;
  organization?: string;
  designation?: string;
  monthlyIncome?: string;
  incomeSource?: string;
};

type KYC = {
  docType?: string;
  docNumber?: string;
  frontFile?: unknown;
  selfie?: unknown;
};

type Payment = {
  method?: string;
};

type AllData = {
  personal?: Personal;
  professional?: Professional;
  kyc?: KYC;
  payment?: Payment;
};

interface Props {
  allData: AllData;
  onSubmit?: () => void;
  onBack?: () => void;
  onGoToStep?: (step: number) => void;
}

interface DoneProps {
  onRestart?: () => void;
}

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
  const payment = allData.payment ?? {};

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

        <h1 className="text-2xl font-bold">Review Your Details</h1>
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
          <Row label="Job" value={professional.occupation} />
          <Row label="Org" value={professional.organization} />
          <Row label="Role" value={professional.designation} />
          <Row label="Income" value={professional.monthlyIncome} />
        </Section>

        <Section title="KYC" onEdit={() => onGoToStep?.(3)}>
          <Row label="Doc Type" value={kyc.docType} />
          <Row label="Doc No" value={kyc.docNumber} />
          <Row label="Front" value={kyc.frontFile ? "Uploaded" : ""} />
          <Row label="Selfie" value={kyc.selfie ? "Uploaded" : ""} />
        </Section>

        <Section title="Payment" onEdit={() => onGoToStep?.(4)}>
          <Row label="Method" value={payment.method} />
        </Section>

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

/* =========================
   DONE STEP
========================= */
export function DoneStep({ onRestart }: DoneProps) {
  return (
    <div className="text-center py-10">
      <PartyPopper className="w-12 h-12 text-amber-500 mx-auto mb-4" />

      <h1 className="text-2xl font-bold">You're all set!</h1>

      <p className="text-stone-500 mt-2 mb-6">
        Your application is under review.
      </p>

      <button
        onClick={onRestart}
        className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg"
      >
        <Home className="w-4 h-4" />
        Back Home
      </button>
    </div>
  );
}
