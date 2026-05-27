// "use client";

// import { useSearchParams } from "next/navigation";
// import ProfileHero from "@/components/dashboard/user/explore/profile/ProfileHero";
// import AvailabilityCalendar from "@/components/dashboard/user/explore/profile/AvailabilityCalender";
// import ProviderCredentials from "@/components/dashboard/user/explore/profile/ProviderCredentials";
// import ServicesPricing from "@/components/dashboard/user/explore/profile/ServicesPricing";
// import AboutSection from "@/components/dashboard/user/explore/profile/AboutSection";
// import RatingsBreakdown from "@/components/dashboard/user/explore/profile/RatingsBreakdown";
// import CoverageMap from "@/components/dashboard/user/explore/profile/CoverageMap";
// import ReviewsSection from "@/components/dashboard/user/explore/profile/ReviewsSection";
// import PortfolioSection from "@/components/dashboard/user/explore/profile/PorthfolioSection";
// import BookingSidebar from "@/components/dashboard/user/explore/profile/BookingSidebar";
// import { ProviderData } from "@/components/dashboard/user/explore/profile/types";
// import DescribeIssue from "@/components/dashboard/user/explore/profile/DescribeIssue";

// // ---------------------------------------------------------------------------
// // Static mock data — fully updated with multi-category service sub-items
// // ---------------------------------------------------------------------------
// const PROVIDER_DATA: ProviderData = {
//   id: "1",
//   initials: "RE",
//   name: "Ram Electrical & Home Services",
//   specialty: "Multi-Skilled Professional",
//   category: "Electrician",
//   rating: 4.8,
//   reviews: 124,
//   experience: 7,
//   distance: 8,
//   eta: "Within 1 hour",
//   verified: true,
//   available: true,
//   areas: ["Kathmandu", "Bhaktapur", "Lalitpur"],

//   location: "Koteshwor-3, Kathmandu",
//   categories: ["Carpenter", "Painter", "Electrical Helper"],
//   avatarUrl: "",

//   verificationId: "SL-KYC-2024-0041",
//   registeredName: "Ram Kumar Shrestha",
//   primaryDistrict: "Kathmandu",
//   skills: ["Wiring", "Furniture Touch-up", "Wall Painting", "Emergency Repair"],
//   certificateCount: 4,
//   identityVerifiedDate: "March 22, 2024",
//   memberSince: "March 2024",
//   jobsCompleted: 248,
//   about:
//     "Certified professional with 7 years of hands-on expertise spanning full residential electrical wiring, carpentry assistance, assembly repairs, and interior painting touch-ups.",
//   ratingsBreakdown: {
//     punctuality: 4.9,
//     quality: 4.8,
//     communication: 4.7,
//     value: 4.8,
//   },
//   coverageRadius: 8,
//   coverageCenter: { lat: 27.7172, lng: 85.324 },

//   // =========================================================================
//   // MULTI-CATEGORY SERVICES ENGINE (Electrician, Carpentry, Painting)
//   // =========================================================================
//   services: [
//     // 1. Electrician Sub-Services
//     {
//       name: "Wiring Repair",
//       duration: "1-2 hrs",
//       priceMin: 800,
//       priceMax: 1500,
//       category: "Electrician",
//     },
//     {
//       name: "Fan Installation",
//       duration: "30 min",
//       priceMin: 500,
//       priceMax: 800,
//       category: "Electrician",
//     },
//     {
//       name: "Socket Repair",
//       duration: "30-60 min",
//       priceMin: 300,
//       priceMax: 600,
//       category: "Electrician",
//       priceNote: "(Minimum 1 hour)",
//     },

//     // 2. Carpentry Sub-Services
//     {
//       name: "Door Lock & Handle Fitting",
//       duration: "1 hr",
//       priceMin: 600,
//       priceMax: 1200,
//       category: "Carpentry",
//     },
//     {
//       name: "Furniture Repair & Hinges Fix",
//       duration: "1-2 hrs",
//       priceMin: 800,
//       priceMax: 2000,
//       category: "Carpentry",
//     },

//     // 3. Painting Sub-Services
//     {
//       name: "Wall Painting Touch-up",
//       duration: "2-4 hrs",
//       priceMin: 1500,
//       priceMax: 4000,
//       category: "Painting",
//     },
//     {
//       name: "Door/Window Gloss Painting",
//       duration: "3-5 hrs",
//       priceMin: 1200,
//       priceMax: 3000,
//       category: "Painting",
//     },
//   ],
//   providerReviews: [
//     {
//       id: "r1",
//       name: "Priya M.",
//       initials: "PM",
//       service: "Fan Installation",
//       rating: 5,
//       text: "Very professional and punctual. Fixed everything in under 30 minutes.",
//       date: "May 15, 2026",
//     },
//     {
//       id: "r2",
//       name: "Anil K.",
//       initials: "AK",
//       service: "Furniture Repair",
//       rating: 5,
//       text: "Excellent work on my broken cabinet door. Explained every step clearly. Will definitely book again.",
//       date: "May 8, 2026",
//     },
//     {
//       id: "r3",
//       name: "Sunita R.",
//       initials: "SR",
//       service: "Wall Painting Touch-up",
//       rating: 4,
//       text: "Good quality finish but arrived 20 minutes late. Overall satisfied with the room refresh.",
//       date: "April 30, 2026",
//     },
//   ],
//   portfolio: [
//     {
//       label: "Wiring Installation",
//       gradient: "linear-gradient(135deg, #1e3a8a 0%, #2d52b8 100%)",
//     },
//     {
//       label: "Furniture Repair",
//       gradient: "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
//     },
//     {
//       label: "Wall Painting",
//       gradient: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
//     },
//   ],
// };

// export default function ProviderProfilePage() {
//   const provider = PROVIDER_DATA;

//   const handleIssueOutput = (capturedText: string) => {
//     console.log(
//       "Current issue details statement sent to core engine: ",
//       capturedText,
//     );
//   };

// return (
//   <div className="flex gap-6 items-start">
//     {/* ── Left: scrollable content ── */}
//     <div className="flex-1 min-w-0 space-y-5">
//       <ProfileHero provider={provider} />
//       <ProviderCredentials provider={provider} />
//       <AvailabilityCalendar />
//       <ServicesPricing provider={provider} />
//       <DescribeIssue onIssueChange={handleIssueOutput} />
//       <AboutSection provider={provider} />
//       <RatingsBreakdown provider={provider} />
//       <CoverageMap
//         center={provider.coverageCenter}
//         radiusKm={provider.coverageRadius}
//       />
//       <ReviewsSection provider={provider} />
//       <PortfolioSection provider={provider} />
//     </div>

//     {/* ── Right: sticky booking sidebar ── */}
//     <div className="w-80 shrink-0 sticky top-0 self-start">
//       <BookingSidebar provider={provider} />
//     </div>
//   </div>
// );
// }

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

// ─────────────────────────────────────────────────────────────────────────────
// Example Provider Data
// ─────────────────────────────────────────────────────────────────────────────

// const EXAMPLE_PROVIDER: ProviderData = {
//   name: "Ram Electricals",
//   specialties: ["Electrical", "Carpentry", "Painting"],

//   services: [
//     {
//       name: "Ceiling Fan Installation",
//       category: "Electrician",
//       priceMin: 800,
//       priceMax: 1500,
//       duration: "1–2 hrs",
//     },

//     {
//       name: "Socket Repair",
//       category: "Electrician",
//       priceMin: 500,
//       priceMax: 800,
//       duration: "30–60 min",
//     },

//     {
//       name: "Door Hinge Fix",
//       category: "Carpentry",
//       priceMin: 400,
//       priceMax: 700,
//       duration: "45 min",
//     },

//     {
//       name: "Wall Paint Touch-up",
//       category: "Painting",
//       priceMin: 600,
//       priceMax: 1200,
//       duration: "2–3 hrs",
//     },
//   ],
// };

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

  // return (
  //   <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
  //     {/* LEFT SIDE */}
  //     <div className="flex-1 flex flex-col gap-6">
  //       {/* Services */}
  //       <ServicesPricing
  //         provider={EXAMPLE_PROVIDER}
  //         onBookService={handleAddService}
  //       />

  //       {/* Describe Issue */}
  //       <DescribeIssue onIssueChange={setIssueDescription} />

  //       {/* Availability Calendar */}
  //       <AvailabilityCalendar
  //         onDateChange={handleDateChange}
  //         onPeriodChange={handlePeriodChange}
  //       />
  //     </div>

  //     {/* RIGHT SIDEBAR */}
  //     <div className="lg:w-80 lg:sticky lg:top-6 lg:self-start">
  //       <BookingSidebar
  //         provider={EXAMPLE_PROVIDER}
  //         selectedServices={selectedServices}
  //         issueDescription={issueDescription}
  //         selectedDate={selectedDate}
  //         selectedPeriod={selectedPeriod}
  //       />
  //     </div>
  //   </div>
  // );
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
