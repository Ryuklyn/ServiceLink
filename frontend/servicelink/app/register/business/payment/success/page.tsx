import { Suspense } from "react";
import PaymentSuccess from "@/components/business/payment/PaymentSuccess";
import { BusinessSetupProvider } from "@/contexts/BusinessSetupContext";

export const metadata = {
  title: "Payment Successful - ServiceLink",
  description: "Your payment has been processed successfully",
};

export default function PaymentSuccessPage() {
  return (
    <BusinessSetupProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500 font-medium">Loading details...</div>}>
        <PaymentSuccess />
      </Suspense>
    </BusinessSetupProvider>
  );
}
