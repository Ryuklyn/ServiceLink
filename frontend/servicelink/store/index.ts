import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        // booking: bookingReducer,      ← पछि थप्ने
        // notification: notificationReducer, ← पछि थप्ने
    },
});

// Types - TypeScript को लागि
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;