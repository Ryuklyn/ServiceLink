"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openOnboarding, markOnboardingSeen } from "@/store/slices/onboardingSlice";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingGate() {
    const dispatch = useAppDispatch();
    const { data: user } = useAppSelector((state) => state.user);
    const { hasSeenOnboarding } = useAppSelector((state) => state.onboarding);

    useEffect(() => {
        if (!user) return; // still fetching

        // Backend flag is source of truth (add `hasSeenOnboarding` to your user model/API response)
        if (user.hasSeenOnboarding) {
            dispatch(markOnboardingSeen());
            return;
        }

        if (!hasSeenOnboarding) {
            dispatch(openOnboarding());
        }
    }, [user, hasSeenOnboarding, dispatch]);

    return <OnboardingModal />;
}