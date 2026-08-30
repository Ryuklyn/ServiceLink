"use client";

import { useTranslation } from "@/hooks/useTranslation";

interface UpcomingBookingProps {
  title?: string;
  time?: string;
  location?: string;
  rescheduleInfo?: string;
}

export default function UpcomingBooking({
                                           title = "Tomorrow: Regular Cleaning",
                                           time = "10:00 AM",
                                           location = "New Baneshwor, Kathmandu",
                                           rescheduleInfo = "Free reschedule available — more than 24 hours away",
                                         }: UpcomingBookingProps) {
  const { t } = useTranslation();

  return (
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-r from-surface to-surface-secondary px-5 sm:px-8 py-5 sm:py-6 shadow-sm">
        {/* Left Content */}
        <div className="flex flex-col min-w-0 text-text-primary">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-primary">{t(title)}</h3>
            <span className="text-primary hidden sm:inline">•</span>
            <p className="text-sm font-medium text-text-primary">{t(time)}</p>
            <span className="text-primary hidden sm:inline">•</span>
            <p className="text-sm font-medium text-text-primary">{t(location)}</p>
          </div>

          {/* Reschedule Info */}
          <p className="mt-2 text-sm text-green-600">{t(rescheduleInfo)}</p>
        </div>

        {/* Button — full width on mobile */}
        <button className="w-full sm:w-auto shrink-0 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
          {t("dashboard.manageBooking")}
        </button>
      </div>
  );
}