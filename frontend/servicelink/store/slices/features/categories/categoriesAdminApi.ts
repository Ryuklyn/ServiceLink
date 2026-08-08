// store/slices/features/categories/categoriesAdminApi.ts
import axios from "@/utils/axios";
import {
    ServiceCatalogDTO,
    CreateServiceCatalogPayload,
    UpdateServiceCatalogPayload,
} from "./categoriesTypes";

export async function getCatalogForAdmin(): Promise<ServiceCatalogDTO[]> {
    // Axios appends "/providers/catalog/admin" to "http://localhost:8080/api"
    // Final URL: http://localhost:8080/api/providers/catalog/admin
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