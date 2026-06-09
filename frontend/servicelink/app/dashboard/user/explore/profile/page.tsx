// "use client";
//
// import { useState } from "react";
//
// import BookingSidebar from "../../../../../components/dashboard/user/explore/profile/BookingSidebar";
// import ServicesPricing from "../../../../../components/dashboard/user/explore/profile/ServicesPricing";
// import DescribeIssue from "../../../../../components/dashboard/user/explore/profile/DescribeIssue";
// import AvailabilityCalendar from "../../../../../components/dashboard/user/explore/profile/AvailabilityCalender";
//
// import { ProviderData } from "../../../../../components/dashboard/user/explore/profile/types";
// import {
//   AboutSection,
//   CoverageMap,
//   PortfolioSection,
//   ProfileHero,
//   ProviderCredentials,
//   RatingsBreakdown,
//   ReviewsSection,
// } from "@/components/dashboard/user/explore/profile";
//
// interface SelectedService {
//   name: string;
//   priceMin: number;
//   priceMax: number;
// }
// const EXAMPLE_PROVIDER: ProviderData = {
//   id: "provider-1",
//
//   initials: "RE",
//
//   name: "Ram Electricals",
//
//   specialty: "Home Repair Specialist",
//
//   category: "Electrician",
//
//   rating: 4.9,
//
//   reviews: 124,
//
//   experience: 8,
//
//   distance: 2.4,
//
//   eta: "25 mins",
//
//   verified: true,
//
//   available: true,
//
//   // FIX
//   areas: ["Kathmandu", "Lalitpur", "Bhaktapur"],
//
//   location: "Kathmandu, Nepal",
//
//   categories: ["Electrical", "Carpentry", "Painting"],
//
//   avatarUrl: "",
//
//   verificationId: "VER-2026-001",
//
//   registeredName: "Ram Electrical Services Pvt Ltd",
//
//   primaryDistrict: "Kathmandu",
//
//   skills: [
//     "Fan Installation",
//     "Socket Repair",
//     "Wiring",
//     "Painting",
//     "Wood Repair",
//   ],
//
//   certificateCount: 5,
//
//   identityVerifiedDate: "2025-01-15",
//
//   memberSince: "2022",
//
//   jobsCompleted: 320,
//
//   about:
//     "Professional home maintenance provider specializing in electrical, carpentry, and painting services with fast response times and reliable workmanship.",
//
//   ratingsBreakdown: {
//     punctuality: 4.9,
//     quality: 4.8,
//     communication: 4.7,
//     value: 4.8,
//   },
//
//   coverageRadius: 15,
//
//   coverageCenter: {
//     lat: 27.7172,
//     lng: 85.324,
//   },
//
//   services: [
//     {
//       name: "Ceiling Fan Installation",
//       category: "Electrician",
//       priceMin: 800,
//       priceMax: 1500,
//       duration: "1–2 hrs",
//     },
//
//     {
//       name: "Socket Repair",
//       category: "Electrician",
//       priceMin: 500,
//       priceMax: 800,
//       duration: "30–60 min",
//     },
//
//     {
//       name: "Door Hinge Fix",
//       category: "Carpentry",
//       priceMin: 400,
//       priceMax: 700,
//       duration: "45 min",
//     },
//
//     {
//       name: "Wall Paint Touch-up",
//       category: "Painting",
//       priceMin: 600,
//       priceMax: 1200,
//       duration: "2–3 hrs",
//     },
//   ],
//
//   providerReviews: [
//     {
//       id: "1",
//       name: "Aarav Sharma",
//       initials: "AS",
//       service: "Fan Installation",
//       rating: 5,
//       text: "Very professional and fast service.",
//       date: "2 days ago",
//     },
//
//     {
//       id: "2",
//       name: "Sita Rai",
//       initials: "SR",
//       service: "Socket Repair",
//       rating: 4,
//       text: "Good communication and affordable pricing.",
//       date: "1 week ago",
//     },
//   ],
//
//   portfolio: [
//     {
//       label: "Electrical Work",
//       gradient: "from-blue-500 to-cyan-500",
//     },
//
//     {
//       label: "Interior Painting",
//       gradient: "from-orange-500 to-pink-500",
//     },
//
//     {
//       label: "Furniture Repair",
//       gradient: "from-green-500 to-emerald-500",
//     },
//   ],
// };
//
// // ─────────────────────────────────────────────────────────────────────────────
// // Component
// // ─────────────────────────────────────────────────────────────────────────────
//
// export default function ProviderPage() {
//   // ── Shared Booking State ────────────────────────────────────────────────
//
//   const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
//     [],
//   );
//
//   const [issueDescription, setIssueDescription] = useState("");
//
//   const [selectedDate, setSelectedDate] = useState<number>(29);
//
//   const [selectedPeriod, setSelectedPeriod] = useState<
//     "morning" | "afternoon" | "evening" | null
//   >("morning");
//
//   // ── Handlers ────────────────────────────────────────────────────────────
//
//   const handleAddService = (serviceName: string) => {
//     const service = EXAMPLE_PROVIDER.services.find(
//       (s) => s.name === serviceName,
//     );
//
//     if (!service) return;
//
//     setSelectedServices((prev) => {
//       const alreadySelected = prev.find((s) => s.name === serviceName);
//
//       // Toggle remove
//       if (alreadySelected) {
//         return prev.filter((s) => s.name !== serviceName);
//       }
//
//       // Add service
//       return [
//         ...prev,
//         {
//           name: service.name,
//           priceMin: service.priceMin,
//           priceMax: service.priceMax,
//         },
//       ];
//     });
//   };
//
//   const handleDateChange = (date: number) => {
//     setSelectedDate(date);
//   };
//
//   const handlePeriodChange = (
//     period: "morning" | "afternoon" | "evening" | null,
//   ) => {
//     setSelectedPeriod(period);
//   };
//
//   // ── UI ──────────────────────────────────────────────────────────────────
//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 items-start">
//       {/* ───────────────── LEFT CONTENT ───────────────── */}
//       <div className="flex-1 min-w-0 space-y-5">
//         {/* Hero */}
//         <ProfileHero provider={EXAMPLE_PROVIDER} />
//
//         {/* Credentials */}
//         <ProviderCredentials provider={EXAMPLE_PROVIDER} />
//
//         {/* Services */}
//         <ServicesPricing
//           provider={EXAMPLE_PROVIDER}
//           onBookService={handleAddService}
//         />
//
//         {/* Availability Calendar */}
//         <AvailabilityCalendar
//           onDateChange={handleDateChange}
//           onPeriodChange={handlePeriodChange}
//         />
//
//         {/* Describe Issue */}
//         <DescribeIssue onIssueChange={setIssueDescription} />
//
//         {/* About */}
//         <AboutSection provider={EXAMPLE_PROVIDER} />
//
//         {/* Ratings */}
//         <RatingsBreakdown provider={EXAMPLE_PROVIDER} />
//
//         {/* Coverage Map */}
//         <CoverageMap
//           center={EXAMPLE_PROVIDER.coverageCenter}
//           radiusKm={EXAMPLE_PROVIDER.coverageRadius}
//         />
//
//         {/* Reviews */}
//         <ReviewsSection provider={EXAMPLE_PROVIDER} />
//
//         {/* Portfolio */}
//         <PortfolioSection provider={EXAMPLE_PROVIDER} />
//       </div>
//
//       {/* ───────────────── RIGHT SIDEBAR ───────────────── */}
//       <div className="w-80 shrink-0 sticky top-6 self-start">
//         <BookingSidebar
//           provider={EXAMPLE_PROVIDER}
//           selectedServices={selectedServices}
//           issueDescription={issueDescription}
//           selectedDate={selectedDate}
//           selectedPeriod={selectedPeriod}
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/utils/axios";

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

interface SelectedService {
  name: string;
  priceMin: number;
  priceMax: number;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function mapBackendToProviderData(data: any): ProviderData {
  return {
    id: String(data.id),
    initials: getInitials(data.fullName ?? ""),
    name: data.businessName ?? data.fullName,
    specialty: data.primaryService,
    category: data.primaryService,
    rating: data.averageRating ?? 5.0,
    reviews: data.totalReviews ?? 0,
    experience: data.experienceYears ?? 0,
    distance: 5,
    eta: "Within 1 hour",
    verified: data.isVerified ?? false,
    available: data.isOnline ?? false,
    areas: data.coveredDistricts
        ? data.coveredDistricts.split(",").map((d: string) => d.trim())
        : [data.baseDistrict ?? "Kathmandu"],
    location: `${data.baseDistrict ?? "Kathmandu"}, Nepal`,
    categories: [data.primaryService],
    avatarUrl: data.profilePictureUrl ?? "",
    verificationId: `VER-${data.id}`,
    registeredName: data.businessName ?? data.fullName,
    primaryDistrict: data.baseDistrict ?? "Kathmandu",
    skills: data.services?.map((s: any) => s.subServiceName) ?? [],
    certificateCount: 0,
    identityVerifiedDate: "",
    memberSince: data.memberSince
        ? new Date(data.memberSince).getFullYear().toString()
        : "2024",
    jobsCompleted: data.totalJobs ?? 0,
    about: data.bio ?? "",
    ratingsBreakdown: {
      punctuality: data.punctualityScore ?? data.averageRating ?? 5,
      quality: data.qualityScore ?? data.averageRating ?? 5,
      communication: data.communicationScore ?? data.averageRating ?? 5,
      value: data.valueScore ?? data.averageRating ?? 5,
    },
    coverageRadius: data.travelRadiusKm ?? 10,
    coverageCenter: {
      lat: data.latitude ?? 27.7172,
      lng: data.longitude ?? 85.324,
    },
    services: data.services?.map((s: any) => ({
      name: s.subServiceName,
      category: s.category,
      priceMin: s.customPrice,
      priceMax: s.customPrice,
      duration: s.effectiveDuration ?? "1 hr",
    })) ?? [],
    providerReviews: data.recentReviews?.map((r: any) => ({
      id: String(r.id),
      name: r.customerName,
      initials: r.customerName?.slice(0, 2).toUpperCase() ?? "??",
      service: r.serviceName ?? "",
      rating: r.rating,
      text: r.comment ?? "",
      date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString()
          : "",
    })) ?? [],
    portfolio: data.portfolio?.map((p: any) => ({
      label: p.caption ?? p.serviceCategory ?? "Work Sample",
      gradient: "from-blue-500 to-cyan-500",
      mediaUrl: p.mediaUrl ?? "",
    })) ?? [],
  };
}

export default function ProviderPage() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get("id") ?? "1";

  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<number>(29);
  // const [selectedPeriod, setSelectedPeriod] = useState
  // "morning" | "afternoon" | "evening" | null
  // >("morning");

  const [selectedPeriod, setSelectedPeriod] = useState<
      "morning" | "afternoon" | "evening" | null
  >("morning");

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get(`/providers/${providerId}`);
        setProvider(mapBackendToProviderData(data));
      } catch (err) {
        console.error("Failed to fetch provider:", err);
        setError("Failed to load provider profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  const handleAddService = (serviceName: string) => {
    if (!provider) return;

    const service = provider.services.find((s) => s.name === serviceName);
    if (!service) return;

    setSelectedServices((prev) => {
      const alreadySelected = prev.find((s) => s.name === serviceName);
      if (alreadySelected) return prev.filter((s) => s.name !== serviceName);
      return [...prev, {
        name: service.name,
        priceMin: service.priceMin,
        priceMax: service.priceMax,
      }];
    });
  };

  if (loading) {
    return (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Loading provider profile...</p>
        </div>
    );
  }

  if (error || !provider) {
    return (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error ?? "Provider not found."}</p>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          <ProfileHero provider={provider} />
          <ProviderCredentials provider={provider} />
          <ServicesPricing provider={provider} onBookService={handleAddService} />
          <AvailabilityCalendar
              onDateChange={setSelectedDate}
              onPeriodChange={setSelectedPeriod}
          />
          <DescribeIssue onIssueChange={setIssueDescription} />
          <AboutSection provider={provider} />
          <RatingsBreakdown provider={provider} />
          <CoverageMap
              center={provider.coverageCenter}
              radiusKm={provider.coverageRadius}
          />
          <ReviewsSection provider={provider} />
          <PortfolioSection provider={provider} />
        </div>

        <div className="w-80 shrink-0 sticky top-6 self-start">
          <BookingSidebar
              provider={provider}
              selectedServices={selectedServices}
              issueDescription={issueDescription}
              selectedDate={selectedDate}
              selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
  );
}