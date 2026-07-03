"use client";

import { Star, ShieldCheck, Briefcase, Clock3, Zap, MapPin } from "lucide-react";
import { ProviderData } from "./types";

interface ProfileHeroProps {
  provider: ProviderData;
}

const renderStars = (r: number) =>
    Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                i < Math.floor(r)
                    ? "fill-[#e8683f] text-[#e8683f]"
                    : i < r
                        ? "fill-[#e8683f]/50 text-[#e8683f]/50"
                        : "fill-none text-white/40"
            }`}
        />
    ));

export default function ProfileHero({ provider }: ProfileHeroProps) {
  return (
      <div
          className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white w-full max-w-4xl"
          style={{ backgroundColor: "#1e3a8a" }}
      >
        {/* Top Container: Adapts dynamically from top-stacked list to inline flex container */}
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 sm:gap-6 mb-6 md:mb-8">

          {/* Profile Avatar Frame with absolute online status bubbles */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20">
              {provider.avatarUrl ? (
                  <img
                      src={provider.avatarUrl}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                  />
              ) : (
                  <div className="w-full h-full bg-slate-400 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white">
                    {provider.initials}
                  </div>
              )}
            </div>
            {provider.available && (
                <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 border-2 sm:border-4 border-[#1e3a8a] rounded-full shadow-sm" />
            )}
          </div>

          {/* Text Container Meta Information */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words max-w-full">
                {provider.name}
              </h1>
              {provider.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 fill-[#10b981]/10" strokeWidth={2.5} />
                Verified
              </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-2 text-xs sm:text-sm text-white/80 mb-3">
            <span className="text-[#e8683f] font-bold text-base sm:text-lg">
              {provider.specialty}
            </span>
              <span className="hidden md:inline text-white/40">|</span>
              <span className="inline-flex items-center gap-1 text-white/70">
              <MapPin className="w-3.5 h-3.5 text-white/50 shrink-0" />
              <span className="truncate max-w-[240px] sm:max-w-none">
                {provider.location || "Koteshwor-3, Kathmandu"}
              </span>
            </span>
            </div>

            {/* Active Skills/Categories Tags Layout Wrapper */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-4">
              {(
                  provider.categories || [
                    "Carpenter",
                    "Painter",
                    "Electrical Helper",
                  ]
              ).map((cat, idx) => (
                  <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30 whitespace-nowrap"
                  >
                <svg
                    className="w-3 h-3 text-[#10b981] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                    {cat}
              </span>
              ))}
            </div>

            {/* Stars Ratings Split Line */}
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="flex gap-0.5">{renderStars(provider.rating)}</div>
              <span className="font-bold text-lg sm:text-xl ml-1">{provider.rating}</span>
              <span className="text-white/60 text-xs sm:text-sm">
              ({provider.reviews} reviews)
            </span>
            </div>
          </div>
        </div>

        {/* Structured Dashboard Grid Data Split Rows */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          {[
            {
              icon: Briefcase,
              value: `${provider.jobsCompleted} Jobs`,
              label: "Completed",
            },
            {
              icon: Clock3,
              value: `${provider.experience} Yrs Exp`,
              label: "Experience",
            },
            {
              icon: Zap,
              value: provider.eta,
              label: "Response Time",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
                <div
                    key={stat.label}
                    className="bg-white/10 rounded-xl p-2 sm:p-3 text-center border border-white/10 flex flex-col justify-between"
                >
                  <div className="flex justify-center mb-1">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                  </div>
                  <p className="font-bold text-[11px] sm:text-sm text-white leading-tight mb-0.5">{stat.value}</p>
                  <p className="text-[9px] sm:text-xs text-white/60 tracking-normal hidden xs:block">{stat.label}</p>
                </div>
            );
          })}
        </div>

        <p className="text-white/50 text-[11px] sm:text-sm text-center md:text-left">
          On ServiceLink since {provider.memberSince}
        </p>
      </div>
  );
}