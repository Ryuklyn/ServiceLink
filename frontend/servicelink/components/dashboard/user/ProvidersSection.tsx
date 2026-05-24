"use client";

import { StarIcon, MessageCircle, Check } from "lucide-react";
import Image from "next/image";

interface Provider {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: number;
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
      reviews: 1.2,
      distance: 1.2,
      price: 800,
      verified: true,
      bgColor: "bg-blue-900",
    },
    {
      id: "2",
      initials: "SC",
      name: "Sita Cleaning Services",
      specialty: "Professional Cleaner",
      rating: 4.9,
      reviews: 2.5,
      distance: 2.5,
      price: 1500,
      verified: true,
      bgColor: "bg-blue-700",
    },
    {
      id: "3",
      initials: "HP",
      name: "Hari Plumbing Works",
      specialty: "Expert Plumber",
      rating: 4.7,
      reviews: 3.1,
      distance: 3.1,
      price: 1000,
      verified: true,
      bgColor: "bg-blue-800",
    },
    {
      id: "4",
      initials: "SA",
      name: "Suresh AC Services",
      specialty: "AC Technician",
      rating: 4.6,
      reviews: 4.2,
      distance: 4.2,
      price: 1200,
      verified: true,
      bgColor: "bg-blue-900",
    },
  ];

  const displayProviders = providers || defaultProviders;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Verified Providers Near You
        </h2>
        <a
          href="#"
          className="text-[#1e3a8a] font-semibold text-sm hover:underline"
        >
          View All
        </a>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {displayProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Provider Avatar */}
            <div className="p-6">
              <div
                className={`${provider.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-lg font-bold`}
              >
                {provider.initials}
              </div>
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {provider.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {provider.specialty}
                </p>
                {provider.verified && (
                  <div className="inline-flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Rating and Distance */}
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 fill-[#e8683f] text-[#e8683f]" />
                  <span className="font-semibold text-gray-900">
                    {provider.rating}
                  </span>
                  <span className="text-gray-600">
                    · {provider.reviews} km away
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-sm font-semibold text-gray-900 mb-4">
                From Rs. {provider.price}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-[#e8683f] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#d75930] transition-colors">
                  Book Now
                </button>
                <button className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
