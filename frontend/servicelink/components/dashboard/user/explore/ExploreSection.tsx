"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Star, MapPin, Clock, ShieldCheck, Briefcase,
} from "lucide-react";
import FilterBar from "./FilterBar";
import Link from "next/link";
import api from "@/utils/axios";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

interface Provider {
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
  price: number;
  verified: boolean;
  available: boolean;
  areas: string[];
  bgColor: string;
  avatarUrl: string | null;
  phone: string; // ← Added phone property
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function mapCategory(primaryService: string): string {
  const map: Record<string, string> = {
    ELECTRICIAN: "Electrician",
    PLUMBER: "Plumbing",
    PAINTER: "Painting",
    CLEANER: "Cleaning",
    CARPENTER: "Carpentry",
    AC_REPAIR: "AC Repair",
  };
  return map[primaryService] ?? primaryService;
}

function mapBackendToProvider(data: any): Provider {
  return {
    id: String(data.id),
    initials: getInitials(data.fullName ?? ""),
    name: data.businessName ?? data.fullName,
    specialty: mapCategory(data.primaryService),
    category: mapCategory(data.primaryService),
    rating: data.averageRating ?? 5.0,
    reviews: data.totalReviews ?? 0,
    experience: data.experienceYears ?? 0,
    distance: 5,
    eta: "Within 1 hour",
    price: data.services?.[0]?.customPrice ?? 0,
    verified: data.isVerified ?? false,
    available: data.isOnline ?? false,
    areas: data.coveredDistricts
        ? data.coveredDistricts.split(",").map((d: string) => d.trim())
        : [data.baseDistrict ?? "Kathmandu"],
    bgColor: "#1e3a8a",
    avatarUrl: data.profilePictureUrl?.trim() ? data.profilePictureUrl : null,
    phone: data.phone ?? "", // ← Mapped backend phone field
  };
}

const renderStars = (r: number) =>
    Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            className={`w-3.5 h-3.5 ${
                i < Math.floor(r)
                    ? "fill-[#e8683f] text-[#e8683f]"
                    : i < r
                        ? "fill-[#e8683f]/50 text-[#e8683f]/50"
                        : "fill-gray-200 text-gray-200"
            }`}
        />
    ));

/**
 * Provider avatar with graceful fallback.
 * Renders the real profile photo when available; if the URL is missing
 * OR the image fails to load (e.g. deleted from Supabase, broken link),
 * falls back to the initials circle instead of a broken-image icon.
 */
function ProviderAvatar({ provider }: { provider: Provider }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = provider.avatarUrl && !imgFailed;

  return (
      <>
        {showImage && (
            <img
                src={provider.avatarUrl!}
                alt={provider.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                onError={() => setImgFailed(true)}
            />
        )}
        {!showImage && (
            <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold"
                style={{ backgroundColor: provider.bgColor }}
            >
              {provider.initials}
            </div>
        )}
      </>
  );
}

export default function ExploreSection() {
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("All Categories");
  const [distance, setDistance] = useState("Any Distance");
  const [rating, setRating] = useState("Any Rating");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("Relevance");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/providers");
        const mapped = res.data.content.map(mapBackendToProvider);
        setAllProviders(mapped);
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setError("Failed to load providers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const filtered = useMemo(() => {
    let list = [...allProviders];
    if (category !== "All Categories")
      list = list.filter((p) => p.category === category);
    if (distance !== "Any Distance") {
      const km = parseInt(distance);
      list = list.filter((p) => p.distance <= km);
    }
    if (rating !== "Any Rating") {
      const min = parseFloat(rating);
      list = list.filter((p) => p.rating >= min);
    }
    if (verifiedOnly) list = list.filter((p) => p.verified);
    if (availableOnly) list = list.filter((p) => p.available);
    if (sort === "Rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "Distance") list.sort((a, b) => a.distance - b.distance);
    else if (sort === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    return list;
  }, [allProviders, category, distance, rating, verifiedOnly, availableOnly, sort]);

  const hasFilters =
      category !== "All Categories" ||
      distance !== "Any Distance" ||
      rating !== "Any Rating" ||
      verifiedOnly ||
      availableOnly;

  const clearAll = () => {
    setCategory("All Categories");
    setDistance("Any Distance");
    setRating("Any Rating");
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSort("Relevance");
  };

  if (loading) {
    return (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Loading providers...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
    );
  }

  return (
      <div className="w-full px-4 sm:px-6 md:px-0">
        <FilterBar
            category={category}
            setCategory={setCategory}
            distance={distance}
            setDistance={setDistance}
            rating={rating}
            setRating={setRating}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            sort={sort}
            setSort={setSort}
            resultCount={filtered.length}
            hasFilters={hasFilters}
            onClearAll={clearAll}
        />

        {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No providers found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
        ) : (
            /* Responsive Grid setup */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((provider) => (
                  <div
                      key={provider.id}
                      className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4"
                  >
                    {/* Top Section */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        <ProviderAvatar provider={provider} />
                        {provider.available && (
                            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                        )}
                        {provider.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <ShieldCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-1.5 break-words">
                          {provider.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                        <span className="bg-blue-50 text-blue-600 text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
                          {provider.specialty}
                        </span>
                          {provider.verified && (
                              <span className="bg-green-50 text-green-600 text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                                Verified
                              </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Stats */}
                    <div>
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <div className="flex gap-0.5">{renderStars(provider.rating)}</div>
                        <span className="text-sm font-semibold text-gray-800">{provider.rating}</span>
                        <span className="text-xs text-gray-400">({provider.reviews} reviews)</span>
                      </div>

                      {/* Flex layout that wraps intelligently on narrow mobile screens */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          {provider.experience} years
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {provider.distance} km away
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {provider.eta}
                        </span>
                      </div>
                    </div>

                    {/* Area Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {provider.areas.map((area) => (
                          <span key={area} className="bg-gray-100 text-gray-500 text-[11px] sm:text-xs px-2 py-0.5 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>

                    {/* Pricing */}
                    <p className="text-[#1e3a8a] font-bold text-base mt-auto">
                      From Rs. {provider.price}
                    </p>

                    {/* Call to Action Actions Layout */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-1">
                      <Link
                          href={`/dashboard/user/explore/profile?id=${provider.id}`}
                          className="flex-1 sm:flex-none text-center border border-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors white-space-nowrap"
                      >
                        Profile
                      </Link>

                      <button className="flex-1 bg-[#e8683f] hover:bg-[#d75930] text-white py-2 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors">
                        Book Now
                      </button>

                      {/* Reusable WhatsApp Button Integration */}
                      <WhatsAppButton
                          phone={provider.phone}
                          message={`Hi ${provider.name}, I found your profile on ServiceLink and I'm interested in your ${provider.specialty.toLowerCase()} services.`}
                      />
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}