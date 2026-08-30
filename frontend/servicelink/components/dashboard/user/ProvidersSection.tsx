"use client";

import { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import api from "@/utils/axios";
import Link from "next/link";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

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
  phone: string;
  avatarUrl: string | null;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function ProviderAvatar({ provider }: { provider: Provider }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = provider.avatarUrl && !imgFailed;

  return (
      <>
        {showImage ? (
            <img
                src={provider.avatarUrl!}
                alt={provider.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0"
                onError={() => setImgFailed(true)}
            />
        ) : (
            <div
                className="bg-primary text-primary-foreground w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shrink-0"
            >
              {provider.initials}
            </div>
        )}
      </>
  );
}

export default function ProvidersSection() {
  const { t } = useTranslation();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data } = await api.get("/providers", { params: { size: 4 } });
        const mapped = (data.content || []).map((p: any) => ({
          id: String(p.id),
          initials: getInitials(p.fullName || ""),
          name: p.businessName || p.fullName,
          specialty: p.primaryCategoryName || "General",
          rating: p.averageRating || 5.0,
          reviews: p.totalReviews || 0,
          distance: 5,
          eta: "Within 1 hour",
          price: p.services?.[0]?.customPrice || 500,
          verified: p.isVerified || false,
          phone: p.phone || "",
          avatarUrl: p.profilePictureUrl?.trim() ? p.profilePictureUrl : null,
        }));
        setProviders(mapped);
      } catch (err) {
        console.error("Error loading featured providers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

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

  if (loading) {
    return <div className="py-8 text-center text-sm text-slate-400">Loading featured providers...</div>;
  }

  if (providers.length === 0) {
    return null;
  }

  return (
      <section className="mb-8 sm:mb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">
            {t("dashboard.verifiedProvidersTitle")}
          </h2>
          <Link href="/dashboard/user/explore" className="flex items-center gap-1 text-primary text-xs sm:text-sm font-semibold hover:underline shrink-0">
            {t("dashboard.seeAll")}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards — 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((provider) => (
              <div
                  key={provider.id}
                  className="bg-surface border border-border rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-border-subtle transition-all duration-200 flex flex-col gap-4"
              >
                {/* Top: avatar + name + specialty + verified */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <ProviderAvatar provider={provider} />
                    {provider.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                          <ShieldCheck
                              className="w-3 h-3 text-white"
                              strokeWidth={2.5}
                          />
                        </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-text-primary text-sm leading-tight mb-1.5 break-words">
                      {provider.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                        {provider.specialty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stars + review count */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(provider.rating)}
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {provider.rating}
                    </span>
                    <span className="text-xs text-text-muted">
                      ({provider.reviews})
                    </span>
                  </div>

                  {/* Distance + ETA — wraps on very small screens */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      {provider.distance} {t("dashboard.kmAway")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {t(provider.eta)}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <p className="text-primary font-bold text-base mt-auto">
                  {t("dashboard.fromRs")} {provider.price}
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <Link
                      href={`/dashboard/user/explore/profile?id=${provider.id}`}
                      className="flex-1 text-center bg-primary hover:bg-primary-hover text-primary-foreground py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center"
                  >
                    {t("dashboard.bookNow")}
                  </Link>

                  <WhatsAppButton
                      phone={provider.phone}
                      message={`Hi ${provider.name}, I found your profile on ServiceLink and I'm interested in your services.`}
                  />
                </div>
              </div>
          ))}
        </div>
      </section>
  );
}