import api from "@/utils/axios";

export type PricingUnit = "PER_JOB" | "PER_SQFT" | "PER_WALL" | "PER_ITEM";

// Categories are now admin-defined DB rows (see Category entity), not a
// fixed enum — there's no more ServiceCategoryKey union. Fetch the real
// list via getCategories() instead of importing a hardcoded set of keys.
export interface CategoryDTO {
    id: number;
    name: string;
    isActive: boolean;
    subServiceCount: number;
}

export interface ServiceCatalogItem {
    id: number;
    categoryId: number;
    categoryName: string;
    subServiceName: string;
    defaultDuration?: string | null;
    pricingUnit: PricingUnit;
    basePrice?: number | null;
    isActive: boolean;
}

// Matches backend ProviderServiceDTO — this is what comes back inside
// ProviderProfileDTO.services (from /providers/me, /providers/{id}, etc.),
// NOT the same shape as ServiceCatalogItem (catalog) or ServiceSelectionPayload (save request).
export interface ProviderServiceDTO {
    id: number;
    catalogId: number;
    subServiceName: string;
    categoryId: number;
    categoryName: string;
    pricingUnit: PricingUnit;
    customPrice: number;
    effectiveDuration: string | null;
    isAvailable: boolean;
}

// Matches ProviderServiceSelectionDTO exactly — no customDuration field exists there.
export interface ServiceSelectionPayload {
    catalogId: number;
    isAvailable: boolean;
    customPrice: number;
}

/**
 * GET /providers/categories — public, active categories only. No
 * @PreAuthorize on the backend, so this works whether or not a token is
 * attached.
 */
export async function getCategories(): Promise<CategoryDTO[]> {
    const { data } = await api.get<CategoryDTO[]>("/providers/categories");
    return data;
}

/**
 * GET /providers/catalog?categoryId=X — no @PreAuthorize on the backend, so
 * this works whether or not a token is attached. categoryId is a real FK
 * now, so the backend does an exact join — no name/key matching involved.
 */
export async function getServiceCatalog(categoryId: number): Promise<ServiceCatalogItem[]> {
    const { data } = await api.get<ServiceCatalogItem[]>("/providers/catalog", {
        params: { categoryId },
    });
    return data;
}

/**
 * POST /providers/me/services/batch — ROLE_PROVIDER required.
 */
export async function saveProviderServicesBatch(
    selections: ServiceSelectionPayload[],
): Promise<void> {
    await api.post("/providers/me/services/batch", selections);
}