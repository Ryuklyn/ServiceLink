// import api from "@/utils/axios";
//
// type EsewaCallbackData = {
//     transaction_code?: string;
//     transaction_uuid?: string;
//     total_amount?: string;
// };
//
// function decodeEsewaData(data: string): EsewaCallbackData | null {
//     try {
//         const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
//         return JSON.parse(atob(normalized));
//     } catch {
//         return null;
//     }
// }
//
// export interface VerifyResult {
//     verified: boolean;
//     referenceId: string | null;
//     gateway: "ESEWA" | "KHALTI" | null;
//     error?: string;
// }
//
// // Reads whatever eSewa/Khalti appended to the return URL and verifies it
// // against the backend. Call this once, on mount, when `paymentResult` is present.
// export async function verifyPaymentFromUrl(params: URLSearchParams): Promise<VerifyResult> {
//     const esewaData = params.get("data");
//     if (esewaData) {
//         const decoded = decodeEsewaData(esewaData);
//         const referenceId = decoded?.transaction_uuid ?? null;
//         if (!referenceId) return { verified: false, referenceId: null, gateway: "ESEWA", error: "Could not read eSewa reference" };
//         try {
//             await api.post("/business/payment/verify", {
//                 referenceId,
//                 gatewayTransactionId: decoded?.transaction_code,
//                 gatewayResponseData: esewaData,
//             });
//             return { verified: true, referenceId, gateway: "ESEWA" };
//         } catch (e: any) {
//             return { verified: false, referenceId, gateway: "ESEWA", error: e?.response?.data?.message ?? "Verification failed" };
//         }
//     }
//
//     const pidx = params.get("pidx");
//     const purchaseOrderId = params.get("purchase_order_id");
//     if (pidx && purchaseOrderId) {
//         try {
//             await api.post("/business/payment/verify", {
//                 referenceId: purchaseOrderId,
//                 gatewayTransactionId: pidx,
//             });
//             return { verified: true, referenceId: purchaseOrderId, gateway: "KHALTI" };
//         } catch (e: any) {
//             return { verified: false, referenceId: purchaseOrderId, gateway: "KHALTI", error: e?.response?.data?.message ?? "Verification failed" };
//         }
//     }
//
//     return { verified: false, referenceId: null, gateway: null, error: "No gateway response found in URL" };
// }