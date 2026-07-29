import api from "@/utils/axios";
import type { SubscriptionResponse, PaymentInitiateResponse, PaymentGateway } from "@/types/business";

export const getSubscriptionByWorkspace = (workspaceId: number) =>
    api.get<SubscriptionResponse>(`/business/payment/subscription/workspace/${workspaceId}`).then((r) => r.data);

export const initiatePayment = (body: {
    subscriptionId: number;
    paymentGateway: PaymentGateway;
    amountNpr: number;
    successUrl: string;
    failureUrl: string;
}) => api.post<PaymentInitiateResponse>("/business/payment/initiate", body).then((r) => r.data);