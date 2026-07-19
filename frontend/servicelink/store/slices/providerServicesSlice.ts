// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import api from "@/utils/axios";
//
// export type PricingUnit = "PER_JOB" | "PER_SQFT" | "PER_WALL" | "PER_ITEM";
// export type ServiceCategoryKey = "ELECTRICIAN" | "CARPENTER" | "PAINTER";
//
// export interface ServiceCatalogItem {
//     id: number;
//     category: ServiceCategoryKey;
//     subServiceName: string;
//     defaultDuration?: string | null;
//     pricingUnit: PricingUnit;
//     basePrice?: number | null;
//     isActive: boolean;
// }
//
// interface ProviderServicesState {
//     byCategory: Partial<Record<ServiceCategoryKey, ServiceCatalogItem[]>>;
//     loading: boolean;
//     saving: boolean;
//     error: string | null;
// }
//
// const initialState: ProviderServicesState = {
//     byCategory: {},
//     loading: false,
//     saving: false,
//     error: null,
// };
//
// export const fetchCatalog = createAsyncThunk<
// { category: ServiceCategoryKey; items: ServiceCatalogItem[] },
// ServiceCategoryKey,
// { rejectValue: string }
// >("providerServices/fetchCatalog", async (category, { rejectWithValue }) => {
//     try {
//         const { data } = await api.get<ServiceCatalogItem[]>("/providers/catalog", {
//             params: { category },
//         });
//         return { category, items: data };
//     } catch (err: any) {
//         return rejectWithValue(
//             err?.response?.data?.message ?? err?.message ?? `Failed to load ${category} catalog`,
//         );
//     }
// });
//
// // ASSUMED shape — confirm against the real ProviderServiceSelectionDTO
// export interface ServiceSelectionPayload {
//     catalogId: number;
//     customPrice: number;
//     customDuration?: string | null;
//     isAvailable: boolean;
// }
//
// export const saveServicesBatch = createAsyncThunk<
// void,
//     ServiceSelectionPayload[],
// { rejectValue: string }
// >("providerServices/saveBatch", async (selections, { rejectWithValue }) => {
//     try {
//         await api.post("/providers/me/services/batch", selections);
//     } catch (err: any) {
//         return rejectWithValue(
//             err?.response?.data?.message ?? err?.message ?? "Failed to save services",
//         );
//     }
// });
//
// const providerServicesSlice = createSlice({
//     name: "providerServices",
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchCatalog.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchCatalog.fulfilled, (state, action) => {
//                 state.byCategory[action.payload.category] = action.payload.items;
//                 state.loading = false;
//             })
//             .addCase(fetchCatalog.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload ?? "Unknown error";
//             })
//             .addCase(saveServicesBatch.pending, (state) => {
//                 state.saving = true;
//                 state.error = null;
//             })
//             .addCase(saveServicesBatch.fulfilled, (state) => {
//                 state.saving = false;
//             })
//             .addCase(saveServicesBatch.rejected, (state, action) => {
//                 state.saving = false;
//                 state.error = action.payload ?? "Unknown error";
//             });
//     },
// });
//
// export default providerServicesSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getServiceCatalog,
    saveProviderServicesBatch,
    ServiceCatalogItem,
    ServiceCategoryKey,
    ServiceSelectionPayload,
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