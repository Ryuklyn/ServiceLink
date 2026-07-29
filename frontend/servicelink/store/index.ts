import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import kycReducer from "./slices/kycSlice";
import onboardingReducer from "./slices/onboardingSlice";
import authFlowReducer from "./slices/authFlowSlice";
import providerProfileReducer from "./slices/providerProfileSlice";
import providerServicesReducer from "@/store/slices/providerServicesSlice";
import providerOnboardingReducer from "./slices/providerOnboardingSlice";
import providerSubscriptionReducer from "./slices/providerSubscriptionSlice";
import providerAvailabilityReducer from "./slices/providerAvailabilitySlice";
import providerBookingsReducer from "./slices/providerBookingsSlice";
import proSessionReducer from "@/store/slices/proSessionSlice";
import uiReducer from "@/store/slices/uiSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        kyc: kycReducer,
        authFlow: authFlowReducer,
        providerProfile: providerProfileReducer,
        providerOnboarding: providerOnboardingReducer,
        providerSubscription: providerSubscriptionReducer,
        providerServices: providerServicesReducer,
        providerAvailability:providerAvailabilityReducer,
        providerBookings: providerBookingsReducer,
        proSession: proSessionReducer,
        ui:uiReducer,
        notifications: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;