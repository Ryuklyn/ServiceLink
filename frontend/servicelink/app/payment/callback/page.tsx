// "use client";
//
// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
// import { useAppDispatch } from "@/store/hooks";
// import { verifyPayment, fetchProviderSubscription, fetchBillingHistory } from "@/store/slices/providerSubscriptionSlice";
//
// type CallbackResult = "verifying" | "success" | "failure";
//
// export default function PaymentCallbackPage() {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const searchParams = useSearchParams();
//     const [result, setResult] = useState<CallbackResult>("verifying");
//     const [message, setMessage] = useState("Confirming your payment…");
//
//     useEffect(() => {
//         const run = async () => {
//             const status = searchParams.get("status"); // "success" | "failure" — set by our own successUrl/failureUrl
//
//             if (status === "failure") {
//                 setResult("failure");
//                 setMessage("The payment was not completed. You can try again from the Subscription page.");
//                 return;
//             }
//
//             const pendingRaw = sessionStorage.getItem("sl_pending_payment");
//             const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
//
//             if (!pending?.referenceId) {
//                 setResult("failure");
//                 setMessage("Couldn't find payment details for this session. Please check Billing History.");
//                 return;
//             }
//
//             try {
//                 if (pending.gateway === "ESEWA") {
//                     // eSewa appends the transaction data as a base64 `data` query param
//                     // on return — adjust this key if your sandbox response differs.
//                     const data = searchParams.get("data");
//                     await dispatch(
//                         verifyPayment({
//                             referenceId: pending.referenceId,
//                             gatewayResponseData: data ?? undefined,
//                         }),
//                     ).unwrap();
//                 } else {
//                     // Khalti appends pidx (and other fields) as query params on return.
//                     const pidx = searchParams.get("pidx");
//                     await dispatch(
//                         verifyPayment({
//                             referenceId: pending.referenceId,
//                             gatewayTransactionId: pidx ?? undefined,
//                         }),
//                     ).unwrap();
//                 }
//
//                 sessionStorage.removeItem("sl_pending_payment");
//                 dispatch(fetchProviderSubscription());
//                 dispatch(fetchBillingHistory());
//                 setResult("success");
//                 setMessage("Payment confirmed — your subscription is now active.");
//             } catch (err: any) {
//                 setResult("failure");
//                 setMessage(typeof err === "string" ? err : "We couldn't verify this payment. Please check Billing History or contact support.");
//             }
//         };
//
//         run();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);
//
//     return (
//         <div className="min-h-[100dvh] flex items-center justify-center bg-[#f0f4ff] px-4">
//             <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#1e3a8a]/15 p-8 text-center">
//                 {result === "verifying" && (
//                     <>
//                         <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin mx-auto mb-4" aria-hidden />
//                         <p className="text-[#1e3a8a] font-semibold">{message}</p>
//                     </>
//                 )}
//                 {result === "success" && (
//                     <>
//                         <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" aria-hidden />
//                         <p className="text-[#1e3a8a] font-bold mb-1">Payment Successful</p>
//                         <p className="text-gray-500 text-sm mb-6">{message}</p>
//                     </>
//                 )}
//                 {result === "failure" && (
//                     <>
//                         <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden />
//                         <p className="text-[#1e3a8a] font-bold mb-1">Payment Not Completed</p>
//                         <p className="text-gray-500 text-sm mb-6">{message}</p>
//                     </>
//                 )}
//
//                 {result !== "verifying" && (
//                     <button
//                         onClick={() => router.push("/dashboard/provider/subscription")}
//                         className="w-full py-3 rounded-xl font-bold text-white bg-[#e8683f] hover:bg-[#d95a2f] transition-colors"
//                     >
//                         Back to Subscription
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// }