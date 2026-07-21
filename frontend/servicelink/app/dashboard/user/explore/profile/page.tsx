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
  catalogId?: number;
}

function getInitials(name: string): string {
  return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
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
    services:
        data.services?.map((s: any) => ({
          name: s.subServiceName,
          category: s.category,
          priceMin: s.customPrice,
          priceMax: s.customPrice,
          duration: s.effectiveDuration ?? "1 hr",
          catalogId: s.catalogId,
        })) ?? [],
    providerReviews:
        data.recentReviews?.map((r: any) => ({
          id: String(r.id),
          name: r.customerName,
          initials: r.customerName?.slice(0, 2).toUpperCase() ?? "??",
          service: r.serviceName ?? "",
          rating: r.rating,
          text: r.comment ?? "",
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
        })) ?? [],
    // portfolio:
    //     data.portfolio?.map((p: any) => ({
    //       label: p.caption ?? p.serviceCategory ?? "Work Sample",
    //       gradient: "from-blue-500 to-cyan-500",
    //       mediaUrl: p.mediaUrl ?? "",
    //     })) ?? [],
    portfolio: data.portfolio ?? [],
  };
}

export default function ProviderPage() {
  const searchParams = useSearchParams();
  const providerId   = searchParams.get("id") ?? "1";

  const [provider, setProvider]               = useState<ProviderData | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [issueDescription, setIssueDescription] = useState("");

  const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);
  const [voiceNoteUrl, setVoiceNoteUrl]   = useState<string | null>(null);

  const handleVoiceNoteChange = (blob: Blob | null) => {
    if (voiceNoteUrl) URL.revokeObjectURL(voiceNoteUrl);
    setVoiceNoteBlob(blob);
    setVoiceNoteUrl(blob ? URL.createObjectURL(blob) : null);
  };

  useEffect(() => {
    return () => { if (voiceNoteUrl) URL.revokeObjectURL(voiceNoteUrl); };
  }, [voiceNoteUrl]);

  const [selectedDate, setSelectedDate]     = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);

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

  const handleToggleService = (serviceName: string) => {
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
        catalogId: service.catalogId,
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left Content Column (Full width on mobile, scales beautifully) ── */}
        <div className="w-full flex-1 min-w-0 space-y-4 sm:space-y-5">
          <ProfileHero provider={provider} />
          <ProviderCredentials provider={provider} />

          <ServicesPricing
              provider={provider}
              onBookService={handleToggleService}
              selectedServices={selectedServices}
          />

          <AvailabilityCalendar
              providerId={provider.id}
              onDateChange={setSelectedDate}
              onPeriodChange={setSelectedPeriod}
          />

          <DescribeIssue
              onIssueChange={setIssueDescription}
              onVoiceNoteChange={handleVoiceNoteChange}
          />

          <AboutSection provider={provider} />
          <RatingsBreakdown provider={provider} />

          {/* Wrapper layout for map injection safety handles overflow constraints */}
          <div className="w-full overflow-hidden rounded-xl">
            <CoverageMap
                center={provider.coverageCenter}
                radiusKm={provider.coverageRadius}
            />
          </div>

          <ReviewsSection provider={provider} />
          <PortfolioSection provider={provider} />
        </div>

        {/* ── Sidebar Component (Appears below main feed on mobile, snaps side-by-side on desktop) ── */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-6 lg:self-start mt-2 lg:mt-0">
          <BookingSidebar
              provider={provider}
              selectedServices={selectedServices}
              issueDescription={issueDescription}
              selectedDate={selectedDate}
              selectedPeriod={selectedPeriod}
              voiceNoteBlob={voiceNoteBlob}
              voiceNoteUrl={voiceNoteUrl}
          />
        </div>
      </div>
  );
}