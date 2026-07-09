// "use client";
//
// import { useState } from "react";
// import Sidebar from "../../../components/dashboard/provider/Sidebar";
// import Navbar from "../../../components/dashboard/provider/Navbar";
//
// export default function ProviderDashboardLayout({
//                                                     children,
//                                                 }: {
//     children: React.ReactNode;
// }) {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//
//     return (
//         <div className="flex h-screen w-full overflow-hidden bg-[#F7F8FA]">
//             {/*
//         Pass down the open state and a toggle function.
//         onNavigate serves as the close button, backdrop click, and routing dismiss callback.
//       */}
//             <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
//
//             <div className="flex flex-col flex-1 overflow-hidden">
//                 {/* The hamburger icon on the navbar will change this state to true */}
//                 <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
//
//                 {/* Adjusted padding slightly on smaller mobile screens (p-4 to p-6) */}
//                 <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
//             </div>
//         </div>
//     );
// }


"use client";

import {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../../components/dashboard/provider/Sidebar";
import Navbar from "../../../components/dashboard/provider/Navbar";
import OnboardingWizard from "../../../components/dashboard/provider/onboarding/OnboardingWizard";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import type { RootState, AppDispatch } from "@/store"; // adjust to your actual store types
import { fetchProviderSubscription } from "@/store/slices/providerSubscriptionSlice";

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { data: profile, loading } = useSelector((s: RootState) => s.providerProfile);

    const { data: subscription } = useSelector((s: RootState) => s.providerSubscription);

    useEffect(() => {
        if (!profile) dispatch(fetchProviderProfile());
    }, [profile, dispatch]);

    useEffect(() => {
        if (!subscription) dispatch(fetchProviderSubscription());
    }, [subscription, dispatch]);

    // useEffect(() => {
    //     if (!profile) dispatch(fetchProviderProfile());
    // }, [profile, dispatch]);

    // Don't decide anything until we actually know the real value —
    // prevents a flash of the wizard for returning providers.
    const showWizard = !loading && profile && !profile.hasCompletedOnboarding;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#F7F8FA]">
            <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
            {showWizard && (
                <OnboardingWizard
                    category={profile.primaryService ?? ""}
                    onComplete={() => dispatch(fetchProviderProfile())}
                />
            )}
        </div>
    );
}