"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Star, Check, Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchProviderSubscription,
    fetchBillingHistory,
    startCheckout,
    verifyPayment,
    clearPendingCheckout,
} from "@/store/slices/providerSubscriptionSlice";
import type { PaymentGateway, SubscriptionPlanType } from "@/lib/api/subscriptionApi";

// ─── Static plan display config — prices MUST also be enforced server-side
// in the /checkout endpoint; these are for display only, never trusted as
// the actual charge amount. ──────────────────────────────────────────────────

const PLAN_DISPLAY: Record<
    "monthly" | "quarterly" | "yearly",
    { label: string; price: string; sub: string; enumValue: SubscriptionPlanType; durationDays: number; save?: string }
> = {
    monthly: { label: "Monthly", price: "Rs. 500", sub: "/ month", enumValue: "MONTHLY", durationDays: 30 },
    quarterly: {
        label: "Quarterly",
        price: "Rs. 1200",
        sub: "/ 3 months",
        enumValue: "QUARTERLY",
        durationDays: 90,
        save: "Save Rs. 300/year",
    },
    yearly: {
        label: "Yearly",
        price: "Rs. 4000",
        sub: "/ year",
        enumValue: "YEARLY",
        durationDays: 365,
        save: "Save Rs. 2000/year",
    },
};

const PLAN_FEATURES = [
    "Unlimited booking requests",
    "Customer messaging via ServiceLink",
    "Earnings dashboard & analytics",
    "Referral program access",
    "Priority search listing",
];

type PaymentModalState = "none" | "verifying" | "success" | "failure";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function formatDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function planLabel(planType: string) {
    switch (planType) {
        case "MONTHLY":
            return "Monthly Plan";
        case "QUARTERLY":
            return "Quarterly Plan";
        case "YEARLY":
            return "Yearly Plan";
        case "FREE_TRIAL":
            return "Free Trial";
        default:
            return planType;
    }
}

const methodBadgeColor = (method: string) => {
    if (method === "ESEWA") return "bg-green-50 text-green-700 border-green-200";
    if (method === "KHALTI") return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
};

const methodMeta = (method: string) => {
    if (method === "ESEWA") return { label: "eSewa", icon: "/images/esewa.png" };
    if (method === "KHALTI") return { label: "Khalti", icon: "/images/khalti.png" };
    return { label: method, icon: null };
};

export default function SubscriptionPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const params = useParams<{ status?: string[] }>();
    const searchParams = useSearchParams();
    const { data: status, transactions, loading, checkingOut, pendingCheckout, error } =
        useAppSelector((s) => s.providerSubscription);

    const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const [selectedPayment, setSelectedPayment] = useState<PaymentGateway>("ESEWA");

    // ── Payment result overlay — driven by the optional [[...status]]
    // segment, so it renders ON TOP of this same page's real content
    // instead of navigating to a separate blank route. ─────────────────────
    const [paymentModal, setPaymentModal] = useState<PaymentModalState>("none");
    const [modalMessage, setModalMessage] = useState("Confirming your payment…");
    const [activatedPlan, setActivatedPlan] = useState<string | null>(null);

    // ── Live clock tick — recomputed every minute so "days remaining"
    // counts down on its own without needing a refetch/refresh. ───────────
    const [now, setNow] = useState<number>(() => Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        dispatch(fetchProviderSubscription());
        dispatch(fetchBillingHistory());
    }, [dispatch]);

    // ── Once checkout succeeds, actually leave the page toward the gateway ──
    useEffect(() => {
        if (!pendingCheckout) return;

        sessionStorage.setItem(
            "sl_pending_payment",
            JSON.stringify({
                referenceId: pendingCheckout.referenceId,
                gateway: pendingCheckout.gateway,
                planLabel: PLAN_DISPLAY[selectedPlan].label,
            }),
        );

        if (pendingCheckout.gatewayMethod === "POST" && pendingCheckout.gatewayFormFields) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = pendingCheckout.gatewayRedirectUrl;
            Object.entries(pendingCheckout.gatewayFormFields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        } else {
            window.location.href = pendingCheckout.gatewayRedirectUrl;
        }

        dispatch(clearPendingCheckout());
    }, [pendingCheckout, dispatch, selectedPlan]);

    // ── Payment return handling — triggered by the [[...status]] segment ──
    useEffect(() => {
        const pathStatus = params?.status?.[0]; // "success" | "failure" | undefined
        if (!pathStatus) return;

        setPaymentModal("verifying");

        const run = async () => {
            const pendingRaw = sessionStorage.getItem("sl_pending_payment");
            const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

            if (!pending?.referenceId) {
                setPaymentModal("failure");
                setModalMessage("Couldn't find payment details for this session. Please check Billing History.");
                return;
            }

            // Khalti: only ONE return_url for both outcomes, so its own
            // ?status= query param is the real source of truth, not the path.
            if (pending.gateway === "KHALTI") {
                const khaltiStatus = searchParams.get("status");
                if (khaltiStatus !== "Completed") {
                    setPaymentModal("failure");
                    setModalMessage("The payment was not completed. You can try again below.");
                    return;
                }
            } else if (pathStatus === "failure") {
                setPaymentModal("failure");
                setModalMessage("The payment was not completed. You can try again below.");
                return;
            }

            try {
                if (pending.gateway === "ESEWA") {
                    const data = searchParams.get("data");
                    await dispatch(
                        verifyPayment({
                            referenceId: pending.referenceId,
                            gatewayResponseData: data ?? undefined,
                        }),
                    ).unwrap();
                } else {
                    const pidx = searchParams.get("pidx");
                    await dispatch(
                        verifyPayment({
                            referenceId: pending.referenceId,
                            gatewayTransactionId: pidx ?? undefined,
                        }),
                    ).unwrap();
                }

                sessionStorage.removeItem("sl_pending_payment");
                setActivatedPlan(pending.planLabel ?? null);
                dispatch(fetchProviderSubscription());
                dispatch(fetchBillingHistory());
                setPaymentModal("success");
            } catch (err: any) {
                setPaymentModal("failure");
                setModalMessage(
                    typeof err === "string" ? err : "We couldn't verify this payment. Please check Billing History or contact support.",
                );
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.status]);

    const closePaymentModal = useCallback(() => {
        setPaymentModal("none");
        // Strip the /success or /failure segment so a refresh doesn't
        // re-trigger verification, while staying on the same page.
        router.replace("/dashboard/provider/subscription");
    }, [router]);

    const handlePayNow = useCallback(() => {
        dispatch(
            startCheckout({
                planType: PLAN_DISPLAY[selectedPlan].enumValue,
                gateway: selectedPayment,
            }),
        );
    }, [dispatch, selectedPlan, selectedPayment]);

    // ── Days remaining, computed LIVE from endDate + `now`, not from a
    // possibly-stale backend-computed field. Ceil so "0 days left" only
    // shows once the end date has actually passed, and partial days still
    // count as a full day remaining (matches how a user reads a countdown).
    // ────────────────────────────────────────────────────────────────────
    const daysRemaining = useMemo(() => {
        if (!status?.endDate) return 0;
        const diff = new Date(status.endDate).getTime() - now;
        return Math.max(0, Math.ceil(diff / MS_PER_DAY));
    }, [status?.endDate, now]);

    // ── Cycle length is derived from the actual start/end span rather than
    // assumed from planType. This matters once subscriptions can be
    // STACKED (e.g. 3-month plan bought on top of 12 leftover trial days
    // extends endDate further out), so the progress bar still reflects the
    // real total span instead of a hardcoded 30/90/365. ───────────────────
    const cycleLength = useMemo(() => {
        if (status?.startDate && status?.endDate) {
            const span = Math.ceil(
                (new Date(status.endDate).getTime() - new Date(status.startDate).getTime()) / MS_PER_DAY,
            );
            if (span > 0) return span;
        }
        return status?.planType === "YEARLY" ? 365 : status?.planType === "QUARTERLY" ? 90 : 30;
    }, [status?.startDate, status?.endDate, status?.planType]);

    const progressPct = Math.max(0, Math.min(100, (1 - daysRemaining / cycleLength) * 100));

    // ── Preview shown next to "Pay Now": current leftover days will be
    // added on top of the newly purchased plan's duration, not replace it.
    // ────────────────────────────────────────────────────────────────────
    const carryOverDays = status?.isActive ? daysRemaining : 0;
    const newPlanDurationDays = PLAN_DISPLAY[selectedPlan].durationDays;
    const totalAfterPurchase = carryOverDays + newPlanDurationDays;

    return (
        <div className="relative flex flex-col gap-5 max-w-[1200px] mx-auto">
            {/* ── Payment result overlay — blurs the real page behind it ── */}
            {paymentModal !== "none" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#1e3a8a]/15 p-8 text-center">
                        {paymentModal === "verifying" && (
                            <>
                                <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin mx-auto mb-4" aria-hidden />
                                <p className="text-[#1e3a8a] font-semibold">{modalMessage}</p>
                            </>
                        )}
                        {paymentModal === "success" && (
                            <>
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" aria-hidden />
                                <p className="text-[#1e3a8a] font-bold mb-1">Payment Successful</p>
                                <p className="text-gray-500 text-sm mb-6">
                                    {activatedPlan
                                        ? `${activatedPlan} plan has been successfully activated.`
                                        : "Your subscription is now active."}
                                </p>
                                <button
                                    onClick={closePaymentModal}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-[#e8683f] hover:bg-[#d95a2f] transition-colors"
                                >
                                    Continue
                                </button>
                            </>
                        )}
                        {paymentModal === "failure" && (
                            <>
                                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden />
                                <p className="text-[#1e3a8a] font-bold mb-1">Payment Not Completed</p>
                                <p className="text-gray-500 text-sm mb-6">{modalMessage}</p>
                                <button
                                    onClick={closePaymentModal}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-[#e8683f] hover:bg-[#d95a2f] transition-colors"
                                >
                                    Back to Subscription
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-800">Subscription & Billing</h1>
                    {status && (
                        <span
                            className={`flex items-center gap-1.5 border text-xs font-semibold px-2.5 py-1 rounded-full ${
                                status.isActive
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                            }`}
                        >
              <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${
                      status.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
              />
                            {status.isActive ? "Active" : "Inactive"}
            </span>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Current Plan Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    {loading || !status ? (
                        <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                            Loading subscription…
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-2 rounded px-2 py-0.5">
                                            <div
                                                className="w-3 h-3 rounded-sm"
                                                style={{ backgroundColor: "#e8683f" }}
                                            />
                                            <span className="text-xs font-medium text-gray-700">
                        {planLabel(status.planType)}
                      </span>
                                            <span
                                                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: status.isActive ? "#e8683f" : "#9ca3af",
                                                    color: "white",
                                                }}
                                            >
                        {status.status}
                      </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Started: {formatDate(status.startDate)}
                    </span>
                                        <span className="flex items-center gap-1">
                      <Calendar size={11} /> Expires: {formatDate(status.endDate)}
                    </span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="text-4xl font-bold" style={{ color: "#1e3a8a" }}>
                                        {daysRemaining}
                                    </div>
                                    <div className="text-xs text-gray-500">days remaining</div>
                                </div>
                            </div>

                            <div className="mb-1">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Billing period</span>
                                    <span>
                    {daysRemaining} / {cycleLength} days left
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full"
                                        style={{ width: `${100 - progressPct}%`, backgroundColor: "#e8683f" }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Choose a Plan */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Choose a Plan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(Object.keys(PLAN_DISPLAY) as Array<keyof typeof PLAN_DISPLAY>).map((key) => {
                            const plan = PLAN_DISPLAY[key];
                            const isSelected = selectedPlan === key;
                            const isCurrent = status?.planType === plan.enumValue;
                            return (
                                <div
                                    key={key}
                                    onClick={() => setSelectedPlan(key)}
                                    className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all ${
                                        isSelected
                                            ? "border-orange-400 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {isCurrent && (
                                        <span
                                            className="absolute -top-2.5 left-3 text-xs font-semibold px-2 py-0.5 rounded"
                                            style={{ backgroundColor: "#e8683f", color: "white" }}
                                        >
                      Current
                    </span>
                                    )}
                                    {key === "yearly" && (
                                        <span
                                            className="absolute -top-2.5 right-3 text-xs font-semibold px-2 py-0.5 rounded text-white"
                                            style={{ backgroundColor: "#e8683f" }}
                                        >
                      Best Value
                    </span>
                                    )}
                                    <p className="text-xs font-semibold text-gray-700 mb-1">{plan.label}</p>
                                    <p className="text-base font-bold" style={{ color: "#1e3a8a" }}>
                                        {plan.price}
                                    </p>
                                    <p className="text-xs text-gray-400 mb-1">{plan.sub}</p>
                                    {plan.save && (
                                        <p className="text-xs font-semibold mb-2" style={{ color: "#e8683f" }}>
                                            {plan.save}
                                        </p>
                                    )}
                                    <div className="space-y-1.5 mt-2">
                                        {PLAN_FEATURES.map((f) => (
                                            <div key={f} className="flex items-start gap-1.5">
                                                <Check size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-gray-600 leading-tight">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Payment Method</h2>
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => setSelectedPayment("ESEWA")}
                            className={`flex-1 sm:flex-none sm:w-28 h-16 flex items-center justify-center rounded-xl border-2 transition-all ${
                                selectedPayment === "ESEWA"
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <img src="/images/esewa.png" alt="eSewa" className="max-h-10 object-contain" />
                        </button>
                        <button
                            onClick={() => setSelectedPayment("KHALTI")}
                            className={`flex-1 sm:flex-none sm:w-28 h-16 flex items-center justify-center rounded-xl border-2 transition-all ${
                                selectedPayment === "KHALTI"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <img src="/images/khalti.png" alt="Khalti" className="max-h-10 object-contain" />
                        </button>
                    </div>

                    {/* ── Carry-over notice — tells the provider their leftover
                    days will stack on top of the new plan, not be discarded. ── */}
                    {carryOverDays > 0 && (
                        <div className="flex items-start gap-2 mb-4 text-xs rounded-lg border px-3 py-2.5"
                             style={{ backgroundColor: "#f0f4ff", borderColor: "#c7d5f8", color: "#1e3a8a" }}>
                            <Info size={13} className="mt-0.5 flex-shrink-0" />
                            <span>
                                You have <strong>{carryOverDays} day{carryOverDays === 1 ? "" : "s"}</strong> left on
                                your current plan. Buying the {PLAN_DISPLAY[selectedPlan].label} plan will add{" "}
                                {newPlanDurationDays} days on top, giving you{" "}
                                <strong>{totalAfterPurchase} days</strong> total.
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handlePayNow}
                        disabled={checkingOut}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-6 py-3
                        rounded-xl transition-all duration-200 shadow-md
                        ${
                            checkingOut
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-[#e8683f] text-white hover:bg-[#d95a2f] hover:shadow-lg active:scale-[0.98]"
                        }`}
                    >
                        {checkingOut ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                <span>Redirecting to payment…</span>
                            </>
                        ) : (
                            <span>Pay {PLAN_DISPLAY[selectedPlan].price} with {selectedPayment === "ESEWA" ? "eSewa" : "Khalti"}</span>
                        )}
                    </button>

                    <p className="text-xs text-gray-400 mt-3">
                        Payments are processed securely (sandbox environment). ServiceLink does
                        not store your payment credentials.
                    </p>
                </div>

                {/* Free Months from Referrals */}
                <div
                    className="rounded-xl border p-5 shadow-sm"
                    style={{ backgroundColor: "#f0f4ff", borderColor: "#c7d5f8" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Star size={15} className="text-blue-500" />
                        <h2 className="text-sm font-semibold" style={{ color: "#1e3a8a" }}>
                            Free Months from Referrals
                        </h2>
                    </div>
                    <div className="text-3xl font-bold mb-1" style={{ color: "#1e3a8a" }}>
                        {status?.referralBonusDaysTotal ? Math.floor(status.referralBonusDaysTotal / 30) : 0}
                    </div>
                    <p className="text-xs text-gray-600">free months earned so far</p>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Billing History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Reference
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Date
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Amount
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Method
                                </th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                                        No payments yet.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((row) => (
                                    <tr key={row.referenceId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 text-xs text-gray-500 font-mono">
                                            {row.referenceId}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-600">
                                            {formatDate(row.completedAt)}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-semibold text-gray-800">
                                            Rs. {row.amountNpr}
                                        </td>
                                        <td className="px-5 py-3">
                        <span
                            className={`inline-flex items-center justify-center h-7 w-12 rounded border ${methodBadgeColor(
                                row.gateway
                            )}`}
                        >
                          {methodMeta(row.gateway).icon && (
                              <img
                                  src={methodMeta(row.gateway).icon as string}
                                  alt={methodMeta(row.gateway).label}
                                  className="h-7 w-12 object-contain"
                              />
                          )}
                        </span>
                                        </td>
                                        <td className="px-5 py-3">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${
                                row.status === "SUCCESS"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                          {row.status}
                        </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}