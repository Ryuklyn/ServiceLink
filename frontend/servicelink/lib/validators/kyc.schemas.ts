import { z } from "zod";

// ── OTP ─────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

// ── Phone (Nepal) ───────────────────────────────
export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(
      /^\+977(98|97|96)\d{8}$/,
      "Enter a valid Nepali number (+97798XXXXXXXX)",
    ),
});

// ── Email ───────────────────────────────────────
export const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

// ── Types (for TS safety) ───────────────────────
export type OtpData = z.infer<typeof otpSchema>;
export type PhoneData = z.infer<typeof phoneSchema>;
export type EmailData = z.infer<typeof emailSchema>;
