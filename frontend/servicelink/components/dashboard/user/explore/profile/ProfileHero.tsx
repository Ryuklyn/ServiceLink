"use client";

import { Star, ShieldCheck, Briefcase, Clock3, Zap } from "lucide-react";
import { ProviderData } from "./types";

interface ProfileHeroProps {
  provider: ProviderData;
}

const renderStars = (r: number) =>
  Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < Math.floor(r)
          ? "fill-[#e8683f] text-[#e8683f]"
          : i < r
            ? "fill-[#e8683f]/50 text-[#e8683f]/50"
            : "fill-white/30 text-white/30"
      }`}
    />
  ));

export default function ProfileHero({ provider }: ProfileHeroProps) {
  return (
    <div
      className="rounded-2xl p-8 text-white"
      style={{ backgroundColor: "#1e3a8a" }}
    >
      {/* Top row: avatar + info */}
      <div className="flex items-start gap-6 mb-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/20"
            style={{ backgroundColor: "#2a4a9a" }}
          >
            {provider.initials}
          </div>
          {provider.available && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
          )}
          {provider.verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <ShieldCheck className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Name + specialty + badges */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight mb-1">
            {provider.name}
          </h1>
          <p className="text-[#e8683f] font-semibold text-base mb-2">
            {provider.specialty}
          </p>
          {provider.verified && (
            <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 text-green-300 text-sm font-medium px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
              Verified
            </span>
          )}
          {/* Stars */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">{renderStars(provider.rating)}</div>
            <span className="font-bold text-base">{provider.rating}</span>
            <span className="text-white/60 text-sm">
              ({provider.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {/* <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          {
            icon: "💼",
            value: `${provider.jobsCompleted} Jobs`,
            label: "Completed",
          },
          {
            icon: "⏱",
            value: `${provider.experience} Years Exp.`,
            label: "Experience",
          },
          { icon: "⚡", value: provider.eta, label: "Response Time" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10"
          >
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <p className="font-bold text-sm">{stat.value}</p>
          </div>
        ))}
      </div> */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          {
            icon: Briefcase,
            value: `${provider.jobsCompleted} Jobs`,
            label: "Completed",
          },
          {
            icon: Clock3,
            value: `${provider.experience} Years Exp.`,
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
