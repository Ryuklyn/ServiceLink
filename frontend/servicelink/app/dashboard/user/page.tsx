"use client";

import { useEffect, useState } from "react";
import { appointmentService, AppointmentSummary } from "@/services/appointmentService";
import BookingAlert from "@/components/dashboard/user/BookingAlert";
import UpcomingBooking from "@/components/dashboard/user/UpcomingBooking";
import QuickActions from "@/components/dashboard/user/QuickActions";
import CategoriesSection from "@/components/dashboard/user/CategoriesSection";
import ProvidersSection from "@/components/dashboard/user/ProvidersSection";
import BookAgainSection from "@/components/dashboard/user/BookAgainSection";
import StatsSection from "@/components/dashboard/user/StatsSection";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getMyAppointments(undefined, 0, 50)
      .then((res) => {
        setAppointments(res.content || []);
      })
      .catch((err) => {
        console.error("Error loading user dashboard appointments:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  // Find active booking in "IN_PROGRESS" state (representing On The Way)
  const activeBooking = appointments.find((a) => a.status === "IN_PROGRESS");

  // Find upcoming booking in "PENDING" or "CONFIRMED" state
  const upcomingBooking = appointments.find(
    (a) => a.status === "PENDING" || a.status === "CONFIRMED"
  );

  // Map completed bookings for BookAgainSection
  const completedBookings = appointments.filter((a) => a.status === "COMPLETED");
  const uniqueCompleted = completedBookings.reduce((acc, curr) => {
    if (!acc.find((p) => p.providerId === curr.providerId)) {
      acc.push(curr);
    }
    return acc;
  }, [] as AppointmentSummary[]);

  const bookAgainList = uniqueCompleted.slice(0, 4).map((b) => ({
    id: String(b.providerId),
    initials: getInitials(b.providerName || ""),
    name: b.providerName,
    service: b.subServiceName,
    date: new Date(b.appointmentDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    rating: 4.8,
    bgColor: "bg-primary",
  }));

  return (
    <>
      {activeBooking && (
        <BookingAlert
          bookingId={activeBooking.id}
          providerName={activeBooking.providerName}
          service={activeBooking.subServiceName}
          providerPhone={activeBooking.providerPhone}
        />
      )}

      {upcomingBooking && (
        <UpcomingBooking
          title={upcomingBooking.subServiceName}
          time={`${new Date(upcomingBooking.appointmentDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })} - ${upcomingBooking.timeSlot}`}
          location={upcomingBooking.address}
        />
      )}

      <QuickActions />

      {bookAgainList.length > 0 && <BookAgainSection providers={bookAgainList} />}

      <CategoriesSection />

      <ProvidersSection />

      <StatsSection />
    </>
  );
}
