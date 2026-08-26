import { Suspense } from "react";
import PaymentFailure from "@/components/business/payment/PaymentFailure";
import { BusinessSetupProvider } from "@/contexts/BusinessSetupContext";

export const metadata = {
  title: "Payment Failed - ServiceLink",
  description: "Your payment could not be processed",
};

export default function PaymentFailedPage() {
  return (
    <BusinessSetupProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500 font-medium">Loading details...</div>}>
        <PaymentFailure />
      </Suspense>
    </BusinessSetupProvider>
  );
}
