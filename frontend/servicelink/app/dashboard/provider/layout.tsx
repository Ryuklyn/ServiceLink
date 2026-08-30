"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../../components/dashboard/provider/Sidebar";
import Navbar from "../../../components/dashboard/provider/Navbar";
import OnboardingWizard from "../../../components/dashboard/provider/onboarding/OnboardingWizard";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import type { RootState, AppDispatch } from "@/store";
import { fetchProviderSubscription } from "@/store/slices/providerSubscriptionSlice";
import { initProviderPreferences } from "@/store/slices/providerPreferencesSlice";

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { data: profile, loading } = useSelector((s: RootState) => s.providerProfile);
    const { data: subscription } = useSelector((s: RootState) => s.providerSubscription);
    const { theme } = useSelector((s: RootState) => s.providerPreferences);
    const [themeClass, setThemeClass] = useState("provider-dashboard-system");

    useEffect(() => {
        const storedTheme = localStorage.getItem("providerTheme") as "system" | "light" | "dark" | null;
        const storedLang = localStorage.getItem("providerLanguage") as "en" | "ne" | null;
        dispatch(initProviderPreferences({
            theme: storedTheme || "system",
            language: storedLang || "en"
        }));
    }, [dispatch]);

    useEffect(() => {
        if (theme === "system") {
            setThemeClass("provider-dashboard-system");
        } else if (theme === "dark") {
            setThemeClass("provider-dashboard-dark dark");
        } else {
            setThemeClass("provider-dashboard-light");
        }
    }, [theme]);

    useEffect(() => {
        if (!profile) dispatch(fetchProviderProfile());
    }, [profile, dispatch]);

    useEffect(() => {
        if (!subscription) dispatch(fetchProviderSubscription());
    }, [subscription, dispatch]);

    const showWizard = !loading && profile && !profile.hasCompletedOnboarding;

    return (
        <div className={`flex h-screen w-full overflow-hidden ${themeClass}`}>
            <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
            {showWizard && (
                <OnboardingWizard
                    categories={profile.primaryCategoryId
                        ? [{ id: profile.primaryCategoryId, name: profile.primaryCategoryName ?? "" }]
                        : []}
                    onComplete={() => dispatch(fetchProviderProfile())}
                />
            )}
        </div>
    );
}
