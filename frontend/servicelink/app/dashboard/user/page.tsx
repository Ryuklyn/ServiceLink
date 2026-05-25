// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "@/utils/axios";
// import Sidebar from "@/components/dashboard/user/UserSidebar";
// import SearchBar from "@/components/dashboard/user/SearchBar";
// import BookingAlert from "@/components/dashboard/user/BookingAlert";
// import UpcomingBooking from "@/components/dashboard/user/UpcomingBooking";
// import QuickActions from "@/components/dashboard/user/QuickActions";
// import CategoriesSection from "@/components/dashboard/user/CategoriesSection";
// import ProvidersSection from "@/components/dashboard/user/ProvidersSection";
// import BookAgainSection from "@/components/dashboard/user/BookAgainSection";
// import StatsSection from "@/components/dashboard/user/StatsSection";

// interface UserProfile {
//   fullName: string;
//   email: string;
//   profileImage?: string;
// }

// export default function DashboardPage() {
//   const router = useRouter();
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token =
//           localStorage.getItem("authToken") || localStorage.getItem("token");

//         if (!token) {
//           router.push("/login");
//           return;
//         }

//         const res = await api.get("/auth/me", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setProfile(res.data);
//       } catch (err) {
//         console.error(err);
//         localStorage.removeItem("authToken");
//         localStorage.removeItem("token");
//         router.push("/login");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-[#e8683f] rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return null;
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <Sidebar userProfile={profile} />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Search Bar */}
//         <SearchBar userProfile={profile} />

//         {/* Content Area */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-8 max-w-7xl mx-auto">
//             {/* Booking Alert */}
//             <BookingAlert />

//             {/* Upcoming Booking */}
//             <UpcomingBooking />

//             {/* Quick Actions */}
//             <QuickActions />

//             {/* Categories Section */}
//             <CategoriesSection />

//             {/* Providers Section */}
//             <ProvidersSection />

//             {/* Book Again Section */}
//             <BookAgainSection />

//             {/* Stats Section */}
//             <StatsSection />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
