"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Star,
  Check,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  TrendingUp,
  CreditCard,
  Clock,
  Shield,
  Activity,
  ArrowUpRight,
  FileText
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProviderSubscription,
  fetchBillingHistory,
  startCheckout,
  verifyPayment,
  clearPendingCheckout,
} from "@/store/slices/providerSubscriptionSlice";
import type { PaymentGateway, SubscriptionPlanType } from "@/lib/api/subscriptionApi";

const PLAN_DISPLAY: Record<
  "monthly" | "quarterly" | "yearly",
  {
    label: string;
    price: string;
    priceValue: number;
    sub: string;
    perDay: string;
    enumValue: SubscriptionPlanType;
    durationDays: number;
    savingsNote?: string;
    badge?: { text: string; tone: "popular" | "value" };
  }
> = {
  monthly: {
    label: "Monthly",
    price: "Rs. 500",
    priceValue: 500,
    sub: "billed every month",
    perDay: "Rs. 17 / day",
    enumValue: "MONTHLY",
    durationDays: 30,
  },
  quarterly: {
    label: "Quarterly",
    price: "Rs. 1,200",
    priceValue: 1200,
    sub: "billed every 3 months",
    perDay: "Rs. 13 / day",
    enumValue: "QUARTERLY",
    durationDays: 90,
    savingsNote: "Save Rs. 300 vs monthly billing",
    badge: { text: "Most Popular", tone: "popular" },
  },
  yearly: {
    label: "Yearly",
    price: "Rs. 4,000",
    priceValue: 4000,
    sub: "billed once a year",
    perDay: "Rs. 11 / day",
    enumValue: "YEARLY",
    durationDays: 365,
    savingsNote: "Save Rs. 2,000 vs monthly billing",
    badge: { text: "Best Value", tone: "value" },
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
type HistoryTab = "transactions" | "timeline";

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
  const [activeTab, setActiveTab] = useState<HistoryTab>("transactions");

  // Payment Result Overlay
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>("none");
  const [modalMessage, setModalMessage] = useState("Confirming your payment…");
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);

  // Live countdown tick
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(fetchProviderSubscription());
    dispatch(fetchBillingHistory());
  }, [dispatch]);

  // Handle gateway redirects on successful checkout
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

  // Payment Verification Flow
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
  }, [params?.status, dispatch, searchParams]);

  const closePaymentModal = useCallback(() => {
    setPaymentModal("none");
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

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    if (!status?.endDate) return 0;
    const diff = new Date(status.endDate).getTime() - now;
    return Math.max(0, Math.ceil(diff / MS_PER_DAY));
  }, [status?.endDate, now]);

  // Dynamic cycle span calculation
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

  const carryOverDays = status?.isActive ? daysRemaining : 0;
  const newPlanDurationDays = PLAN_DISPLAY[selectedPlan].durationDays;
  const totalAfterPurchase = carryOverDays + newPlanDurationDays;

  // Generate dynamic client-side timeline events for subscription logs
  const subscriptionHistoryLogs = useMemo(() => {
    const events: Array<{ type: string; title: string; desc: string; date: string; source: string }> = [];
    
    if (status?.startDate) {
      if (status.trialUsed) {
        events.push({
          type: "TRIAL",
          title: "Free Trial Started",
          desc: "14-day Provider Trial initiated automatically.",
          date: new Date(status.startDate).toLocaleDateString(),
          source: "SYSTEM"
        });
      } else {
        events.push({
          type: "ACTIVATION",
          title: `${planLabel(status.planType)} Activated`,
          desc: "Plan started successfully after portal checkout.",
          date: new Date(status.startDate).toLocaleDateString(),
          source: "SYSTEM"
        });
      }
    }

    // Add events from transactions list if they represent renewals
    transactions
      .filter((tx) => tx.status === "SUCCESS" && tx.completedAt)
      .forEach((tx) => {
        events.push({
          type: "RENEWAL",
          title: "Plan Renewed",
          desc: `Payment of Rs. ${tx.amountNpr.toLocaleString()} received via ${tx.gateway}.`,
          date: tx.completedAt ? new Date(tx.completedAt).toLocaleDateString() : "",
          source: "GATEWAY"
        });
      });

    // Add upcoming renewal or expiry event
    if (status?.endDate) {
      const isPast = new Date(status.endDate).getTime() < Date.now();
      events.push({
        type: isPast ? "EXPIRED" : "RENEWAL_UPCOMING",
        title: isPast ? "Subscription Expired" : "Upcoming Renewal Due",
        desc: isPast 
          ? "Plan expired. Access temporarily limited until renewal." 
          : `Plan set to renew or expire. Carryover metrics will apply.`,
        date: new Date(status.endDate).toLocaleDateString(),
        source: "BILLING"
      });
    }

    // Sort events by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [status, transactions]);

  return (
    <div className="relative flex flex-col gap-6 max-w-[1200px] mx-auto p-2 sm:p-4">
      {/* Payment result overlay */}
      {paymentModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 text-center animate-scale-in">
            {paymentModal === "verifying" && (
              <>
                <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin mx-auto mb-4" aria-hidden />
                <p className="text-slate-800 font-extrabold text-sm">{modalMessage}</p>
                <p className="text-slate-400 text-xs mt-1">Please do not refresh or close this window.</p>
              </>
            )}
            {paymentModal === "success" && (
              <>
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4 animate-bounce" aria-hidden />
                <p className="text-slate-900 font-black text-base mb-1">Payment Verified</p>
                <p className="text-gray-500 text-xs mb-6">
                  {activatedPlan
                    ? `Your ${activatedPlan} plan has been successfully activated. Enjoy full provider privileges.`
                    : "Your subscription is now fully active."}
                </p>
                <button
                  onClick={closePaymentModal}
                  className="w-full py-3 rounded-xl font-bold text-white bg-[#e8683f] hover:bg-[#d95a2f] transition-all text-xs tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95"
                >
                  Go to Dashboard
                </button>
              </>
            )}
            {paymentModal === "failure" && (
              <>
                <XCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" aria-hidden />
                <p className="text-slate-950 font-black text-base mb-1">Checkout Incomplete</p>
                <p className="text-gray-500 text-xs mb-6">{modalMessage}</p>
                <button
                  onClick={closePaymentModal}
                  className="w-full py-3 rounded-xl font-bold text-white bg-[#1e3a8a] hover:bg-[#152a63] transition-all text-xs tracking-wider uppercase shadow-md active:scale-95"
                >
                  Dismiss & Return
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Subscription Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your service provider license, pricing plans, rewards, and audit logs.</p>
        </div>
        {status && (
          <span
            className={`flex items-center gap-1.5 border text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              status.isActive
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-rose-50 border-rose-100 text-rose-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${status.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
            {status.isActive ? "Active Subscription" : "License Expired"}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl px-4 py-3 flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Subscription status, Catalog, and checkout details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Subscription Status Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            {loading || !status ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a8a]" aria-hidden />
                <span className="text-xs font-semibold">Retrieving subscription properties...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{planLabel(status.planType)}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${status.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}>
                        {status.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-500 font-semibold">
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Started:</span>
                        <span className="text-slate-800 font-bold">{formatDate(status.startDate)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Renewal:</span>
                        <span className="text-slate-800 font-bold">{formatDate(status.endDate)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 sm:text-right bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-3xl font-black text-[#1e3a8a]">{daysRemaining}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide">Days Left</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 border-t border-slate-50 pt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Usage Progress</span>
                    <span>{daysRemaining} of {cycleLength} days remaining</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${100 - progressPct}%`, backgroundColor: "#e8683f" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Catalog Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Choose Subscription Plan</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a commit level. Carry-over logic guarantees unused days stack on renewal.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.keys(PLAN_DISPLAY) as Array<keyof typeof PLAN_DISPLAY>).map((key) => {
                const plan = PLAN_DISPLAY[key];
                const isSelected = selectedPlan === key;
                const isCurrent = status?.planType === plan.enumValue;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`relative text-left rounded-2xl border-2 p-4 pt-6 transition-all ${
                      isSelected
                        ? "border-[#e8683f] bg-orange-50/30 shadow-md scale-[1.01]"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    {/* Badge row */}
                    <div className="absolute -top-3.5 left-4 right-4 flex items-center">
                      {isCurrent ? (
                        <span className="text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-[#1e3a8a] border border-[#152a63]">
                          Active Plan
                        </span>
                      ) : plan.badge ? (
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${
                            plan.badge.tone === "popular" ? "bg-[#e8683f]" : "bg-emerald-600"
                          }`}
                        >
                          {plan.badge.text}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{plan.label}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#1e3a8a]">{plan.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{plan.sub}</p>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-md px-2 py-0.5">
                      {plan.perDay}
                    </div>

                    {plan.savingsNote && (
                      <p className="mt-2 text-[10px] font-black text-[#e8683f]">
                        {plan.savingsNote}
                      </p>
                    )}

                    <div className="mt-3 border-t border-slate-50 pt-3 space-y-1.5">
                      {PLAN_FEATURES.map((f) => (
                        <div key={f} className="flex items-start gap-1.5">
                          <Check size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-[10px] text-slate-600 font-semibold leading-tight">{f}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black uppercase tracking-wider border transition-colors ${
                        isSelected
                          ? "bg-[#e8683f] text-white border-[#e8683f] shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select Plan"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure Payment Trigger */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Choose Payment Gateway</h2>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedPayment("ESEWA")}
                className={`flex-1 max-w-[140px] h-14 flex items-center justify-center rounded-2xl border-2 transition-all p-3 ${
                  selectedPayment === "ESEWA"
                    ? "border-emerald-500 bg-emerald-50/40 scale-102"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <img src="/images/esewa.png" alt="eSewa" className="max-h-8 object-contain" />
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPayment("KHALTI")}
                className={`flex-1 max-w-[140px] h-14 flex items-center justify-center rounded-2xl border-2 transition-all p-3 ${
                  selectedPayment === "KHALTI"
                    ? "border-purple-500 bg-purple-50/40 scale-102"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <img src="/images/khalti.png" alt="Khalti" className="max-h-8 object-contain" />
              </button>
            </div>

            {carryOverDays > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-[#1e3a8a] font-semibold leading-relaxed">
                <Info size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>
                  Leftover duration of <strong>{carryOverDays} day{carryOverDays === 1 ? "" : "s"}</strong> will carry over. 
                  Your new plan extends your coverage to <strong>{totalAfterPurchase} days</strong> total.
                </span>
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={checkingOut}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider px-6 py-3.5
              rounded-xl transition-all shadow-md
              ${
                checkingOut
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-[#e8683f] text-white hover:bg-[#d95a2f] hover:shadow-lg active:scale-95"
              }`}
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  <span>Configuring gateway checkout...</span>
                </>
              ) : (
                <span>Pay {PLAN_DISPLAY[selectedPlan].price} via {selectedPayment === "ESEWA" ? "eSewa" : "Khalti"}</span>
              )}
            </button>

            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              * Payments are safely verified in a sandbox staging environment. ServiceLink does not capture or store banking credentials.
            </p>
          </div>

        </div>

        {/* Right Side: Referrals and dynamic history logs */}
        <div className="space-y-6">
          
          {/* Referrals Card */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[#1e3a8a]" />
              <h2 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider">Referral Reward Balance</h2>
            </div>
            <div>
              <p className="text-3xl font-black text-[#1e3a8a]">
                {status?.referralBonusDaysTotal ? Math.floor(status.referralBonusDaysTotal / 30) : 0}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Free months credited to your account from successful invites.</p>
            </div>
          </div>

          {/* Audit History Center */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Tab switchers */}
            <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === "transactions"
                    ? "bg-[#1e3a8a] text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Transactions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === "timeline"
                    ? "bg-[#1e3a8a] text-white shadow-xs"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Subscription Logs
              </button>
            </div>

            {/* Tab contents */}
            <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
              
              {activeTab === "transactions" ? (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic text-[11px] font-semibold">
                      No transactions recorded yet.
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.referenceId} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-mono text-slate-400 block">REF ID</span>
                            <span className="font-mono text-[10px] text-slate-900 font-black">{tx.referenceId}</span>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase ${tx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}>
                            {tx.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-semibold border-t border-slate-100/60 pt-2 text-slate-500">
                          <p>{tx.completedAt ? formatDate(tx.completedAt) : "Initiated"}</p>
                          <p className="text-slate-900 font-black">Rs. {tx.amountNpr.toLocaleString()}</p>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                          <span>Gateway: {tx.gateway}</span>
                          {tx.gatewayTransactionId && (
                            <span className="font-mono">Pidx: {tx.gatewayTransactionId}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Subscription timeline events logs */
                <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-5 py-2">
                  {subscriptionHistoryLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic text-[11px] font-semibold -ml-2">
                      No logs generated.
                    </div>
                  ) : (
                    subscriptionHistoryLogs.map((evt, idx) => (
                      <div key={idx} className="relative">
                        {/* Bullet Icon */}
                        <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                          evt.type === "EXPIRED" 
                            ? "border-rose-500" 
                            : evt.type === "ACTIVATION" || evt.type === "RENEWAL"
                            ? "border-emerald-500"
                            : "border-[#1e3a8a]"
                        }`} />
                        
                        <div className="text-[10px] space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-slate-900">{evt.title}</span>
                            <span className="text-[8px] text-slate-400 font-mono">{evt.date}</span>
                          </div>
                          <p className="text-slate-500 font-semibold text-[10px] leading-relaxed">{evt.desc}</p>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block pt-0.5">
                            Source: {evt.source}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}