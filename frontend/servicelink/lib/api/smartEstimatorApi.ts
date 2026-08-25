import api from "@/utils/axios";
import type {
    ProviderService,
    PricingUnit,
    EstimationMode,
    EstimateStatus,
} from "@/components/dashboard/user/explore/profile/types";

export interface EstimateResult {
    status: EstimateStatus;
    estimatedAmount: number | null; // null when nothing can be shown yet (spec §7 core rule)
    displayRate: number;
    requiredInputLabel?: string;
}

export interface FinalizeEstimateResponse {
    appointmentId: number;
    finalAmount: number;
    measuredQuantity?: number;
    confirmedAt: string;
}

/**
 * Client-side Smart Estimator — spec §5 decision tree.
 * Pure, synchronous, no network calls. This is the "MVP calculation engine"
 * (spec §11) and intentionally does not call any pricing API — per §11,
 * external pricing APIs / ML prediction are explicitly out of scope.
 */
export function estimatePrice(
    service: Pick<ProviderService, "rate" | "pricingUnit" | "estimationMode" | "requiredInputLabel">,
    quantity?: number
): EstimateResult {
    const { rate, pricingUnit, estimationMode, requiredInputLabel } = service;

    // 1. No valid rate at all → cannot estimate, needs assessment/setup.
    if (!rate || rate <= 0) {
        return { status: "REQUIRES_ASSESSMENT", estimatedAmount: null, displayRate: 0 };
    }

    // Services without estimation metadata yet (legacy / not migrated) fall
    // back to a flat "starting from" so we never invent a computed number.
    if (!pricingUnit || !estimationMode) {
        return { status: "STARTING_FROM", estimatedAmount: rate, displayRate: rate };
    }

    // 2. Inspection-required — never produces a computed final-looking number.
    if (estimationMode === "INSPECTION_REQUIRED") {
        return { status: "STARTING_FROM", estimatedAmount: rate, displayRate: rate };
    }

    // 3. Fixed / automatic — per job, or a known fixed quantity.
    if (estimationMode === "FIXED") {
        const multiplier = pricingUnit === "PER_JOB" ? 1 : quantity ?? 1;
        return { status: "ESTIMATED", estimatedAmount: rate * multiplier, displayRate: rate };
    }

    // 4. Input-based — needs quantity / hours / area / walls from the customer.
    if (estimationMode === "INPUT_BASED") {
        if (!quantity || quantity <= 0) {
            return {
                status: "REQUIRES_INPUT",
                estimatedAmount: null,
                displayRate: rate,
                requiredInputLabel: requiredInputLabel ?? inferInputLabel(pricingUnit),
            };
        }
        return { status: "ESTIMATED", estimatedAmount: rate * quantity, displayRate: rate };
    }

    return { status: "REQUIRES_ASSESSMENT", estimatedAmount: null, displayRate: rate };
}

/**
 * Backend pricing-unit strings aren't guaranteed to match our frontend enum
 * character-for-character (observed: backend sends "PER_SQFT", frontend
 * enum is "PER_SQ_FT"). Normalize by stripping non-letters before
 * comparing, so a drifted separator/casing doesn't silently break
 * estimation or the PriceStub/unit-label lookups downstream.
 *
 * Use this wherever a raw pricingUnit string comes off the network
 * (provider fetch, catalog fetch) before it's stored on ProviderService.
 *
 * Supports: PER_JOB, PER_ITEM, PER_HOUR, PER_SQ_FT, PER_WALL
 */
export function normalizePricingUnit(raw: string | null | undefined): PricingUnit | undefined {
    if (!raw) return undefined;
    const key = raw.toUpperCase().replace(/[^A-Z]/g, "");
    switch (key) {
        case "PERJOB":
            return "PER_JOB";
        case "PERITEM":
            return "PER_ITEM";
        case "PERHOUR":
            return "PER_HOUR";
        case "PERSQFT":
        case "PERSQUAREFOOT":
        case "PERSQUAREFEET":
            return "PER_SQ_FT";
        case "PERWALL":
            return "PER_WALL";
        default:
            return undefined;
    }
}

/**
 * The appointments API expects the customer-entered quantity under a
 * unit-specific field name, not a generic "quantity" — confirmed by the
 * 422 "areaSqFt is required for PER_SQFT services" and
 * "wallCount is required for PER_WALL services" responses. Map our
 * internal { pricingUnit, quantity } pair to the field(s) the backend
 * actually reads, for use when building the booking payload.
 *
 * Maps:
 *   PER_JOB   → (nothing)
 *   PER_ITEM  → itemCount
 *   PER_HOUR  → hours
 *   PER_SQ_FT → areaSqFt
 *   PER_WALL  → wallCount
 */
export function buildQuantityFields(
    pricingUnit: PricingUnit | undefined,
    quantity: number | undefined
): Record<string, number> {
    if (!pricingUnit || quantity === undefined) return {};
    switch (pricingUnit) {
        case "PER_SQ_FT":
            return { areaSqFt: quantity };
        case "PER_HOUR":
            return { hours: quantity };
        case "PER_ITEM":
            return { itemCount: quantity };
        case "PER_WALL":
            return { wallCount: quantity };
        case "PER_JOB":
        default:
            return {};
    }
}

/**
 * Infer a human-readable input label based on pricing unit.
 * Used when `requiredInputLabel` is not explicitly set by the backend.
 */
function inferInputLabel(unit: PricingUnit): string {
    switch (unit) {
        case "PER_SQ_FT":
            return "Approximate area (sq. ft.)";
        case "PER_HOUR":
            return "Estimated hours";
        case "PER_ITEM":
            return "Quantity";
        case "PER_WALL":
            return "Number of walls";
        default:
            return "Enter a value";
    }
}

export const STATUS_LABEL: Record<EstimateStatus, string> = {
    ESTIMATED: "Estimated",
    STARTING_FROM: "Starting from",
    REQUIRES_INPUT: "Enter details to estimate",
    REQUIRES_ASSESSMENT: "Requires assessment",
    FINALIZED: "Final amount",
};

/**
 * Spec §9 — after actual measurement/work is confirmed (post-service,
 * provider or admin side), the backend is the source of truth for the
 * finalAmount. This is the one part of the flow that DOES hit the network,
 * since the client must not compute or guess a final price itself.
 */
export async function fetchFinalizedAmount(
    appointmentId: number
): Promise<FinalizeEstimateResponse> {
    const { data } = await api.get<FinalizeEstimateResponse>(
        `/appointments/${appointmentId}/final-amount`
    );
    return data;
}

export function inferEstimationMode(
    pricingUnit: PricingUnit | undefined,
    backendValue: EstimationMode | undefined | null
): EstimationMode | undefined {
    if (backendValue) return backendValue; // trust the backend when it's actually provided
    if (!pricingUnit) return undefined;
    return pricingUnit === "PER_JOB" ? "FIXED" : "INPUT_BASED";
}
