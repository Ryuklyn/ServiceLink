import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import kycReducer from "./slices/kycSlice";
import onboardingReducer from "./slices/onboardingSlice";
import authFlowReducer from "./slices/authFlowSlice";
import providerProfileReducer from "./slices/providerProfileSlice";
import providerOnboardingReducer from "./slices/providerOnboardingSlice";
import providerSubscriptionReducer from "./slices/providerSubscriptionSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        kyc: kycReducer,
        authFlow: authFlowReducer,
        providerProfile: providerProfileReducer,
        providerOnboarding: providerOnboardingReducer,
        providerSubscription: providerSubscriptionReducer,
        // booking: bookingReducer,      ← पछि थप्ने
        // notification: notificationReducer, ← पछि थप्ने
    },
});

// Types - TypeScript को लागि
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;