// store/slices/features/categories/categoriesTypes.ts

export type PricingUnit = "PER_JOB" | "PER_SQFT" | "PER_WALL" | "PER_ITEM";

export interface CategoryDTO {
    id: number;
    name: string;
    isActive: boolean;
    subServiceCount: number;
}

export interface ServiceCatalogDTO {
    id: number;
    categoryId: number;
    categoryName: string;
    subServiceName: string;
    defaultDuration: string | null;
    pricingUnit: PricingUnit;
    basePrice: number | null;
    isActive: boolean;
}

export interface CreateCategoryPayload {
    name: string;
}

export interface UpdateCategoryPayload {
    name?: string;
}

export interface SubServiceInput {
    subServiceName: string;
    defaultDuration?: string;
    pricingUnit: PricingUnit;
    basePrice?: number;
}

/** Payload for "create a category + its first batch of sub-services" in one shot. */
export interface CreateCategoryWithServicesPayload {
    name: string;
    subServices: SubServiceInput[];
}

export interface CreateServiceCatalogPayload {
    categoryId: number;
    subServiceName: string;
    defaultDuration?: string;
    pricingUnit: PricingUnit;
    basePrice?: number;
}

export interface UpdateServiceCatalogPayload {
    categoryId?: number;
    subServiceName?: string;
    defaultDuration?: string;
    pricingUnit?: PricingUnit;
    basePrice?: number;
}