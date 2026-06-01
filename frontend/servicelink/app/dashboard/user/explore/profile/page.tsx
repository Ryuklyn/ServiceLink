"use client";

/**
 * page.tsx
 *
 * Provider profile + booking flow
 * - ServicesPricing
 * - DescribeIssue
 * - AvailabilityCalendar
 * - BookingSidebar
 */

import { useState } from "react";

import BookingSidebar from "../../../../../components/dashboard/user/explore/profile/BookingSidebar";
import ServicesPricing from "../../../../../components/dashboard/user/explore/profile/ServicesPricing";
import DescribeIssue from "../../../../../components/dashboard/user/explore/profile/DescribeIssue";
import AvailabilityCalendar from "../../../../../components/dashboard/user/explore/profile/AvailabilityCalender";

import { ProviderData } from "../../../../../components/dashboard/user/explore/profile/types";
import {
  AboutSection,
  CoverageMap,
  PortfolioSection,
  ProfileHero,
  ProviderCredentials,
  RatingsBreakdown,
  ReviewsSection,
} from "@/components/dashboard/user/explore/profile";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SelectedService {
  name: string;
  priceMin: number;
  priceMax: number;
}
const EXAMPLE_PROVIDER: ProviderData = {
  id: "provider-1",

  initials: "RE",

  name: "Ram Electricals",

  specialty: "Home Repair Specialist",

  category: "Electrician",

  rating: 4.9,

  reviews: 124,

  experience: 8,

  distance: 2.4,

  eta: "25 mins",

  verified: true,

  available: true,

  // FIX
  areas: ["Kathmandu", "Lalitpur", "Bhaktapur"],

  location: "Kathmandu, Nepal",

  categories: ["Electrical", "Carpentry", "Painting"],

  avatarUrl: "",

  verificationId: "VER-2026-001",

  registeredName: "Ram Electrical Services Pvt Ltd",

  primaryDistrict: "Kathmandu",

  skills: [
    "Fan Installation",
    "Socket Repair",
    "Wiring",
    "Painting",
    "Wood Repair",
  ],

  certificateCount: 5,

  identityVerifiedDate: "2025-01-15",

  memberSince: "2022",

  jobsCompleted: 320,

  about:
    "Professional home maintenance provider specializing in electrical, carpentry, and painting services with fast response times and reliable workmanship.",

  ratingsBreakdown: {
    punctuality: 4.9,
    quality: 4.8,
    communication: 4.7,
    value: 4.8,
  },

  coverageRadius: 15,

  coverageCenter: {
    lat: 27.7172,
    lng: 85.324,
  },

  services: [
    {
      name: "Ceiling Fan Installation",
      category: "Electrician",
      priceMin: 800,
      priceMax: 1500,
      duration: "1–2 hrs",
    },

    {
      name: "Socket Repair",
      category: "Electrician",
      priceMin: 500,
      priceMax: 800,
      duration: "30–60 min",
    },

    {
      name: "Door Hinge Fix",
      category: "Carpentry",
      priceMin: 400,
      priceMax: 700,
      duration: "45 min",
    },

    {
      name: "Wall Paint Touch-up",
      category: "Painting",
      priceMin: 600,
      priceMax: 1200,
      duration: "2–3 hrs",
    },
  ],

  providerReviews: [
    {
      id: "1",
      name: "Aarav Sharma",
      initials: "AS",
      service: "Fan Installation",
      rating: 5,
      text: "Very professional and fast service.",
      date: "2 days ago",
    },

    {
      id: "2",
      name: "Sita Rai",
      initials: "SR",
      service: "Socket Repair",
      rating: 4,
      text: "Good communication and affordable pricing.",
      date: "1 week ago",
    },
  ],

  portfolio: [
    {
      label: "Electrical Work",
      gradient: "from-blue-500 to-cyan-500",
    },

    {
      label: "Interior Painting",
      gradient: "from-orange-500 to-pink-500",
    },

    {
      label: "Furniture Repair",
      gradient: "from-green-500 to-emerald-500",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProviderPage() {
  // ── Shared Booking State ────────────────────────────────────────────────

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  );

  const [issueDescription, setIssueDescription] = useState("");

  const [selectedDate, setSelectedDate] = useState<number>(29);

  const [selectedPeriod, setSelectedPeriod] = useState<
    "morning" | "afternoon" | "evening" | null
  >("morning");

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddService = (serviceName: string) => {
    const service = EXAMPLE_PROVIDER.services.find(
      (s) => s.name === serviceName,
    );

    if (!service) return;

    setSelectedServices((prev) => {
      const alreadySelected = prev.find((s) => s.name === serviceName);

      // Toggle remove
      if (alreadySelected) {
        return prev.filter((s) => s.name !== serviceName);
      }

      // Add service
      return [
        ...prev,
        {
          name: service.name,
          priceMin: service.priceMin,
          priceMax: service.priceMax,
        },
      ];
    });
  };

  const handleDateChange = (date: number) => {
    setSelectedDate(date);
  };

  const handlePeriodChange = (
    period: "morning" | "afternoon" | "evening" | null,
  ) => {
    setSelectedPeriod(period);
  };

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 items-start">
      {/* ───────────────── LEFT CONTENT ───────────────── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Hero */}
        <ProfileHero provider={EXAMPLE_PROVIDER} />

        {/* Credentials */}
        <ProviderCredentials provider={EXAMPLE_PROVIDER} />

        {/* Services */}
        <ServicesPricing
          provider={EXAMPLE_PROVIDER}
          onBookService={handleAddService}
        />

        {/* Availability Calendar */}
        <AvailabilityCalendar
          onDateChange={handleDateChange}
          onPeriodChange={handlePeriodChange}
        />

        {/* Describe Issue */}
        <DescribeIssue onIssueChange={setIssueDescription} />

        {/* About */}
        <AboutSection provider={EXAMPLE_PROVIDER} />

        {/* Ratings */}
        <RatingsBreakdown provider={EXAMPLE_PROVIDER} />

        {/* Coverage Map */}
        <CoverageMap
          center={EXAMPLE_PROVIDER.coverageCenter}
          radiusKm={EXAMPLE_PROVIDER.coverageRadius}
        />

        {/* Reviews */}
        <ReviewsSection provider={EXAMPLE_PROVIDER} />

        {/* Portfolio */}
        <PortfolioSection provider={EXAMPLE_PROVIDER} />
      </div>

      {/* ───────────────── RIGHT SIDEBAR ───────────────── */}
      <div className="w-80 shrink-0 sticky top-6 self-start">
        <BookingSidebar
          provider={EXAMPLE_PROVIDER}
          selectedServices={selectedServices}
          issueDescription={issueDescription}
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        />
      </div>
    </div>
  );
}
