"use client";

import { Star, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface BookAgainProvider {
  id: string;
  initials: string;
  name: string;
  service: string;
  date: string;
  rating: number;
  bgColor: string;
}

interface BookAgainSectionProps {
  providers?: BookAgainProvider[];
}

export default function BookAgainSection({ providers }: BookAgainSectionProps) {
  const { t } = useTranslation();

  const defaultProviders: BookAgainProvider[] = [
    {
      id: "1",
      initials: "CA",
      name: "CoolBreeze AC Service",
      service: "AC Service",
      date: "May 18, 2026",
      rating: 4.5,
      bgColor: "bg-primary",
    },
    {
      id: "2",
      initials: "SP",
      name: "Sita Plumbing Solutions",
      service: "Pipe Repair",
      date: "May 10, 2026",
      rating: 4.6,
      bgColor: "bg-primary",
    },
  ];

  const displayProviders = providers || defaultProviders;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            className={`w-4 h-4 ${
                i < Math.floor(rating)
                    ? "fill-primary text-primary"
                    : i < rating
                        ? "fill-primary/50 text-primary/50"
                        : "fill-border text-border"
            }`}
        />
    ));
  };

  return (
      <section className="mb-8 sm:mb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5 text-text-primary">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{t("dashboard.bookAgain")}</h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              {t("dashboard.recentBookings")}
            </p>
          </div>
          <button className="flex items-center gap-1 text-primary text-xs sm:text-sm font-semibold hover:underline shrink-0 mt-1">
            {t("dashboard.seeAll")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards — horizontal scroll on mobile instead of squeezing */}
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {displayProviders.map((provider) => (
              <div
                  key={provider.id}
                  className="bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden shrink-0 w-[240px] sm:w-[260px]"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div
                        className={`${provider.bgColor} text-primary-foreground w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0`}
                    >
                      {provider.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-text-primary text-sm leading-tight truncate">
                        {t(provider.name)}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {t(provider.service)}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {t(provider.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4 sm:mb-5">
                    <div className="flex items-center gap-0.5">
                       {renderStars(provider.rating)}
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                  {provider.rating}
                </span>
                  </div>

                  <button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground py-2.5 rounded-xl font-bold text-sm transition-colors">
                    {t("dashboard.bookAgain")}
                  </button>
                </div>
              </div>
          ))}
        </div>

        <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </section>
  );
}