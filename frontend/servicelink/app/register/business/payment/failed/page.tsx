import PaymentFailure from "@/components/business/payment/PaymentFailure";

export const metadata = {
  title: "Payment Failed - ServiceLink",
  description: "Your payment could not be processed",
};

export default function PaymentFailedPage() {
  return <PaymentFailure />;
}
