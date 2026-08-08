// store/slices/features/categories/categoriesAdminSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    getCatalogForAdmin,
    createCatalogItem,
    updateCatalogItem,
    toggleCatalogItem,
} from "@/store/slices/features/categories/categoriesAdminApi";
import {
    ServiceCatalogDTO,
    CreateServiceCatalogPayload,
    UpdateServiceCatalogPayload,
} from "@/store/slices/features/categories/categoriesTypes";

interface CategoriesAdminState {
    items: ServiceCatalogDTO[];
    loading: boolean;
    saving: boolean;
    togglingId: number | null;
    error: string | null;
}

const initialState: CategoriesAdminState = {
    items: [],
    loading: false,
    saving: false,
    togglingId: null,
    error: null,
};

function extractErrorMessage(err: any, fallback: string): string {
    return err?.response?.data?.message ?? err?.message ?? fallback;
}

export const fetchCatalogAdmin = createAsyncThunk<
    ServiceCatalogDTO[],
    void,
    { rejectValue: string }
>("categoriesAdmin/fetchCatalog", async (_, { rejectWithValue }) => {
    try {
        return await getCatalogForAdmin();
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to load service catalog"));
    }
});

export const createCatalogItemThunk = createAsyncThunk<
    ServiceCatalogDTO,
    CreateServiceCatalogPayload,
    { rejectValue: string }
>("categoriesAdmin/createCatalogItem", async (payload, { rejectWithValue }) => {
    try {
        return await createCatalogItem(payload);
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to create sub-service"));
    }
});

export const updateCatalogItemThunk = createAsyncThunk<
    ServiceCatalogDTO,
    { id: number; payload: UpdateServiceCatalogPayload },
    { rejectValue: string }
>("categoriesAdmin/updateCatalogItem", async ({ id, payload }, { rejectWithValue }) => {
    try {
        return await updateCatalogItem(id, payload);
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to update sub-service"));
    }
});

export const toggleCatalogItemThunk = createAsyncThunk<
    ServiceCatalogDTO,
    number,
    { rejectValue: string }
>("categoriesAdmin/toggleCatalogItem", async (id, { rejectWithValue }) => {
    try {
        return await toggleCatalogItem(id);
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to update status"));
    }
});

const categoriesAdminSlice = createSlice({
    name: "categoriesAdmin",
    initialState,
    reducers: {
        clearCategoriesAdminError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchCatalogAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCatalogAdmin.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCatalogAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })

            // create
            .addCase(createCatalogItemThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createCatalogItemThunk.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO>) => {
                state.saving = false;
                state.items.push(action.payload);
            })
            .addCase(createCatalogItemThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })

            // update
            .addCase(updateCatalogItemThunk.pending, (state) => {
                state.error = null;
            })
            .addCase(updateCatalogItemThunk.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO>) => {
                const idx = state.items.findIndex((i) => i.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(updateCatalogItemThunk.rejected, (state, action) => {
                state.error = action.payload ?? "Unknown error";
            })

            // toggle
            .addCase(toggleCatalogItemThunk.pending, (state, action) => {
                state.togglingId = action.meta.arg;
                state.error = null;
            })
            .addCase(toggleCatalogItemThunk.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO>) => {
                state.togglingId = null;
                const idx = state.items.findIndex((i) => i.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(toggleCatalogItemThunk.rejected, (state, action) => {
                state.togglingId = null;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export const { clearCategoriesAdminError } = categoriesAdminSlice.actions;
export default categoriesAdminSlice.reducer;