import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getCategories,
    getServiceCatalog,
    saveProviderServicesBatch,
    CategoryDTO,
    ServiceCatalogItem,
    ServiceSelectionPayload,
} from "@/lib/api/providersApi";

export type { CategoryDTO, ServiceCatalogItem, ServiceSelectionPayload };

interface ProviderServicesState {
    categories: CategoryDTO[];
    categoriesLoading: boolean;
    byCategory: Record<number, ServiceCatalogItem[]>;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: ProviderServicesState = {
    categories: [],
    categoriesLoading: false,
    byCategory: {},
    loading: false,
    saving: false,
    error: null,
};

export const fetchCategories = createAsyncThunk<
    CategoryDTO[],
    void,
    { rejectValue: string }
>("providerServices/fetchCategories", async (_, { rejectWithValue }) => {
    try {
        return await getCategories();
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load categories",
        );
    }
});

export const fetchCatalog = createAsyncThunk<
    { categoryId: number; items: ServiceCatalogItem[] },
    number,
    { rejectValue: string }
>("providerServices/fetchCatalog", async (categoryId, { rejectWithValue }) => {
    try {
        const items = await getServiceCatalog(categoryId);
        return { categoryId, items };
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? `Failed to load catalog for category ${categoryId}`,
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
            .addCase(fetchCategories.pending, (state) => {
                state.categoriesLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.categoriesLoading = false;
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(fetchCatalog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCatalog.fulfilled, (state, action) => {
                state.byCategory[action.payload.categoryId] = action.payload.items;
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