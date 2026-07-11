import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    subscriptionApi,
    SubscriptionStatusDTO,
    BillingRecord,
    CheckoutResponse,
    SubscriptionPlanType,
    PaymentGateway,
    VerifyPaymentPayload,
} from "@/lib/api/subscriptionApi";

// ─── State ────────────────────────────────────────────────────────────────────

interface ProviderSubscriptionState {
    data: SubscriptionStatusDTO | null;
    transactions: BillingRecord[];
    loading: boolean;
    transactionsLoading: boolean;
    checkingOut: boolean;
    verifying: boolean;
    error: string | null;
    // Holds the gateway redirect instructions between "checkout succeeded" and
    // "browser has actually navigated away" — the component watches this to
    // perform the eSewa form-submit or Khalti redirect.
    pendingCheckout: CheckoutResponse | null;
}

const initialState: ProviderSubscriptionState = {
    data: null,
    transactions: [],
    loading: false,
    transactionsLoading: false,
    checkingOut: false,
    verifying: false,
    error: null,
    pendingCheckout: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchProviderSubscription = createAsyncThunk<
SubscriptionStatusDTO,
    void,
{ rejectValue: string }
>("providerSubscription/fetchMe", async (_, { rejectWithValue }) => {
    try {
        return await subscriptionApi.getMySubscription();
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load subscription",
        );
    }
});

export const fetchBillingHistory = createAsyncThunk<
BillingRecord[],
    void,
{ rejectValue: string }
>("providerSubscription/fetchTransactions", async (_, { rejectWithValue }) => {
    try {
        return await subscriptionApi.getTransactions();
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load billing history",
        );
    }
});

export const startCheckout = createAsyncThunk<
CheckoutResponse,
    { planType: SubscriptionPlanType; gateway: PaymentGateway },
{ rejectValue: string }
>("providerSubscription/checkout", async ({ planType, gateway }, { rejectWithValue }) => {
    try {
        return await subscriptionApi.checkout(planType, gateway);
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to start checkout",
        );
    }
});

export const verifyPayment = createAsyncThunk<
{ paymentStatus: string },
VerifyPaymentPayload,
{ rejectValue: string }
>("providerSubscription/verify", async (payload, { rejectWithValue }) => {
    try {
        return await subscriptionApi.verify(payload);
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Payment verification failed",
        );
    }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const providerSubscriptionSlice = createSlice({
    name: "providerSubscription",
    initialState,
    reducers: {
        clearProviderSubscription(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
        clearPendingCheckout(state) {
            state.pendingCheckout = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── status ──
            .addCase(fetchProviderSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchProviderSubscription.fulfilled,
                (state, action: PayloadAction<SubscriptionStatusDTO>) => {
                    state.data = action.payload;
                    state.loading = false;
                },
            )
            .addCase(fetchProviderSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })

            // ── billing history ──
            .addCase(fetchBillingHistory.pending, (state) => {
                state.transactionsLoading = true;
            })
            .addCase(
                fetchBillingHistory.fulfilled,
                (state, action: PayloadAction<BillingRecord[]>) => {
                    state.transactions = action.payload;
                    state.transactionsLoading = false;
                },
            )
            .addCase(fetchBillingHistory.rejected, (state, action) => {
                state.transactionsLoading = false;
                state.error = action.payload ?? "Unknown error";
            })

            // ── checkout ──
            .addCase(startCheckout.pending, (state) => {
                state.checkingOut = true;
                state.error = null;
            })
            .addCase(startCheckout.fulfilled, (state, action: PayloadAction<CheckoutResponse>) => {
                state.checkingOut = false;
                state.pendingCheckout = action.payload;
            })
            .addCase(startCheckout.rejected, (state, action) => {
                state.checkingOut = false;
                state.error = action.payload ?? "Failed to start checkout";
            })

            // ── verify ──
            .addCase(verifyPayment.pending, (state) => {
                state.verifying = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state) => {
                state.verifying = false;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.verifying = false;
                state.error = action.payload ?? "Payment verification failed";
            });
    },
});

export const { clearProviderSubscription, clearPendingCheckout } = providerSubscriptionSlice.actions;
export default providerSubscriptionSlice.reducer;