const FAQ_COLUMNS = [
  [
    ["How do I book a service?", "Choose a service, select a verified provider and suitable time slot, then submit your booking request from ServiceLink."],
    ["How do I know a provider is trustworthy?", "ServiceLink verifies provider identity and profile details before they are eligible to receive customer bookings. Reviews and ratings help you choose with confidence."],
    ["Can I reschedule or cancel a booking?", "Yes. Manage eligible booking changes from your dashboard. Any cancellation terms are shown before you confirm the change."],
    ["When is payment handled?", "Your booking shows the expected price and payment status clearly. ServiceLink supports familiar Nepal payment methods where available."],
    ["How can I track my service request?", "Your dashboard keeps the booking status, provider updates, and important notifications together in one place."],
  ],
  [
    ["How can I become a ServiceLink provider?", "Register a provider account, complete your profile and KYC requirements, then set your services, availability, and service area."],
    ["When does the provider free trial begin?", "Eligible providers receive their one-month free trial after successful KYC verification, so customers are connected with verified professionals."],
    ["What is ServiceLink Pro for businesses?", "ServiceLink Pro helps organizations manage provider pools, job tickets, team access, SLA monitoring, compliance, and billing from one workspace."],
    ["Can a business choose its own providers?", "Yes. Organizations can browse eligible providers and build a private provider pool. Providers remain in control of whether they accept Pro work."],
    ["Where can I get help?", "Start with these FAQs or contact ServiceLink support through the platform for account, booking, provider, or business-workspace assistance."],
  ],
] as const;

export default function FAQ() {
  return <section id="home-faqs" className="scroll-mt-24 bg-gray-50 py-20">
    <div className="max-w-7xl mx-auto px-4 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-sm font-semibold tracking-widest text-[#e8683f] uppercase mb-3">Help Center</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a]">Frequently Asked Questions</h2>
        <p className="mt-3 text-sm text-gray-600">Answers for customers, service providers, and ServiceLink Pro organizations.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {FAQ_COLUMNS.map((column, columnIndex) => <div key={columnIndex} className="space-y-4">
          {column.map(([question, answer]) => <details key={question} className="group bg-white border border-gray-200 rounded-xl px-5 py-4">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-gray-900 text-sm">
              {question}<span className="text-[#e8683f] group-open:rotate-45 transition-transform text-xl">+</span>
            </summary>
            <p className="pt-3 text-sm leading-relaxed text-gray-600">{answer}</p>
          </details>)}
        </div>)}
      </div>
    </div>
  </section>;
}
