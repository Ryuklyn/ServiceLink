import BookingAlert from "@/components/dashboard/user/BookingAlert";
import UpcomingBooking from "@/components/dashboard/user/UpcomingBooking";
import QuickActions from "@/components/dashboard/user/QuickActions";
import CategoriesSection from "@/components/dashboard/user/CategoriesSection";
import ProvidersSection from "@/components/dashboard/user/ProvidersSection";
import BookAgainSection from "@/components/dashboard/user/BookAgainSection";
import StatsSection from "@/components/dashboard/user/StatsSection";

export default function DashboardPage() {
  return (
    <>
      <BookingAlert />
      <UpcomingBooking />
      <QuickActions />
      <BookAgainSection />
      <CategoriesSection />
      <ProvidersSection />
      <StatsSection />
    </>
  );
}
