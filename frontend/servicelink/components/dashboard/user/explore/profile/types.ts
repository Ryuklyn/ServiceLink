export interface ProviderService {
  name: string;
  duration: string;
  priceMin: number;
  priceMax: number;
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

export interface PortfolioItem {
  label: string;
  gradient: string;
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
  // Extended profile fields
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
  portfolio: PortfolioItem[];
}
