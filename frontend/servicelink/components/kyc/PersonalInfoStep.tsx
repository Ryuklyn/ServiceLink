"use client";

import { useEffect, useState } from "react";
import { User, MapPin, ArrowRight } from "lucide-react";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  SectionDivider,
} from "./FormFields";
import AddressSection from "./AddressSection";

// ─── Types ──────────────────────────────────────────────────────────────────

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

type FormErrors = Partial<Record<keyof FormState | "currentProvince" | "currentDistrict" | "currentMunicipality" | "currentWard", string>>;

interface PersonalInfoStepProps {
  onNext?: (data: FormState) => void;
  initialData?: Partial<FormState>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

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

const MIN_PROVIDER_AGE = 18; // adjust if your business rule differs

const createForm = (data?: Partial<FormState>): FormState => ({
  fullName: data?.fullName ?? "",
  dob: data?.dob ?? "",
  gender: data?.gender ?? "",
  phone: data?.phone ?? "",
  email: data?.email ?? "",
  currentAddress: data?.currentAddress ?? { ...emptyAddress },
  permanentAddress: data?.permanentAddress ?? { ...emptyAddress },
  sameAddress: data?.sameAddress ?? true,
});

// ─── DOB helpers ────────────────────────────────────────────────────────────

const getMaxDob = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD — stops the date picker itself from offering future dates
};

const calculateAge = (dobStr: string): number => {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function PersonalInfoStep({
                                           onNext,
                                           initialData,
                                         }: PersonalInfoStepProps) {
  const [form, setForm] = useState<FormState>(() => createForm(initialData));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) setForm(createForm(initialData));
  }, [initialData]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "").replace(/^\+977/, "");
    update("phone", raw);
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";

    if (!form.dob) {
      e.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(form.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        e.dob = "Date of birth cannot be in the future";
      } else if (calculateAge(form.dob) < MIN_PROVIDER_AGE) {
        e.dob = `You must be at least ${MIN_PROVIDER_AGE} years old to register as a provider`;
      }
    }

    if (!form.gender) e.gender = "Please select a gender";

    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^\d{9,10}$/.test(form.phone)) {
      e.phone = "Enter a valid 9–10 digit phone number";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = "Enter a valid email";
    }

    if (!form.currentAddress.province) e.currentProvince = "Province is required";
    if (!form.currentAddress.district) e.currentDistrict = "District is required";
    if (!form.currentAddress.municipality) e.currentMunicipality = "Municipality is required";
    if (!form.currentAddress.ward) e.currentWard = "Ward is required";

    return e;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onNext?.(form);
  };

  return (
      <div className="w-full pb-24 sm:pb-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#e8683f]/10 border border-[#e8683f]/20 mb-3 sm:mb-4">
            <User className="w-5 h-5 text-[#e8683f]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
            Tell us about yourself
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
            This will be verified during KYC
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 sm:gap-6">
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
                max={getMaxDob()}
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
                onChange={handlePhoneChange}
                error={errors.phone}
                required
                inputMode="numeric"
            />
            <FormInput
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                error={errors.email}
                required
                inputMode="email"
            />
          </div>

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

          {/* Action — sticky on mobile, inline on desktop */}
          <div
              className="
            fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-stone-100 p-4
            sm:static sm:z-auto sm:bg-transparent sm:border-0 sm:p-0 sm:flex sm:justify-end sm:pt-4
          "
          >
            <button
                type="button"
                onClick={handleSubmit}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 sm:py-3 bg-[#e8683f] text-white rounded-xl font-semibold hover:bg-[#d95a2f] active:scale-[0.98] transition"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
  );
}