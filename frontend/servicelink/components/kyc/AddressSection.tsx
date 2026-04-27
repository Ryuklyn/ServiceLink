"use client";

import { useMemo } from "react";
import { FormInput, FormSelect } from "./FormFields";
import {
  districts,
  provinces,
  municipalities,
  getWardOptions,
  type ProvinceId,
} from "@/data/nepal";

/* =========================
   TYPES
========================= */
export type Address = {
  province: string;
  district: string;
  municipality: string;
  ward: string;
  tole: string;
};

interface AddressSectionProps {
  data: Address;
  onChange: (value: Address) => void;
  prefix?: string;
}

/* =========================
   COMPONENT
========================= */
export default function AddressSection({
  data,
  onChange,
  prefix = "",
}: AddressSectionProps) {
  const municipalityOptions = useMemo(() => {
    if (!data.district) return [];
    return (municipalities[data.district] ?? []).map((m) => ({
      value: m.name,
      // show type in label so user knows Metro / Sub-Metro / etc.
      label: `${m.name} (${m.type})`,
    }));
  }, [data.district]);

  /* ── Ward options (cascade on municipality) ───────────────────── */
  const wardOptions = useMemo(() => {
    if (!data.municipality || !data.district) return [];
    const selected = (municipalities[data.district] ?? []).find(
      (m) => m.name === data.municipality,
    );
    if (!selected) return [];
    return getWardOptions(selected.wards);
  }, [data.district, data.municipality]);
  /* =========================
     PROVINCE OPTIONS
  ========================= */
  const provinceOptions = useMemo(
    () =>
      provinces.map((p) => ({
        value: String(p.id),
        label: p.name,
      })),
    [],
  );

  /* =========================
     DISTRICT OPTIONS (SAFE + TYPED)
  ========================= */
  const districtOptions = useMemo(() => {
    if (!data.province) return [];

    const provinceId = Number(data.province);

    if (provinceId < 1 || provinceId > 7) return [];

    const list = districts[provinceId as ProvinceId] ?? [];

    return list.map((d) => ({
      value: d,
      label: d,
    }));
  }, [data.province]);

  /* =========================
     SAFE FIELD UPDATE
  ========================= */
  const handleChange = <K extends keyof Address>(
    field: K,
    value: Address[K],
  ) => {
    onChange({
      ...data,
      [field]: field === "province" ? (value as string) : value,
      // reset district when province changes
      ...(field === "province" ? { district: "" } : {}),
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* PROVINCE + DISTRICT */}
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Province"
          id={`${prefix}province`}
          value={data.province}
          onChange={(e) => handleChange("province", e.target.value)}
          options={provinceOptions}
          placeholder="Select Province"
          required
        />

        <FormSelect
          label="District"
          id={`${prefix}district`}
          value={data.district}
          onChange={(e) => handleChange("district", e.target.value)}
          options={districtOptions}
          placeholder="Select District"
          disabled={!data.province}
          required
        />
      </div>

      {/* MUNICIPALITY + WARD */}
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Municipality / Rural Municipality"
          id={`${prefix}municipality`}
          value={data.municipality}
          onChange={(e) => handleChange("municipality", e.target.value)}
          options={municipalityOptions}
          placeholder="Municipality name"
          required
        />

        <FormSelect
          label="Ward No."
          id={`${prefix}ward`}
          value={data.ward}
          onChange={(e) => handleChange("ward", e.target.value)}
          options={wardOptions}
          placeholder="Ward number"
          required
        />
      </div>

      {/* TOLE */}
      <FormInput
        label="Tole / Street"
        id={`${prefix}tole`}
        value={data.tole}
        onChange={(e) => handleChange("tole", e.target.value)}
        placeholder="Tole or street name"
      />
    </div>
  );
}
