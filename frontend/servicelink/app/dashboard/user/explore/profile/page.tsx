"use client";

import { useSearchParams } from "next/navigation";
import ProfileHero from "@/components/dashboard/user/explore/profile/ProfileHero";
import AvailabilityCalendar from "@/components/dashboard/user/explore/profile/AvailabilityCalender";
import ProviderCredentials from "@/components/dashboard/user/explore/profile/ProviderCredentials";
import ServicesPricing from "@/components/dashboard/user/explore/profile/ServicesPricing";
import AboutSection from "@/components/dashboard/user/explore/profile/AboutSection";
import RatingsBreakdown from "@/components/dashboard/user/explore/profile/RatingsBreakdown";
import CoverageMap from "@/components/dashboard/user/explore/profile/CoverageMap";
import ReviewsSection from "@/components/dashboard/user/explore/profile/ReviewsSection";
import PortfolioSection from "@/components/dashboard/user/explore/profile/PorthfolioSection";
import BookingSidebar from "@/components/dashboard/user/explore/profile/BookingSidebar";
import { ProviderData } from "@/components/dashboard/user/explore/profile/types";

// ---------------------------------------------------------------------------
// Static mock data — replace with API call using `useSearchParams` id when ready
// ---------------------------------------------------------------------------
const PROVIDER_DATA: ProviderData = {
  id: "1",
  initials: "RE",
  name: "Ram Electrical Services",
  specialty: "Certified Electrician",
  category: "Electrician",
  rating: 4.8,
  reviews: 124,
  experience: 7,
  distance: 8,
  eta: "Within 1 hour",
  verified: true,
  available: true,
  areas: ["Kathmandu", "Bhaktapur", "Lalitpur"],
  // Extended
  verificationId: "SL-KYC-2024-0041",
  registeredName: "Ram Kumar Shrestha",
  primaryDistrict: "Kathmandu",
  skills: ["Wiring", "Panel Work", "Emergency Repair"],
  certificateCount: 2,
  identityVerifiedDate: "March 22, 2024",
  memberSince: "March 2024",
  jobsCompleted: 248,
  about:
    "Certified electrician with 7 years of experience in residential and commercial wiring, panel upgrades, and emergency repairs.",
  ratingsBreakdown: {
    punctuality: 4.9,
    quality: 4.8,
    communication: 4.7,
    value: 4.8,
  },
  coverageRadius: 8,
  coverageCenter: { lat: 27.7172, lng: 85.324 },
  services: [
    {
      name: "Wiring Repair",
      duration: "1-2 hrs",
      priceMin: 800,
      priceMax: 1500,
    },
    {
      name: "Fan Installation",
      duration: "30 min",
      priceMin: 500,
      priceMax: 800,
    },
    {
      name: "Panel Upgrade",
      duration: "3-4 hrs",
      priceMin: 3000,
      priceMax: 5000,
    },
    {
      name: "Emergency Repair",
      duration: "1 hr",
      priceMin: 1200,
      priceMax: 2000,
    },
  ],
  providerReviews: [
    {
      id: "r1",
      name: "Priya M.",
      initials: "PM",
      service: "Fan Installation",
      rating: 5,
      text: "Very professional and punctual. Fixed everything in under 30 minutes.",
      date: "May 15, 2026",
    },
    {
      id: "r2",
      name: "Anil K.",
      initials: "AK",
      service: "Wiring Repair",
      rating: 5,
      text: "Excellent work. Explained every step clearly. Will definitely book again.",
      date: "May 8, 2026",
    },
    {
      id: "r3",
      name: "Sunita R.",
      initials: "SR",
      service: "Panel Upgrade",
      rating: 4,
      text: "Good quality work but arrived 20 minutes late. Overall satisfied.",
      date: "April 30, 2026",
    },
  ],
  portfolio: [
    {
      label: "Wiring Installation",
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #2d52b8 100%)",
    },
    {
      label: "Panel Upgrade",
      gradient: "linear-gradient(135deg, #162c6e 0%, #1e3a8a 100%)",
    },
    {
      label: "Fan Installation",
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b4fa8 100%)",
    },
    {
      label: "Emergency Repair",
      gradient: "linear-gradient(135deg, #0f2260 0%, #1e3a8a 100%)",
    },
  ],
};

export default function ProviderProfilePage() {
  // Ready to swap: const params = useSearchParams(); const id = params.get("id");
  const provider = PROVIDER_DATA;

  return (
    <div className="flex gap-6 items-start">
      {/* ── Left: scrollable content ── */}
      <div className="flex-1 min-w-0 space-y-5">
        <ProfileHero provider={provider} />
        <AvailabilityCalendar />
        <ProviderCredentials provider={provider} />
        <ServicesPricing provider={provider} />
        <AboutSection provider={provider} />
        <RatingsBreakdown provider={provider} />
        <CoverageMap
          center={provider.coverageCenter}
          radiusKm={provider.coverageRadius}
        />
        <ReviewsSection provider={provider} />
        <PortfolioSection provider={provider} />
      </div>

      {/* ── Right: sticky booking sidebar ── */}
      <div className="w-80 shrink-0 sticky top-0 self-start">
        <BookingSidebar provider={provider} />
      </div>
    </div>
  );
}
