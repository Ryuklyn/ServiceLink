import api from "@/utils/axios";

export type PricingUnit = "PER_JOB" | "PER_SQFT" | "PER_WALL" | "PER_ITEM";
export type ServiceCategoryKey =
    | "ELECTRICIAN"
    | "PLUMBER"
    | "CARPENTER"
    | "PAINTER"
    | "CLEANER"
    | "AC_REPAIR";

export interface ServiceCatalogItem {
    id: number;
    category: ServiceCategoryKey;
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
    category: ServiceCategoryKey;
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
 * GET /providers/catalog?category=X — no @PreAuthorize on the backend, so this
 * works whether or not a token is attached. Using the shared `api` instance is
 * fine here even though auth isn't required.
 */
export async function getServiceCatalog(
    category: ServiceCategoryKey,
): Promise<ServiceCatalogItem[]> {
    const { data } = await api.get<ServiceCatalogItem[]>("/providers/catalog", {
        params: { category },
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