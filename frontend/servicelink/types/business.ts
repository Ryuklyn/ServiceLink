// types/business.ts
export interface OrganizationResponse {
    id: number;
    companyName: string;
    businessType: string;
    companySize: string;
    workEmail: string;
    contactNumber: string;
    logoUrl: string | null;
    registrationStatus: string;
    createdAt: string;
}

export interface WorkspaceResponse {
    id: number;
    organizationId: number;
    name: string;
    primaryBranchLocation: string;
    preferredServices: string[];
    createdAt: string;
}

export type PlanType = "STARTER" | "GROWTH" | "ENTERPRISE";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
export type PaymentGateway = "ESEWA" | "KHALTI";

export interface SubscriptionResponse {
    id: number;
    workspaceId: number;
    planType: PlanType;
    amountNpr: number;
    status: SubscriptionStatus;
    referenceId: string;
    trialEndsAt: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
}

export interface PaymentInitiateResponse {
    referenceId: string;
    gatewayRedirectUrl: string;
    gatewayMethod: string; // e.g. "GET" | "POST"
    gatewayFormFields: Record<string, string> | null;
    gateway: string;
    status: string;
}