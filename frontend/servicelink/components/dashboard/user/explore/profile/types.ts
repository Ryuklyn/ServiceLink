import type { PortfolioProject } from "@/types/portfolio";

// --- Smart Price Estimation (spec §3–§6) ---

export type PricingUnit = "PER_JOB" | "PER_ITEM" | "PER_HOUR" | "PER_SQ_FT" | "PER_WALL";

export type EstimationMode =
    | "FIXED"              // AUTOMATIC — rate × 1, or rate × known qty
    | "INPUT_BASED"        // needs customer-supplied qty / hours / area / walls
    | "INSPECTION_REQUIRED";

export type EstimateStatus =
    | "ESTIMATED"
    | "STARTING_FROM"
    | "REQUIRES_INPUT"
    | "REQUIRES_ASSESSMENT"
    | "FINALIZED";

export interface ProviderService {
  name: string;
  duration: string;
  priceMin: number;
  priceMax: number;
  category: string;
  priceNote?: string;
  catalogId?: number;

  // --- new: drives the Smart Estimator (optional so existing data keeps working) ---
  pricingUnit?: PricingUnit;
  rate?: number;                 // provider's active rate — spec §8, never recommendedRate
  estimationMode?: EstimationMode;
  requiredInputLabel?: string;   // e.g. "Approximate area (sq. ft.)" or "Number of walls"
}

// --- append to the existing types.ts from before ---

export interface SelectedService {
  name: string;
  catalogId?: number;
  priceMin: number;
  priceMax: number;
  pricingUnit?: PricingUnit;
  rate?: number;
  estimationMode?: EstimationMode;
  quantity?: number;
  estimateStatus: EstimateStatus;
  estimatedAmount: number | null; // null while REQUIRES_INPUT / REQUIRES_ASSESSMENT
}

export interface ProviderReview {
  id: string;
  name: string;
  initials: string;
  service: string;
  rating: number;
  text: string;
  date: string;
}

export interface ProviderData {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  category: string;
  rating: number;
  reviews: number;
  experience: number;
  distance: number;
  eta: string;
  verified: boolean;
  available: boolean;
  areas: string[];
  phone: string;

  location?: string;
  categories?: string[];
  avatarUrl?: string;

  verificationId: string;
  registeredName: string;
  primaryDistrict: string;
  skills: string[];
  certificateCount: number;
  identityVerifiedDate: string;
  memberSince: string;
  jobsCompleted: number;
  about: string;
  ratingsBreakdown: {
    punctuality: number;
    quality: number;
    communication: number;
    value: number;
  };
  coverageRadius: number;
  coverageCenter: { lat: number; lng: number };
  services: ProviderService[];
  providerReviews: ProviderReview[];
  portfolio: PortfolioProject[];
}
