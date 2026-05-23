import PaymentFailure from "@/components/business/payment/PaymentFailure";
import { BusinessSetupProvider } from "@/contexts/BusinessSetupContext";

export const metadata = {
  title: "Payment Failed - ServiceLink",
  description: "Your payment could not be processed",
};

export default function PaymentFailedPage() {
  return (
    <BusinessSetupProvider>
      <PaymentFailure />
    </BusinessSetupProvider>
  );
}
