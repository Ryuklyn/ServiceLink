"use client";

import { useState } from "react";
import { User, MapPin, ArrowRight } from "lucide-react";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  SectionDivider,
} from "./FormFields";
import AddressSection from "./AddressSection";

/* =========================
   TYPES
========================= */
type Address = {
  province: string;
  district: string;
  municipality: string;
  ward: string;
  tole: string;
};

type FormState = {
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  currentAddress: Address;
  permanentAddress: Address;
  sameAddress: boolean;
};

type FormErrors = Partial<
  Record<
    | keyof FormState
    | "currentProvince"
    | "currentDistrict"
    | "currentMunicipality"
    | "currentWard",
    string
  >
>;

interface PersonalInfoStepProps {
  onNext?: (data: FormState) => void;
}

/* =========================
   CONSTANTS
========================= */
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other / Prefer not to say" },
];

const emptyAddress: Address = {
  province: "",
  district: "",
  municipality: "",
  ward: "",
  tole: "",
};

/* =========================
   COMPONENT
========================= */
export default function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    currentAddress: { ...emptyAddress },
    permanentAddress: { ...emptyAddress },
    sameAddress: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /* =========================
     UPDATE (TYPE SAFE)
  ========================= */
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* =========================
     VALIDATION
  ========================= */
  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.dob) e.dob = "Date of birth is required";
    if (!form.gender) e.gender = "Please select a gender";

    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{9,10}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid phone number";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";

    // Address validation
    if (!form.currentAddress.province)
      e.currentProvince = "Province is required";
    if (!form.currentAddress.district)
      e.currentDistrict = "District is required";
    if (!form.currentAddress.municipality)
      e.currentMunicipality = "Municipality is required";
    if (!form.currentAddress.ward) e.currentWard = "Ward is required";

    return e;
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = () => {
    const e = validate();

    if (Object.keys(e).length) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    onNext?.(form);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 mb-4">
          <User className="w-5 h-5 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-stone-900">
          Tell us about yourself
        </h1>

        <p className="text-sm text-stone-500 mt-1.5">
          This will be verified during KYC
        </p>
      </div>

      {/* FORM */}
      <div className="flex flex-col gap-6">
        <SectionDivider title="Personal Details" icon={User} />

        <FormInput
          label="Full Name (As per Citizenship)"
          id="fullName"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          error={errors.fullName}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Date of Birth"
            id="dob"
            type="date"
            value={form.dob}
            onChange={(e) => update("dob", e.target.value)}
            error={errors.dob}
            required
          />

          <FormSelect
            label="Gender"
            id="gender"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            options={genderOptions}
            placeholder="Select gender"
            error={errors.gender}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Phone"
            id="phone"
            prefix="+977"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
            required
          />

          <FormInput
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
            required
          />
        </div>

        {/* ADDRESS */}
        <SectionDivider title="Current Address" icon={MapPin} />

        <AddressSection
          data={form.currentAddress}
          onChange={(addr: Address) => update("currentAddress", addr)}
          prefix="current-"
        />

        <FormCheckbox
          id="sameAddress"
          label="Same as current address"
          checked={form.sameAddress}
          onChange={(e) => update("sameAddress", e.target.checked)}
        />

        {!form.sameAddress && (
          <>
            <SectionDivider title="Permanent Address" icon={MapPin} />

            <AddressSection
              data={form.permanentAddress}
              onChange={(addr: Address) => update("permanentAddress", addr)}
              prefix="permanent-"
            />
          </>
        )}

        {/* ACTION */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            type="button"
            className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-xl"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
