"use client";

import { Star, ShieldCheck } from "lucide-react";
import { ProviderData } from "./types";

interface ProfileHeroProps {
  provider: ProviderData;
}

const renderStars = (r: number) =>
  Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${
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
      className="rounded-3xl p-8 text-white max-w-4xl"
      style={{ backgroundColor: "#1e3a8a" }}
    >
      {/* Top row: avatar + info */}
      <div className="flex items-center gap-6 mb-8">
        {/* Avatar with simplified Green Dot indicator */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
            {provider.avatarUrl ? (
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-400 flex items-center justify-center text-3xl font-bold text-white">
                {provider.initials}
              </div>
            )}
          </div>
          {provider.available && (
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 border-4 border-[#1e3a8a] rounded-full shadow-sm" />
          )}
        </div>

        {/* Name + specialty + badges + location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {provider.name}
            </h1>
            {provider.verified && (
              <span className="inline-flex items-center gap-1 bg-green-500/20 text-[#10b981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30">
                <ShieldCheck
                  className="w-3.5 h-3.5 fill-[#10b981]/10"
                  strokeWidth={2.5}
                />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-white/80 mb-3 flex-wrap">
            <span className="text-[#e8683f] font-bold text-lg">
              {provider.specialty}
            </span>
            <span className="text-white/40">|</span>
            <span className="inline-flex items-center gap-1 text-white/70">
              <svg
                className="w-4 h-4 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {provider.location || "Koteshwor-3, Kathmandu"}
            </span>
          </div>

          {/* Updated Multi-category fields with bg-green-100 style and circleted checkmarks */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {(
              provider.categories || [
                "Carpenter",
                "Painter",
                "Electrical Helper",
              ]
            ).map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-green-500/20 text-[#10b981] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-500/30"
              >
                {/* SVG Circled Tick Icon */}
                <svg
                  className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0"
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

          {/* Stars & Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">{renderStars(provider.rating)}</div>
            <span className="font-bold text-xl ml-1">{provider.rating}</span>
            <span className="text-white/60 text-sm">
              ({provider.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          {
            icon: require("lucide-react").Briefcase,
            value: `${provider.jobsCompleted} Jobs`,
            label: "Completed",
          },
          {
            icon: require("lucide-react").Clock3,
            value: `${provider.experience} Years Exp.`,
            label: "Experience",
          },
          {
            icon: require("lucide-react").Zap,
            value: provider.eta,
            label: "Response Time",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10"
            >
              <div className="flex justify-center mb-1">
                <Icon className="w-5 h-5 text-white" />
              </div>

              <p className="font-bold text-sm">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <p className="text-white/50 text-sm">
        On ServiceLink since {provider.memberSince}
      </p>
    </div>
  );
}
