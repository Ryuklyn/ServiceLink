"use client";

import { useRef } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function OtpInput({ value, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Visual boxes — decorative only */}
        <div className="flex gap-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={[
                "w-11 h-14 rounded-xl border-2 flex items-center justify-center",
                "text-xl font-bold text-[#1e3a8a] transition-all",
                i === value.length
                  ? "border-[#e8683f] bg-[#e8683f]/10"
                  : value[i]
                    ? "border-[#1e3a8a]/30 bg-white"
                    : "border-gray-200 bg-stone-50",
              ].join(" ")}
            >
              {value[i] ?? ""}
            </div>
          ))}
        </div>

        {/* Real input — invisible but receives all input events */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          autoComplete="one-time-code"
          maxLength={6}
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
            onChange(digits);
          }}
          aria-label="One-time password"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "otp-error" : undefined}
          className="absolute inset-0 opacity-0 cursor-text"
          autoFocus
        />
      </div>

      {error && (
        <p
          id="otp-error"
          role="alert"
          className="text-xs text-red-500 font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}
