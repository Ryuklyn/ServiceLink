import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { subscriptionApi, SubscriptionStatusDTO } from "@/lib/api/subscriptionApi";

interface ProviderSubscriptionState {
    data: SubscriptionStatusDTO | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProviderSubscriptionState = { data: null, loading: false, error: null };

export const fetchProviderSubscription = createAsyncThunk<
SubscriptionStatusDTO,
    void,
{ rejectValue: string }
>("providerSubscription/fetchMe", async (_, { rejectWithValue }) => {
    try {
        return await subscriptionApi.getMySubscription();
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.message ?? err?.message ?? "Failed to load subscription");
    }
});

const providerSubscriptionSlice = createSlice({
    name: "providerSubscription",
    initialState,
    reducers: {
        clearProviderSubscription(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProviderSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProviderSubscription.fulfilled, (state, action: PayloadAction<SubscriptionStatusDTO>) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchProviderSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export const { clearProviderSubscription } = providerSubscriptionSlice.actions;
export default providerSubscriptionSlice.reducer;