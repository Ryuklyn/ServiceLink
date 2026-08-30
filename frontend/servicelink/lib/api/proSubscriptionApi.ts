import api from "@/utils/axios";
import type { SubscriptionResponse, PaymentInitiateResponse, PaymentGateway } from "@/types/business";

export const getSubscriptionByWorkspace = (workspaceId: number) =>
    api.get<SubscriptionResponse>(`/business/payment/subscription/workspace/${workspaceId}`).then((r) => r.data);

export const getProSubscriptionHistory = (workspaceId: number) =>
    api.get<any>(`/business/payment/subscription/workspace/${workspaceId}/history`).then((r) => r.data);

export const initiatePayment = (body: {
    subscriptionId: number;
    paymentGateway: PaymentGateway;
    amountNpr: number;
    successUrl: string;
    failureUrl: string;
}) => api.post<PaymentInitiateResponse>("/business/payment/initiate", body).then((r) => r.data);

type EsewaCallbackData = { transaction_code?: string; transaction_uuid?: string; total_amount?: string };

function decodeEsewaData(data: string): EsewaCallbackData | null {
    try {
        return JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
        return null;
    }
}

export interface VerifyResult {
    verified: boolean;
    referenceId: string | null;
    gateway: "ESEWA" | "KHALTI" | null;
    error?: string;
}

// Reads whatever eSewa/Khalti appended to the return URL and verifies it
// against POST /business/payment/verify — matches PaymentVerifyRequest exactly.
export async function verifyPayment(params: URLSearchParams): Promise<VerifyResult> {
    const esewaData = params.get("data");
    if (esewaData) {
        const decoded = decodeEsewaData(esewaData);
        const referenceId = decoded?.transaction_uuid ?? null;
        if (!referenceId) return { verified: false, referenceId: null, gateway: "ESEWA", error: "Could not read eSewa reference" };
        try {
            await api.post("/business/payment/verify", {
                referenceId,
                gatewayTransactionId: decoded?.transaction_code,
                gateway: "ESEWA",
                gatewayResponseData: esewaData,
            });
            return { verified: true, referenceId, gateway: "ESEWA" };
        } catch (e: any) {
            return { verified: false, referenceId, gateway: "ESEWA", error: e?.response?.data?.message ?? "Verification failed" };
        }
    }

    const pidx = params.get("pidx");
    const purchaseOrderId = params.get("purchase_order_id");
    if (pidx && purchaseOrderId) {
        try {
            await api.post("/business/payment/verify", { referenceId: purchaseOrderId, gatewayTransactionId: pidx, gateway: "KHALTI" });
            return { verified: true, referenceId: purchaseOrderId, gateway: "KHALTI" };
        } catch (e: any) {
            return { verified: false, referenceId: purchaseOrderId, gateway: "KHALTI", error: e?.response?.data?.message ?? "Verification failed" };
        }
    }

    return { verified: false, referenceId: null, gateway: null, error: "No gateway response found in URL" };
}