"use client";

import { Zap, Calendar, MapPin, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

interface QuickAction {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  href: string;
}

export default function QuickActions() {
  const { t } = useTranslation();

  const displayActions: QuickAction[] = [
    {
      id: "1",
      titleKey: "dashboard.bookService",
      descKey: "dashboard.bookServiceDesc",
      icon: <Zap className="w-5 h-5" />,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/dashboard/user/explore",
    },
    {
      id: "2",
      titleKey: "dashboard.myBookings",
      descKey: "dashboard.myBookingsDesc",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/dashboard/user/bookings",
    },
    {
      id: "3",
      titleKey: "dashboard.findMap",
      descKey: "dashboard.findMapDesc",
      icon: <MapPin className="w-5 h-5" />,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/dashboard/user/map",
    },
    {
      id: "4",
      titleKey: "navigation.settings",
      descKey: "settings.securityDesc",
      icon: <Settings className="w-5 h-5" />,
      color: "text-[#e8683f]",
      bg: "bg-[#e8683f]/10",
      href: "/dashboard/user/settings",
    },
  ];

  return (
      <section className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">
          {t("dashboard.quickActions")}
        </h2>

        {/* 2 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {displayActions.map((action) => (
              <Link
                  key={action.id}
                  href={action.href}
                  className="
              group text-left bg-surface
              border border-border
              rounded-2xl p-4 sm:p-5
              shadow-sm hover:shadow-md
              transition-all duration-200
              cursor-pointer block
            "
              >
                <div
                    className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-xl
                flex items-center justify-center
                mb-3 sm:mb-4
                ${action.bg}
              `}
                >
                  <span className={action.color}>{action.icon}</span>
                </div>

                <h3 className="font-semibold text-text-primary text-sm sm:text-base mb-1">
                  {t(action.titleKey)}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary">{t(action.descKey)}</p>
              </Link>
          ))}
        </div>
      </section>
  );
}