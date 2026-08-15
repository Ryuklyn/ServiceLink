// store/slices/features/categories/categoriesAdminSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    getCategoriesForAdmin,
    createCategory,
    createCategoryWithServices,
    updateCategory,
    toggleCategory,
    deleteCategory,
    getCatalogForAdmin,
    createCatalogItem,
    updateCatalogItem,
    toggleCatalogItem,
    deleteCatalogItem,
} from "@/store/slices/features/categories/categoriesAdminApi";
import {
    CategoryDTO,
    ServiceCatalogDTO,
    CreateCategoryPayload,
    UpdateCategoryPayload,
    CreateCategoryWithServicesPayload,
    CreateServiceCatalogPayload,
    UpdateServiceCatalogPayload,
} from "@/store/slices/features/categories/categoriesTypes";

interface CategoriesAdminState {
    categories: CategoryDTO[];
    items: ServiceCatalogDTO[];
    loading: boolean;
    saving: boolean;
    togglingCategoryId: number | null;
    togglingServiceId: number | null;
    deletingCategoryId: number | null;
    deletingServiceId: number | null;
    error: string | null;
}

const initialState: CategoriesAdminState = {
    categories: [],
    items: [],
    loading: false,
    saving: false,
    togglingCategoryId: null,
    togglingServiceId: null,
    deletingCategoryId: null,
    deletingServiceId: null,
    error: null,
};

function extractErrorMessage(err: any, fallback: string): string {
    return err?.response?.data?.message ?? err?.message ?? fallback;
}

// ── Categories ───────────────────────────────────────────────────────────

export const fetchCategoriesAdmin = createAsyncThunk<
CategoryDTO[],
    void,
{ rejectValue: string }
>("categoriesAdmin/fetchCategories", async (_, { rejectWithValue }) => {
    try {
        return await getCategoriesForAdmin();
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to load categories"));
    }
});

export const createCategoryThunk = createAsyncThunk<
CategoryDTO,
    CreateCategoryPayload,
{ rejectValue: string }
>("categoriesAdmin/createCategory", async (payload, { rejectWithValue }) => {
    try {
        return await createCategory(payload);
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to create category"));
    }
});

export const createCategoryWithServicesThunk = createAsyncThunk<
{ category: CategoryDTO; refetch: true },
CreateCategoryWithServicesPayload,
{ rejectValue: string }
>("categoriesAdmin/createCategoryWithServices", async (payload, { rejectWithValue }) => {
    try {
        const category = await createCategoryWithServices(payload);
        return { category, refetch: true };
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to create category"));
    }
});

export const updateCategoryThunk = createAsyncThunk<
CategoryDTO,
    { id: number; payload: UpdateCategoryPayload },
{ rejectValue: string }
>("categoriesAdmin/updateCategory", async ({ id, payload }, { rejectWithValue }) => {
    try {
        return await updateCategory(id, payload);
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to update category"));
    }
});

export const toggleCategoryThunk = createAsyncThunk<
CategoryDTO,
    number,
{ rejectValue: string }
>("categoriesAdmin/toggleCategory", async (id, { rejectWithValue }) => {
    try {
        return await toggleCategory(id);
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to update category status"));
    }
});

export const deleteCategoryThunk = createAsyncThunk<
number,
    number,
{ rejectValue: string }
>("categoriesAdmin/deleteCategory", async (id, { rejectWithValue }) => {
    try {
        await deleteCategory(id);
        return id;
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to delete category"));
    }
});

// ── Catalog (sub-services) ──────────────────────────────────────────────

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

export const deleteCatalogItemThunk = createAsyncThunk<
{ id: number; categoryId: number },
{ id: number; categoryId: number },
{ rejectValue: string }
>("categoriesAdmin/deleteCatalogItem", async ({ id, categoryId }, { rejectWithValue }) => {
    try {
        await deleteCatalogItem(id);
        return { id, categoryId };
    } catch (err: any) {
        return rejectWithValue(extractErrorMessage(err, "Failed to delete sub-service"));
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
            // fetch categories
            .addCase(fetchCategoriesAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoriesAdmin.fulfilled, (state, action: PayloadAction<CategoryDTO[]>) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategoriesAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })

            // create bare category
            .addCase(createCategoryThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createCategoryThunk.fulfilled, (state, action: PayloadAction<CategoryDTO>) => {
                state.saving = false;
                state.categories.push(action.payload);
            })
            .addCase(createCategoryThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })

            // create category + services
            .addCase(createCategoryWithServicesThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createCategoryWithServicesThunk.fulfilled, (state, action) => {
                state.saving = false;
                state.categories.push(action.payload.category);
            })
            .addCase(createCategoryWithServicesThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })

            // update category
            .addCase(updateCategoryThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateCategoryThunk.fulfilled, (state, action: PayloadAction<CategoryDTO>) => {
                state.saving = false;
                const idx = state.categories.findIndex((c) => c.id === action.payload.id);
                if (idx !== -1) state.categories[idx] = action.payload;
            })
            .addCase(updateCategoryThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })

            // toggle category
            .addCase(toggleCategoryThunk.pending, (state, action) => {
                state.togglingCategoryId = action.meta.arg;
                state.error = null;
            })
            .addCase(toggleCategoryThunk.fulfilled, (state, action: PayloadAction<CategoryDTO>) => {
                state.togglingCategoryId = null;
                const idx = state.categories.findIndex((c) => c.id === action.payload.id);
                if (idx !== -1) state.categories[idx] = action.payload;
            })
            .addCase(toggleCategoryThunk.rejected, (state, action) => {
                state.togglingCategoryId = null;
                state.error = action.payload ?? "Unknown error";
            })

            // delete category
            .addCase(deleteCategoryThunk.pending, (state, action) => {
                state.deletingCategoryId = action.meta.arg;
                state.error = null;
            })
            .addCase(deleteCategoryThunk.fulfilled, (state, action: PayloadAction<number>) => {
                state.deletingCategoryId = null;
                state.categories = state.categories.filter((c) => c.id !== action.payload);
            })
            .addCase(deleteCategoryThunk.rejected, (state, action) => {
                state.deletingCategoryId = null;
                state.error = action.payload ?? "Unknown error";
            })

            // fetch catalog
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

            // create sub-service
            .addCase(createCatalogItemThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createCatalogItemThunk.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO>) => {
                state.saving = false;
                state.items.push(action.payload);
                const cat = state.categories.find((c) => c.id === action.payload.categoryId);
                if (cat) cat.subServiceCount += 1;
            })
            .addCase(createCatalogItemThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })

            // update sub-service
            .addCase(updateCatalogItemThunk.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateCatalogItemThunk.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO>) => {
                state.saving = false;
                const idx = state.items.findIndex((i) => i.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(updateCatalogItemThunk.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })

            // toggle sub-service
            .addCase(toggleCatalogItemThunk.pending, (state, action) => {
                state.togglingServiceId = action.meta.arg;
                state.error = null;
            })
            .addCase(toggleCatalogItemThunk.fulfilled, (state, action: PayloadAction<ServiceCatalogDTO>) => {
                state.togglingServiceId = null;
                const idx = state.items.findIndex((i) => i.id === action.payload.id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(toggleCatalogItemThunk.rejected, (state, action) => {
                state.togglingServiceId = null;
                state.error = action.payload ?? "Unknown error";
            })

            // delete sub-service
            .addCase(deleteCatalogItemThunk.pending, (state, action) => {
                state.deletingServiceId = action.meta.arg.id;
                state.error = null;
            })
            .addCase(deleteCatalogItemThunk.fulfilled, (state, action) => {
                state.deletingServiceId = null;
                state.items = state.items.filter((i) => i.id !== action.payload.id);
                const cat = state.categories.find((c) => c.id === action.payload.categoryId);
                if (cat) cat.subServiceCount = Math.max(0, cat.subServiceCount - 1);
            })
            .addCase(deleteCatalogItemThunk.rejected, (state, action) => {
                state.deletingServiceId = null;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export const { clearCategoriesAdminError } = categoriesAdminSlice.actions;
export default categoriesAdminSlice.reducer;