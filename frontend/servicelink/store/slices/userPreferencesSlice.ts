import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserPreferencesState {
    theme: "system" | "light" | "dark";
    language: "en" | "ne";
}

const initialState: UserPreferencesState = {
    theme: "system",
    language: "en",
};

const userPreferencesSlice = createSlice({
    name: "userPreferences",
    initialState,
    reducers: {
        initUserPreferences(state, action: PayloadAction<{ theme: "system" | "light" | "dark"; language: "en" | "ne" }>) {
            state.theme = action.payload.theme;
            state.language = action.payload.language;
        },
        setUserTheme(state, action: PayloadAction<"system" | "light" | "dark">) {
            state.theme = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("userTheme", action.payload);
            }
        },
        setUserLanguage(state, action: PayloadAction<"en" | "ne">) {
            state.language = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("userLanguage", action.payload);
            }
        },
    },
});

export const { initUserPreferences, setUserTheme, setUserLanguage } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
