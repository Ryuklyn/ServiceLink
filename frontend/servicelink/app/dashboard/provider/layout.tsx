"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../../components/dashboard/provider/Sidebar";
import Navbar from "../../../components/dashboard/provider/Navbar";
import OnboardingWizard from "../../../components/dashboard/provider/onboarding/OnboardingWizard";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import type { RootState, AppDispatch } from "@/store";
import { fetchProviderSubscription } from "@/store/slices/providerSubscriptionSlice";
import { fetchNotifications, fetchUnreadCount } from "@/store/slices/notificationSlice";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { initProviderPreferences } from "@/store/slices/providerPreferencesSlice";

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { data: profile, loading } = useSelector((s: RootState) => s.providerProfile);
    const { data: subscription } = useSelector((s: RootState) => s.providerSubscription);
    const { theme } = useSelector((s: RootState) => s.providerPreferences);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem("providerTheme") as "system" | "light" | "dark" | null;
        const storedLang = localStorage.getItem("providerLanguage") as "en" | "ne" | null;
        dispatch(initProviderPreferences({
            theme: storedTheme || "system",
            language: storedLang || "en"
        }));
    }, [dispatch]);

    useEffect(() => {
        const determineDark = () => {
            if (theme === "dark") return true;
            if (theme === "system") {
                return window.matchMedia("(prefers-color-scheme: dark)").matches;
            }
            return false;
        };
        setIsDark(determineDark());

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
            if (theme === "system") {
                setIsDark(mediaQuery.matches);
            }
        };
        mediaQuery.addEventListener("change", handleSystemThemeChange);
        return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }, [theme]);

    useEffect(() => {
        if (!profile) dispatch(fetchProviderProfile());
    }, [profile, dispatch]);

    useEffect(() => {
        if (!subscription) dispatch(fetchProviderSubscription());
    }, [subscription, dispatch]);

    // ⚠️ Adjust field name if needed (profile.userId vs profile.user.id)
    const recipientId = profile?.userId;
    const role = "PROVIDER";

    useNotificationSocket(recipientId, role);

    useEffect(() => {
        if (recipientId) {
            dispatch(fetchUnreadCount({ recipientId, role }));
            dispatch(fetchNotifications({ recipientId, role, page: 0, size: 10 }));
        }
    }, [recipientId, dispatch]);

    const showWizard = !loading && profile && !profile.hasCompletedOnboarding;

    return (
        <div className={`flex h-screen w-full overflow-hidden ${isDark ? "provider-dashboard-dark dark" : "provider-dashboard-light bg-background"}`}>
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