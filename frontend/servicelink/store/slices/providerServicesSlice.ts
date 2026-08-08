import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getServiceCatalog,
    saveProviderServicesBatch,
    ServiceCatalogItem,
    ServiceCategoryKey,
    ServiceSelectionPayload,
    ProviderServiceDTO,
} from "@/lib/api/providersApi";

export type { ServiceCatalogItem, ServiceCategoryKey, ServiceSelectionPayload };

interface ProviderServicesState {
    byCategory: Partial<Record<ServiceCategoryKey, ServiceCatalogItem[]>>;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: ProviderServicesState = {
    byCategory: {},
    loading: false,
    saving: false,
    error: null,
};

export const fetchCatalog = createAsyncThunk<
{ category: ServiceCategoryKey; items: ServiceCatalogItem[] },
ServiceCategoryKey,
{ rejectValue: string }
>("providerServices/fetchCatalog", async (category, { rejectWithValue }) => {
    try {
        const items = await getServiceCatalog(category);
        return { category, items };
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? `Failed to load ${category} catalog`,
        );
    }
});

export const saveServicesBatch = createAsyncThunk<
void,
    ServiceSelectionPayload[],
{ rejectValue: string }
>("providerServices/saveBatch", async (selections, { rejectWithValue }) => {
    try {
        await saveProviderServicesBatch(selections);
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to save services",
        );
    }
});

const providerServicesSlice = createSlice({
    name: "providerServices",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCatalog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCatalog.fulfilled, (state, action) => {
                state.byCategory[action.payload.category] = action.payload.items;
                state.loading = false;
            })
            .addCase(fetchCatalog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(saveServicesBatch.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(saveServicesBatch.fulfilled, (state) => {
                state.saving = false;
            })
            .addCase(saveServicesBatch.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export default providerServicesSlice.reducer;