import type { PortfolioProject } from "@/types/portfolio";

export interface ProviderService {
  name: string;
  duration: string;
  priceMin: number;
  priceMax: number;
  category: string; // <-- ADDED: Crucial for separating Electrician, Carpentry, Painting, etc.
  priceNote?: string; // <-- ADDED: For sub-labels like "(Minimum 1 hour)" or "(Includes first visit)"
  catalogId?: number; // ADD THIS
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

// export interface PortfolioItem {
//   label: string;
//   gradient: string;
// }

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
  services: ProviderService[]; // <-- Harnesses our upgraded ProviderService schema layout
  providerReviews: ProviderReview[];
  // portfolio: PortfolioItem[];
  portfolio: PortfolioProject[];
}
