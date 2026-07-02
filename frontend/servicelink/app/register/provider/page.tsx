"use client";

import  { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import KycPage from "@/components/kyc/KycPage";
import WelcomeStep from "@/components/kyc/WelcomeStep";

const DRAFT_STORAGE_KEY = "kyc_draft";

export default function ProviderRegisterPage() {
    // null = अझै check गरिरहेको (hydration मिसम्याच नहोस् भनेर)
    // true = splash देखाउने, false = सीधै KycPage मा जाने
    const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

    useEffect(() => {
        // यदि user पहिले नै बीचमा draft छोडेर गएको हो भने, फेरि
        // splash देखाउनु आवश्यक छैन — सीधै form मा फर्काइदिने
        const hasExistingDraft =
            typeof window !== "undefined" && !!localStorage.getItem(DRAFT_STORAGE_KEY);

        setShowWelcome(!hasExistingDraft);
    }, []);

    // Hydration flash रोक्न — निर्णय नभएसम्म केही नदेखाउने
    if (showWelcome === null) {
        return (
            <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#e8683f] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (showWelcome) {
        return <WelcomeStep onStart={() => setShowWelcome(false)} />;
    }

    return (
        <Provider store={store}>
            <KycPage />
        </Provider>
    );
}