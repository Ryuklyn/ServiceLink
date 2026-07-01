"use client";

import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
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
      <section className="mb-8 sm:mb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Verified Providers Near You
          </h2>
          <button className="flex items-center gap-1 text-[#e8683f] text-xs sm:text-sm font-semibold hover:underline shrink-0">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards — 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayProviders.map((provider) => (
              <div
                  key={provider.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4"
              >
                {/* Top: avatar + name + specialty + verified */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div
                        className={`${provider.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold`}
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

                  {/* Distance + ETA — wraps on very small screens */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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
                  <button className="flex-none bg-[#25D366] hover:bg-[#1ebe5a] text-white px-3 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12.001 2c-5.514 0-9.988 4.474-9.988 9.988 0 1.762.464 3.484 1.346 5.001L2 22l5.144-1.35a9.96 9.96 0 004.857 1.237h.004c5.514 0 9.988-4.474 9.988-9.988C21.993 6.474 17.519 2 12.001 2zm5.888 15.876a8.284 8.284 0 01-5.888 2.44h-.003a8.297 8.297 0 01-4.229-1.158l-.303-.18-3.053.801.815-2.978-.198-.306a8.27 8.27 0 01-1.269-4.409c0-4.577 3.727-8.303 8.307-8.303a8.257 8.257 0 015.874 2.435 8.258 8.258 0 012.435 5.87c0 4.578-3.727 8.304-8.303 8.304l.006-.006v-.01z" />
                    </svg>
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>
          ))}
        </div>
      </section>
  );
}