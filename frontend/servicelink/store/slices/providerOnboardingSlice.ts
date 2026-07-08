import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    onboardingApi,
    OnboardingStatus,
    CatalogItem,
    ProviderServiceSelection,
} from "@/lib/api/onboardingApi";

export type OnboardingStep = "welcome" | "services" | "referral";

const SEEN_WELCOME_KEY = "sl_provider_onboarding_seen_welcome";
const SEEN_REFERRAL_KEY = "sl_provider_onboarding_seen_referral";

interface ProviderOnboardingState {
    isModalOpen: boolean;
    currentStep: OnboardingStep;
    history: OnboardingStep[];
    status: OnboardingStatus | null;
    catalog: CatalogItem[];
    selections: Record<number, ProviderServiceSelection>;
    hasSeenOnboarding: boolean; // persisted flag - true once wizard is fully finished
    loadingStatus: boolean;
    loadingCatalog: boolean;
    savingServices: boolean;
    finishing: boolean;
    error: string | null;
}

const initialState: ProviderOnboardingState = {
    isModalOpen: false,
    currentStep: "welcome",
    history: ["welcome"],
    status: null,
    catalog: [],
    selections: {},
    hasSeenOnboarding: false,
    loadingStatus: false,
    loadingCatalog: false,
    savingServices: false,
    finishing: false,
    error: null,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchOnboardingStatus = createAsyncThunk<
    OnboardingStatus,
    void,
    { rejectValue: string }
>("providerOnboarding/fetchStatus", async (_, { rejectWithValue }) => {
    try {
        return await onboardingApi.getStatus();
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load onboarding status",
        );
    }
});

export const fetchCatalog = createAsyncThunk<
CatalogItem[],
    string,
{ rejectValue: string }
>("providerOnboarding/fetchCatalog", async (category, { rejectWithValue }) => {
    try {
        return await onboardingApi.getCatalog(category);
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Couldn't load services for your category.",
        );
    }
});

export const saveOnboardingServices = createAsyncThunk <
void,
    void,
{ state: { providerOnboarding: ProviderOnboardingState }; rejectValue: string }
>("providerOnboarding/saveServices", async (_, { getState, rejectWithValue }) => {
    const active = Object.values(getState().providerOnboarding.selections).filter(
        (s) => s.isAvailable,
    );
    try {
        await onboardingApi.saveServices(active);
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to save services. Please try again.",
        );
    }
});

export const completeProviderOnboarding = createAsyncThunk <
void,
    void,
{ rejectValue: string }
>("providerOnboarding/complete", async (_, { rejectWithValue }) => {
    try {
        await onboardingApi.completeOnboarding();
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to complete onboarding",
        );
    }
});

// ─── Slice ──────────────────────────────────────────────────────────────────

const providerOnboardingSlice = createSlice({
    name: "providerOnboarding",
    initialState,
    reducers: {
        openOnboarding(state) {
            state.isModalOpen = true;
        },
        goToStep(state, action: PayloadAction<OnboardingStep>) {
            state.currentStep = action.payload;
            state.history.push(action.payload);
        },
        goBack(state) {
            if (state.history.length <= 1) return;
            state.history.pop();
            state.currentStep = state.history[state.history.length - 1];
        },
        setSelections(state, action: PayloadAction<Record<number, ProviderServiceSelection>>) {
            state.selections = action.payload;
        },
        toggleService(state, action: PayloadAction<CatalogItem>) {
            const item = action.payload;
            const current = state.selections[item.id];
            if (current?.isAvailable) {
                state.selections[item.id] = { ...current, isAvailable: false };
            } else {
                state.selections[item.id] = {
                    catalogId: item.id,
                    isAvailable: true,
                    customPrice: current?.customPrice ?? item.basePrice,
                };
            }
        },
        updateServicePrice(state, action: PayloadAction<{ catalogId: number; price: number }>) {
            const current = state.selections[action.payload.catalogId];
            if (!current) return;
            current.customPrice = action.payload.price;
        },
        markWelcomeSeen() {
            if (typeof window !== "undefined") localStorage.setItem(SEEN_WELCOME_KEY, "true");
        },
        markReferralSeen() {
            if (typeof window !== "undefined") localStorage.setItem(SEEN_REFERRAL_KEY, "true");
        },
        // Same idea as your customer slice's `closeOnboarding` — hides the modal
        // and flips the persisted "seen" flag so it doesn't pop again this session.
        closeOnboarding(state) {
            state.isModalOpen = false;
            state.hasSeenOnboarding = true;
        },
        markOnboardingSeen(state) {
            state.hasSeenOnboarding = true;
        },
        // Centralizes the old component-local deriveEntryStep logic: real backend
        // data (hasAtLeastOneService) decides the services gate, localStorage
        // flags decide whether Welcome/Referral have already been shown.
        deriveEntryStep(state) {
            const seenWelcome =
                typeof window !== "undefined" && localStorage.getItem(SEEN_WELCOME_KEY) === "true";
            const seenReferral =
                typeof window !== "undefined" && localStorage.getItem(SEEN_REFERRAL_KEY) === "true";

            let entry: OnboardingStep = "referral";
            if (!seenWelcome) entry = "welcome";
            else if (!state.status?.hasAtLeastOneService) entry = "services";
            else if (!seenReferral) entry = "referral";

            state.currentStep = entry;
            state.history = [entry];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOnboardingStatus.pending, (state) => {
                state.loadingStatus = true;
                state.error = null;
            })
            .addCase(fetchOnboardingStatus.fulfilled, (state, action: PayloadAction<OnboardingStatus>) => {
                state.status = action.payload;
                state.loadingStatus = false;
            })
            .addCase(fetchOnboardingStatus.rejected, (state, action) => {
                state.loadingStatus = false;
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(fetchCatalog.pending, (state) => {
                state.loadingCatalog = true;
                state.error = null;
            })
            .addCase(fetchCatalog.fulfilled, (state, action: PayloadAction<CatalogItem[]>) => {
                state.catalog = action.payload;
                state.loadingCatalog = false;
            })
            .addCase(fetchCatalog.rejected, (state, action) => {
                state.loadingCatalog = false;
                state.error = action.payload ?? "Couldn't load services for your category. Please retry.";
            })
            .addCase(saveOnboardingServices.pending, (state) => {
                state.savingServices = true;
                state.error = null;
            })
            .addCase(saveOnboardingServices.fulfilled, (state) => {
                state.savingServices = false;
            })
            .addCase(saveOnboardingServices.rejected, (state, action) => {
                state.savingServices = false;
                state.error = action.payload ?? "Failed to save services. Please try again.";
            })
            .addCase(completeProviderOnboarding.pending, (state) => {
                state.finishing = true;
                state.error = null;
            })
            .addCase(completeProviderOnboarding.fulfilled, (state) => {
                state.finishing = false;
                state.isModalOpen = false;
                state.hasSeenOnboarding = true;
            })
            .addCase(completeProviderOnboarding.rejected, (state, action) => {
                state.finishing = false;
                state.error = action.payload ?? "Failed to complete onboarding";
                // Server-side rejection (services check failed) — bounce back
                // rather than dead-ending, same behavior as before.
                state.currentStep = "services";
                state.history.push("services");
            });
    },
});

export const {
    openOnboarding,
    goToStep,
    goBack,
    setSelections,
    toggleService,
    updateServicePrice,
    markWelcomeSeen,
    markReferralSeen,
    closeOnboarding,
    markOnboardingSeen,
    deriveEntryStep,
} = providerOnboardingSlice.actions;

export default providerOnboardingSlice.reducer;