"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/user/UserSidebar";
import SearchBar from "@/components/dashboard/user/SearchBar";
import OnboardingGate from "@/components/dashboard/user/onboarding/OnboardingGate";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function UserDashboardLayout({
                                              children,
                                            }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    // Token check मात्र - user fetch Redux ले गर्छ (Sidebar/SearchBar मा)
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  if (!hasMounted) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-[#e8683f] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
    );
  }

  return (
      <Provider store={store}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <SearchBar />
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </div>
          </div>
        </div>
          <OnboardingGate />
      </Provider>
  );
}