"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "@/utils/axios";

type Status = "verifying" | "success" | "failed";

// eSewa base64-encodes its `data` param; sometimes URL-safe base64 (-_ instead of +/).
// Decode defensively rather than assuming one variant.
function decodeBase64(value: string): string {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    try {
        return atob(normalized);
    } catch {
        return atob(value);
    }
}

export default function ReschedulePaymentCallbackPage() {
    const router = useRouter();
    const params = useSearchParams();
    const routeParams = useParams<{ appointmentId: string; gateway: string }>();

    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const appointmentId = routeParams?.appointmentId;
        const gateway = (routeParams?.gateway ?? "").toLowerCase();

        if (!appointmentId) {
            setStatus("failed");
            setMessage("Missing appointment reference — could not confirm this payment.");
            return;
        }

        let referenceId: string | null = null;
        let gatewayTransactionId: string | undefined;
        let gatewayResponseData: string | undefined;

        if (gateway === "esewa") {
            // eSewa appends `?data=<base64>` — decode it to recover our own transaction_uuid (= referenceId).
            const dataParam = params.get("data");
            if (dataParam) {
                gatewayResponseData = dataParam;
                try {
                    const decoded = JSON.parse(decodeBase64(dataParam));
                    referenceId = decoded.transaction_uuid ?? null;
                    if (decoded.status && decoded.status !== "COMPLETE") {
                        setStatus("failed");
                        setMessage("Payment was not completed. Your booking was not rescheduled.");
                        return;
                    }
                } catch {
                    setStatus("failed");
                    setMessage("Could not read the payment response from eSewa.");
                    return;
                }
            }
        } else if (gateway === "khalti") {
            // Khalti appends pidx, purchase_order_id (= our referenceId), status, etc.
            referenceId = params.get("purchase_order_id");
            gatewayTransactionId = params.get("pidx") ?? undefined;
            const khaltiStatus = params.get("status");
            if (khaltiStatus && khaltiStatus !== "Completed") {
                setStatus("failed");
                setMessage("Payment was not completed. Your booking was not rescheduled.");
                return;
            }
        }

        if (!referenceId) {
            setStatus("failed");
            setMessage("Missing payment reference — could not confirm this payment.");
            return;
        }

        api
            .post(`/appointments/${appointmentId}/reschedule/payment/verify`, {
                referenceId,
                gatewayTransactionId,
                gatewayResponseData,
            })
            .then(() => {
                setStatus("success");
                setMessage("Your booking has been rescheduled.");
            })
            .catch((err) => {
                setStatus("failed");
                setMessage(
                    err?.response?.data?.message ??
                    "Payment verification failed. Your booking was not rescheduled.",
                );
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, routeParams]);

    useEffect(() => {
        if (status === "verifying") return;
        const timer = setTimeout(() => router.replace("/dashboard/user/bookings"), 2500);
        return () => clearTimeout(timer);
    }, [status, router]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="text-center space-y-3 max-w-xs">
                {status === "verifying" && <Loader2 className="animate-spin mx-auto text-[#1e3a8a]" size={32} />}
                {status === "success" && <CheckCircle2 className="mx-auto text-emerald-600" size={32} />}
                {status === "failed" && <XCircle className="mx-auto text-red-500" size={32} />}

                <p className="text-sm font-bold text-gray-900">
                    {status === "verifying"
                        ? "Confirming your payment..."
                        : status === "success"
                            ? "Reschedule confirmed!"
                            : "Payment could not be confirmed"}
                </p>
                {status !== "verifying" && (
                    <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
                )}
                <p className="text-[10px] text-gray-400">Redirecting you back to your bookings...</p>
            </div>
        </div>
    );
}