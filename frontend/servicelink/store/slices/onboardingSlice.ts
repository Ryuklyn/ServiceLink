import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type OnboardingTier = 1 | 2 | null;
type PendingDestination = "profile" | null;

interface OnboardingState {
    isModalOpen: boolean;
    currentTier: OnboardingTier;
    pendingDestination: PendingDestination;
    hasSeenOnboarding: boolean; // persisted flag - prevents re-showing
}

const initialState: OnboardingState = {
    isModalOpen: false,
    currentTier: null,
    pendingDestination: null,
    hasSeenOnboarding: false,
};

const onboardingSlice = createSlice({
    name: "onboarding",
    initialState,
    reducers: {
        openOnboarding(state) {
            state.isModalOpen = true;
            state.currentTier = 1;
        },
        goToTier2(state, action: PayloadAction<{ destination: PendingDestination }>) {
            state.currentTier = 2;
            state.pendingDestination = action.payload.destination;
        },
        closeOnboarding(state) {
            state.isModalOpen = false;
            state.currentTier = null;
            state.pendingDestination = null;
            state.hasSeenOnboarding = true;
        },
        markOnboardingSeen(state) {
            // Used on initial load if backend/localStorage already confirms it's been seen
            state.hasSeenOnboarding = true;
        },
    },
});

export const { openOnboarding, goToTier2, closeOnboarding, markOnboardingSeen } =
    onboardingSlice.actions;
export default onboardingSlice.reducer;