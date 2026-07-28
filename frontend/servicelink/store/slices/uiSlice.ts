import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    sidebarOpen: boolean;
}

const initialState: UiState = {
    sidebarOpen: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
        },
        openSidebar(state) {
            state.sidebarOpen = true;
        },
        closeSidebar(state, _action: PayloadAction<void>) {
            state.sidebarOpen = false;
        },
    },
});

export const { toggleSidebar, openSidebar, closeSidebar } = uiSlice.actions;
export default uiSlice.reducer;