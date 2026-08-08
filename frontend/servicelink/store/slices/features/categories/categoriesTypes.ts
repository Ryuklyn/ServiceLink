// store/slices/features/categories/categoriesTypes.ts

export type PricingUnit = "PER_JOB" | "PER_SQFT" | "PER_WALL" | "PER_ITEM";

// NOTE: ServiceCategory is a backend enum, not a DB table, so there's no
// endpoint to list its values yet. Keep this in sync with
// com.servicelink.core.model.common.ServiceCategory, or add a
// GET /api/providers/categories endpoint and swap this out for a fetched list.
export const KNOWN_CATEGORIES = [
    "ELECTRICAL",
    "PLUMBING",
    "CLEANING",
    "CARPENTRY",
    "PAINTING",
    "APPLIANCE_REPAIR",
] as const;

export type KnownCategory = (typeof KNOWN_CATEGORIES)[number];

export interface ServiceCatalogDTO {
    id: number;
    category: string; // ServiceCategory enum value, e.g. "ELECTRICAL"
    subServiceName: string;
    defaultDuration: string | null;
    pricingUnit: PricingUnit;
    basePrice: number | null;
    isActive: boolean;
}

export interface CreateServiceCatalogPayload {
    category: string;
    subServiceName: string;
    defaultDuration?: string;
    pricingUnit: PricingUnit;
    basePrice?: number;
}

export interface UpdateServiceCatalogPayload {
    subServiceName?: string;
    defaultDuration?: string;
    pricingUnit?: PricingUnit;
    basePrice?: number;
}

export function formatCategoryLabel(category: string): string {
    return category
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}