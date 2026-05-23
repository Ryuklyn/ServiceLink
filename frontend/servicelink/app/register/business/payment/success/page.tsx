import PaymentSuccess from "@/components/business/payment/PaymentSuccess";
import { BusinessSetupProvider } from "@/contexts/BusinessSetupContext";

export const metadata = {
  title: "Payment Successful - ServiceLink",
  description: "Your payment has been processed successfully",
};

export default function PaymentSuccessPage() {
  return (
    <BusinessSetupProvider>
      <PaymentSuccess />
    </BusinessSetupProvider>
  );
}
