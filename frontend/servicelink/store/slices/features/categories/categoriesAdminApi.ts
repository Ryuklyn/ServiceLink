// store/slices/features/categories/categoriesAdminApi.ts
import axios from "@/utils/axios";
import {
    CategoryDTO,
    ServiceCatalogDTO,
    CreateCategoryPayload,
    UpdateCategoryPayload,
    CreateCategoryWithServicesPayload,
    CreateServiceCatalogPayload,
    UpdateServiceCatalogPayload,
} from "./categoriesTypes";

// ── Categories ───────────────────────────────────────────────────────────

export async function getCategoriesForAdmin(): Promise<CategoryDTO[]> {
    const { data } = await axios.get<CategoryDTO[]>("/providers/categories/admin");
    return data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryDTO> {
    const { data } = await axios.post<CategoryDTO>("/providers/categories", payload);
    return data;
}

/** Create a category and its first batch of sub-services in one request. */
export async function createCategoryWithServices(
    payload: CreateCategoryWithServicesPayload,
): Promise<CategoryDTO> {
    const { data } = await axios.post<CategoryDTO>("/providers/categories/with-services", payload);
    return data;
}

export async function updateCategory(
    id: number,
    payload: UpdateCategoryPayload,
): Promise<CategoryDTO> {
    const { data } = await axios.patch<CategoryDTO>(`/providers/categories/${id}`, payload);
    return data;
}

export async function toggleCategory(id: number): Promise<CategoryDTO> {
    const { data } = await axios.patch<CategoryDTO>(`/providers/categories/${id}/toggle`);
    return data;
}

// ── Catalog (sub-services) ──────────────────────────────────────────────

export async function getCatalogForAdmin(): Promise<ServiceCatalogDTO[]> {
    const { data } = await axios.get<ServiceCatalogDTO[]>("/providers/catalog/admin");
    return data;
}

export async function createCatalogItem(
    payload: CreateServiceCatalogPayload,
): Promise<ServiceCatalogDTO> {
    const { data } = await axios.post<ServiceCatalogDTO>("/providers/catalog", payload);
    return data;
}

export async function updateCatalogItem(
    id: number,
    payload: UpdateServiceCatalogPayload,
): Promise<ServiceCatalogDTO> {
    const { data } = await axios.patch<ServiceCatalogDTO>(`/providers/catalog/${id}`, payload);
    return data;
}

export async function toggleCatalogItem(id: number): Promise<ServiceCatalogDTO> {
    const { data } = await axios.patch<ServiceCatalogDTO>(`/providers/catalog/${id}/toggle`);
    return data;
}