"use client";

import {
  ArrowRight,
  Building2,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import type { PlanCheckout } from "@/components/business/PlanStep";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";
import api from "@/utils/axios";
import { toast } from "react-toastify";

interface PaymentModalProps {
  isOpen: boolean;
  plan: PlanCheckout;
  workspaceName: string;
  subscriptionId?: number;
  onClose: () => void;
  onContinue: () => void;
}

type PaymentMethod = {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: typeof WalletCards;
  iconClassName: string;
  disabled?: boolean;
};

type PaymentInitiateResponse = {
  referenceId?: string;
  gatewayRedirectUrl?: string;
  gatewayMethod?: string;
  gatewayFormFields?: Record<string, string>;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "ESEWA",
    name: "eSewa",
    label: "Wallet",
    description: "Pay instantly with your eSewa wallet.",
    icon: WalletCards,
    iconClassName: "text-emerald-600",
  },
  {
    id: "KHALTI",
    name: "Khalti",
    label: "Wallet",
    description: "Secure digital payment & verification.",
    icon: WalletCards,
    iconClassName: "text-violet-600",
  },
  {
    id: "BANK_TRANSFER",
    name: "Bank Transfer",
    label: "Manual",
    description: "Wire funds directly with a reference ID.",
    icon: Landmark,
    iconClassName: "text-[#1e3a8a]",
    disabled: true,
  },
];

export default function PaymentModal({
  isOpen,
  plan,
  workspaceName,
  subscriptionId,
  onClose,
  onContinue,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("ESEWA");
  const [loading, setLoading] = useState(false);
  const { data, setPayment } = useBusinessSetup();

  if (!isOpen) {
    return null;
  }

  const handleContinuePayment = async () => {
    try {
      setLoading(true);

      if (!subscriptionId) {
        toast.error("Subscription ID not found");
        return;
      }

      const payload = {
        subscriptionId,
        paymentGateway: selectedMethod,
        amountNpr: plan.amountNpr,
        successUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/register/business/payment/success`,
        failureUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/register/business/payment/failed`,
      };

      const response = await api.post<PaymentInitiateResponse>(
        "/business/payment/initiate",
        payload,
      );

      console.log("Payment Initiated:", response.data);

      if (response.data.referenceId) {
        localStorage.setItem("paymentReference", response.data.referenceId);
        setPayment(response.data.referenceId, "INITIATED");
      }

      const paymentDraft = {
        ...data,
        subscriptionId,
        planType: plan.name,
        amountNpr: plan.amountNpr,
        paymentReferenceId: response.data.referenceId,
        paymentStatus: "INITIATED",
        paymentGateway: selectedMethod,
      };
      localStorage.setItem("businessSetup", JSON.stringify(paymentDraft));
      sessionStorage.setItem("businessSetupDraft", JSON.stringify(paymentDraft));
      sessionStorage.setItem(
        "paymentInitiateResponse",
        JSON.stringify(response.data),
      );
      onContinue();

      if (
        response.data.gatewayMethod === "POST" &&
        response.data.gatewayRedirectUrl &&
        response.data.gatewayFormFields
      ) {
        submitGatewayForm(
          response.data.gatewayRedirectUrl,
          response.data.gatewayFormFields,
        );
        return;
      }

      if (response.data.gatewayRedirectUrl) {
        window.location.assign(response.data.gatewayRedirectUrl);
      }
    } catch (error: unknown) {
      console.error("Payment Initiation Error:", error);
      const errorMessage =
        getPaymentErrorMessage(error) ||
        "Failed to initiate payment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentErrorMessage = (error: unknown) => {
    if (error && typeof error === "object") {
      const maybeError = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      return maybeError.response?.data?.message || maybeError.message;
    }
    return null;
  };

  const submitGatewayForm = (
    actionUrl: string,
    fields: Record<string, string>,
  ) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.style.display = "none";

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl md:grid-cols-[300px_1fr]">
        <aside className="bg-[#1e3a8a] px-7 py-9 text-white">
          <h2 className="text-2xl font-extrabold leading-tight">
            Complete your subscription
          </h2>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            Review your plan and choose how you&apos;d like to pay.
          </p>

          <div className="mt-7 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
              Selected plan
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-extrabold">{plan.name}</span>
              <span className="pb-1 text-xs text-blue-100">workspace</span>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-blue-100">Price</dt>
                <dd className="font-bold">{plan.price}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-blue-100">Billing cycle</dt>
                <dd className="font-bold">{plan.priceLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-blue-100">Workspace</dt>
                <dd className="font-bold">{workspaceName}</dd>
              </div>
            </dl>
            <div className="my-5 border-t border-white/20" />
            <div className="flex justify-between gap-4">
              <span className="text-sm text-blue-100">Due today</span>
              <span className="text-xl font-extrabold">{plan.price}</span>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-3 text-sm text-blue-100">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            <p>Encrypted checkout. Cancel anytime from billing settings.</p>
          </div>
        </aside>

        <section className="relative px-7 py-8 sm:px-9">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            className="absolute right-5 top-5 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>

          <p className="text-xs font-bold uppercase tracking-wide text-[#e8683f]">
            Payment method
          </p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950">
            How would you like to pay?
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            You&apos;ll complete payment on the next screen.
          </p>

          <div className="mt-5 space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={method.disabled}
                  className={`flex w-full items-center gap-4 rounded-2xl border bg-slate-50 px-4 py-4 text-left transition ${
                    method.disabled
                      ? "cursor-not-allowed opacity-50"
                      : isSelected
                        ? "border-[#1e3a8a] ring-2 ring-[#1e3a8a]"
                        : "border-slate-200 hover:border-[#1e3a8a]/50"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8edf5]">
                    <Icon size={21} className={method.iconClassName} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-950">
                        {method.name}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {method.label}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {method.description}
                    </span>
                  </span>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-[#1e3a8a] bg-[#1e3a8a]"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleContinuePayment}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#e8683f] px-6 py-4 text-sm font-bold text-white shadow-[0_18px_30px_rgba(232,104,63,0.25)] transition hover:bg-[#d95a2f] disabled:bg-gray-300"
          >
            {loading ? "Processing..." : "Continue to payment"}
            <ArrowRight size={17} />
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Building2 size={13} />
            Billed to {workspaceName}
          </div>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-500">
            <LockKeyhole size={12} />
            Secure checkout
          </div>
        </section>
      </div>
    </div>
  );
}
