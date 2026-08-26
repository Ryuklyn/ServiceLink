import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProviderPreferencesState {
    theme: "system" | "light" | "dark";
    language: "en" | "ne";
}

const initialState: ProviderPreferencesState = {
    theme: "system",
    language: "en",
};

const providerPreferencesSlice = createSlice({
    name: "providerPreferences",
    initialState,
    reducers: {
        initProviderPreferences(state, action: PayloadAction<{ theme: "system" | "light" | "dark"; language: "en" | "ne" }>) {
            state.theme = action.payload.theme;
            state.language = action.payload.language;
        },
        setProviderTheme(state, action: PayloadAction<"system" | "light" | "dark">) {
            state.theme = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("providerTheme", action.payload);
            }
        },
        setProviderLanguage(state, action: PayloadAction<"en" | "ne">) {
            state.language = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("providerLanguage", action.payload);
            }
        },
    },
});

export const { initProviderPreferences, setProviderTheme, setProviderLanguage } = providerPreferencesSlice.actions;
export default providerPreferencesSlice.reducer;
