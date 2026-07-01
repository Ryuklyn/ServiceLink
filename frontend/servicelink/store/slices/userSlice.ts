import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getMe, MeResponse } from "@/lib/api/authApi";

// ── Async thunk: backend बाट user fetch गर्ने ──────────────────────────────
export const fetchUser = createAsyncThunk(
    "user/fetchMe",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getMe();
            return data;
        } catch (err: any) {
            return rejectWithValue(
                err?.message || "Failed to fetch user"
            );
        }
    }
);

// ── State type ──────────────────────────────────────────────────────────────
interface UserState {
    data: MeResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    data: null,
    loading: false,
    error: null,
};

// ── Slice ───────────────────────────────────────────────────────────────────
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // Instant local update - no API call (sidebar/navbar instant sync)
        updateUserLocally(state, action: PayloadAction<Partial<MeResponse>>) {
            if (state.data) {
                state.data = { ...state.data, ...action.payload };
            }
        },

        // Logout - clear user state
        clearUser(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },

    // Async thunk handlers
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateUserLocally, clearUser } = userSlice.actions;
export default userSlice.reducer;