"use client";

import { AlertCircle } from "lucide-react";
import { InputHTMLAttributes, useMemo } from "react";

/* =========================
   TYPES
========================= */
interface SelectOption {
  value: string;
  label: string;
}

/* =========================
   INPUT COMPONENT
========================= */
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  prefix?: string;
  className?: string;
}

export function FormInput({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  prefix,
  required,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-0 pl-3.5 pr-2 h-full flex items-center text-sm font-semibold text-stone-500 border-r border-stone-200 bg-stone-50 rounded-l-lg pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={[
            "w-full rounded-lg border text-sm text-stone-800 placeholder-stone-400",
            "transition-all duration-200 outline-none bg-white py-3",
            prefix ? "pl-[4.5rem] pr-4" : "px-4",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
          ].join(" ")}
          {...props}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================
   SELECT COMPONENT
========================= */
interface FormSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: (SelectOption | string)[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  required,
  disabled,
  className = "",
}: FormSelectProps) {
  /* ✅ Normalize options once (best practice) */
  const normalizedOptions = useMemo<SelectOption[]>(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt,
      ),
    [options],
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>

      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          "w-full rounded-lg border text-sm transition-all duration-200 outline-none",
          "py-3 px-4 appearance-none",
          disabled
            ? "opacity-50 cursor-not-allowed bg-stone-50"
            : "cursor-pointer bg-white",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-red-500"
            : value
              ? "border-stone-200 text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              : "border-stone-200 text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
        ].join(" ")}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "38px",
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================
   CHECKBOX
========================= */
interface FormCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function FormCheckbox({
  id,
  label,
  checked,
  onChange,
  className = "",
}: FormCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
    >
      <div className="relative flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        <div
          className={[
            "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
            checked
              ? "bg-amber-500 border-amber-500"
              : "bg-white border-stone-300 group-hover:border-amber-400",
          ].join(" ")}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      <span className="text-sm font-medium text-stone-700 select-none">
        {label}
      </span>
    </label>
  );
}

/* =========================
   SECTION DIVIDER
========================= */
interface SectionDividerProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function SectionDivider({ title, icon: Icon }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 pt-1">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-500" />
        </div>
      )}

      <h2 className="text-base font-bold text-stone-800">{title}</h2>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  );
}
