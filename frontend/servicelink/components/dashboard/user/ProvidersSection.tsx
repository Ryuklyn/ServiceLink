"use client";

import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

interface Provider {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: number;
  eta: string;
  price: number;
  verified: boolean;
  bgColor: string;
}

interface ProvidersSectionProps {
  providers?: Provider[];
}

export default function ProvidersSection({ providers }: ProvidersSectionProps) {
  const defaultProviders: Provider[] = [
    {
      id: "1",
      initials: "RE",
      name: "Ram Electrical Services",
      specialty: "Certified Electrician",
      rating: 4.8,
      reviews: 124,
      distance: 0,
      eta: "Within 1 hour",
      price: 800,
      verified: true,
      bgColor: "bg-[#1e3a8a]",
    },
    {
      id: "2",
      initials: "AP",
      name: "AquaFix Plumbing",
      specialty: "Master Plumber",
      rating: 4.7,
      reviews: 98,
      distance: 2,
      eta: "Within 2 hours",
      price: 600,
      verified: true,
      bgColor: "bg-[#1e3a8a]",
    },
    {
      id: "3",
      initials: "CS",
      name: "CleanNest Services",
      specialty: "Professional Cleaner",
      rating: 4.9,
      reviews: 156,
      distance: 1.8,
      eta: "Within 30 min",
      price: 1200,
      verified: true,
      bgColor: "bg-[#1e3a8a]",
    },
    {
      id: "4",
      initials: "CP",
      name: "ColorCraft Painting",
      specialty: "Interior & Exterior Painter",
      rating: 4.6,
      reviews: 67,
      distance: 11.5,
      eta: "Within 3 hours",
      price: 2500,
      verified: true,
      bgColor: "bg-[#1e3a8a]",
    },
  ];

  const displayProviders = providers || defaultProviders;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < Math.floor(rating)
            ? "fill-[#e8683f] text-[#e8683f]"
            : i < rating
              ? "fill-[#e8683f]/50 text-[#e8683f]/50"
              : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Verified Providers Near You
        </h2>
        <button className="flex items-center gap-1 text-[#e8683f] text-sm font-semibold hover:underline">
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        {displayProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4"
          >
            {/* Top: avatar + name + specialty + verified */}
            <div className="flex items-start gap-3">
              {/* Avatar with verified badge */}
              <div className="relative shrink-0">
                <div
                  className={`${provider.bgColor} w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold`}
                >
                  {provider.initials}
                </div>
                {provider.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <ShieldCheck
                      className="w-3 h-3 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                )}
              </div>

              {/* Name + specialty pill + verified pill */}
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1.5">
                  {provider.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {provider.specialty}
                  </span>
                  {provider.verified && (
                    <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stars + review count */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-0.5">
                  {renderStars(provider.rating)}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {provider.rating}
                </span>
                <span className="text-xs text-gray-400">
                  ({provider.reviews})
                </span>
              </div>

              {/* Distance + ETA */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {provider.distance} km away
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {provider.eta}
                </span>
              </div>
            </div>

            {/* Price */}
            <p className="text-[#1e3a8a] font-bold text-base">
              From Rs. {provider.price}
            </p>

            {/* Buttons */}
            <div className="flex gap-2 mt-auto">
              <button className="flex-1 bg-[#e8683f] hover:bg-[#d75930] text-white py-2 rounded-xl font-semibold text-sm transition-colors">
                Book Now
              </button>
              <button className="flex-none bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
