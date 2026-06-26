
"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    ClipboardList,
    BarChart3,
    ShieldCheck,
    Check,
    Building2,
    Users,
    Briefcase,
    Hammer,
    Building,
    Hotel,
    HardHat,
    Radar,
    CalendarClock,
    FileBarChart,
    TrendingUp,
    UserCog,
    CreditCard,
    Clock,
    XCircle, ChevronUp, ChevronDown,
} from "lucide-react";
import { FaUsers } from "react-icons/fa";
import {useState} from "react";

const FEATURES = [
    {
        icon: ClipboardList,
        title: "Bulk Booking",
        desc: "Request multiple providers across departments in one go.",
        items: ["10 cleaners", "5 electricians", "3 plumbers"],
        footer: "from one dashboard.",
    },
    {
        icon: BarChart3,
        title: "Central Dashboard",
        desc: "Manage everything from a single, easy-to-use dashboard.",
        items: ["Jobs", "Payments", "Teams", "Schedules", "Providers", "Reports"],
        footer: "all from one place.",
        twoCol: true,
    },
    {
        icon: ShieldCheck,
        title: "Verified Providers",
        desc: "Every provider on ServiceLink Pro is thoroughly verified.",
        items: ["Identity verified", "Background checked", "Skill reviewed"],
        footer: "before acceptance.",
    },
];

const PLANS = [
    {
        name: "Starter",
        subtitle: "Best for: Small Businesses",
        price: "NPR 4,999",
        period: "/month",
        badge: null,
        features: [
            "Up to 20 service requests",
            "Dashboard access",
            "Provider management",
            "Email support",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Growth",
        subtitle: "Best for: Growing Organizations",
        price: "NPR 14,999",
        period: "/month",
        badge: "Most Popular",
        features: [
            "Unlimited requests",
            "Priority provider matching",
            "Team management",
            "Advanced reporting",
            "Dedicated account manager",
        ],
        cta: "Start Growth Plan",
        highlighted: true,
    },
    {
        name: "Enterprise",
        subtitle: "Best for: Large Enterprises",
        price: "Custom Pricing",
        period: "",
        badge: null,
        features: [
            "Everything in Growth",
            "API Access",
            "White-label Option",
            "SLA Support",
            "Multi-location Management",
            "Custom Integrations",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

const HOW_IT_WORKS = [
    {
        num: "01",
        icon: Building2,
        title: "Register Your Organization",
        desc: "Submit your business details and get verified.",
    },
    {
        num: "02",
        icon: ClipboardList,
        title: "Set Your Requirements",
        desc: "Define service types, frequency, locations, and provider counts.",
    },
    {
        num: "03",
        icon: FaUsers,
        title: "We Handle the Rest",
        desc: "We match, schedule, and manage verified providers for you.",
    },
];

const TRUSTED_ACROSS = [
    {
        title: "Hotel Operations",
        desc: "Managing housekeeping and maintenance teams efficiently.",
        img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Hospital Facilities",
        desc: "Regular cleaning, electrical, and plumbing support you can rely on.",
        img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Corporate Offices",
        desc: "Facility management and scheduled maintenance made simple.",
        img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Construction Projects",
        desc: "Skilled labor and specialist services at scale, on time every time.",
        img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
    },
];
const PRO_FAQS = [
    {
        q: "Is there a free trial?",
        a: "Yes — all new providers get 30 days free with full access to all features before choosing a plan.",
    },
    {
        q: "When do I receive payment after completing a job?",
        a: "Payment is released to your eSewa or Khalti account automatically once the job is marked complete by the customer.",
    },
    {
        q: "Can I pause my subscription?",
        a: "Yes, you can pause or cancel your plan anytime from your provider dashboard under Subscription settings.",
    },
    {
        q: "Do I need a certification to join?",
        a: "Certifications are encouraged but not mandatory for all service types. Basic services require ID verification only. Specialized services (electrical, plumbing) require relevant credentials.",
    },
    {
        q: "What if a customer cancels a booking?",
        a: "You'll be notified immediately and the time slot reopens for new bookings. Cancellation policies protect your time.",
    },
];

function ProFaqItem({ faq }: { faq: { q: string; a: string } }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
            >
        <span className="font-semibold text-gray-900 text-sm">
          Q: {faq.q}
        </span>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
            </button>
            {open && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    A: {faq.a}
                </p>
            )}
        </div>
    );
}

const STATS = [
    { icon: Building, value: "100+", label: "Businesses" },
    { icon: Briefcase, value: "5,000+", label: "Jobs Managed" },
    { icon: Users, value: "500+", label: "Verified Providers" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction Rate" },
];

const MANAGE_FEATURES = [
    "Real-time provider tracking",
    "Job scheduling & automation",
    "Service history & reports",
    "Multi-location management",
    "Spending analytics & insights",
    "Team permissions & controls",
];

export default function ServiceLinkProPage() {
    return (
        <div className="bg-white">
            {/* Hero Section with dotted pattern */}
            {/* Hero Section with dotted pattern */}
            <section className="relative bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] overflow-hidden min-h-[88vh] flex items-center">
                {/* Dotted pattern background */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1.5px)",
                        backgroundSize: "16px 16px",
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center w-full">
                    {/* Left: Text */}
                    <div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                            Nepal's Trusted<br />
                            <span className="text-[#e8683f]">Business Service</span><br />
                            Platform.
                        </h1>

                        <p className="mt-5 text-white/80 text-sm sm:text-base leading-relaxed max-w-md">
                            Join 500+ organizations already streamlining their service operations
                            through ServiceLink Pro. Verified providers come to you — you just
                            approve and deliver results.
                        </p>

                        <div className="mt-7 flex flex-col sm:flex-row gap-3">
                            <button className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group">
                                Get Enterprise Access
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold px-6 py-3.5 rounded-xl shadow-lg transition-all">
                                Contact Sales
                            </button>
                        </div>

                        {/* Divider */}
                        <hr className="mt-6 border-white/20" />

                        {/* Trust badges */}
                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/80 text-sm">
                            <span className="flex items-center gap-2">
                              <Hotel className="w-4 h-4 text-[#e8683f]" />
                              Hotels
                            </span>
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#e8683f]" />
                              Hospitals
                            </span>
                            <span className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#e8683f]" />
                              Offices
                            </span>
                            <span className="flex items-center gap-2">
                              <HardHat className="w-4 h-4 text-[#e8683f]" />
                              Contractors
                            </span>
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="hidden lg:flex relative justify-end">
                        <Image
                            src="/images/proimage.png"
                            alt="ServiceLink Pro dashboard on laptop and mobile"
                            width={700}
                            height={600}
                            className="w-full max-w-xl object-contain h-[500px]"
                        />
                    </div>
                </div>
            </section>

            {/* Why Organizations Choose Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                        Why Organizations Choose ServiceLink{" "}
                        <span className="text-[#e8683f]">Pro</span>
                    </h2>

                    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        {FEATURES.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="border border-gray-200 rounded-2xl p-6"
                                >
                                    <div className="w-11 h-11 rounded-full bg-[#1e3a8a] flex items-center justify-center mb-4">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                        {feature.desc}
                                    </p>

                                    <ul
                                        className={`text-sm text-gray-600 gap-y-2 gap-x-4 ${
                                            feature.twoCol
                                                ? "grid grid-cols-2"
                                                : "flex flex-col gap-2"
                                        }`}
                                    >
                                        {feature.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2">
                                                <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <p className="text-xs text-gray-400 mt-4">
                                        {feature.footer}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20">
                <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl mx-4 lg:mx-8 px-4 lg:px-8 py-16">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="mt-2 text-white/70 text-sm">
                            No hidden fees. Cancel anytime.
                        </p>

                        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left items-stretch">
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative bg-white rounded-2xl p-6 flex flex-col ${
                                        plan.highlighted
                                            ? "border-2 border-[#e8683f] shadow-2xl"
                                            : ""
                                    }`}
                                >
                                    {plan.badge && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8683f] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </span>
                                    )}

                                    <h3 className="font-bold text-[#1e3a8a] mt-2">{plan.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{plan.subtitle}</p>

                                    <p className="mt-3">
              <span className="text-2xl font-extrabold text-gray-900">
                {plan.price}
              </span>
                                        {plan.period && (
                                            <span className="text-gray-500 text-sm">
                  {plan.period}
                </span>
                                        )}
                                    </p>

                                    <ul className="mt-5 space-y-2.5 flex-grow">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-center gap-2 text-sm text-gray-600"
                                            >
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all ${
                                            plan.highlighted
                                                ? "bg-[#e8683f] hover:bg-[#d95a2f] text-white shadow-lg"
                                                : "border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a]/5"
                                        }`}
                                    >
                                        {plan.cta}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <p className="mt-8 text-white/70 text-sm">
                            All plans include secure payments, verified providers &amp;
                            dedicated support.
                        </p>
                    </div>
                </div>
            </section>

            {/* How ServiceLink Pro Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                        How ServiceLink <span className="text-[#e8683f]">Pro</span> Works
                    </h2>

                    <div className="mt-14 grid sm:grid-cols-3 gap-10 relative">
                        {HOW_IT_WORKS.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.num} className="relative">
                                    {idx < HOW_IT_WORKS.length - 1 && (
                                        <div className="hidden sm:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] border-t-2 border-dashed border-gray-300" />
                                    )}
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-[#1e3a8a]" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1e3a8a] text-white text-[10px] font-bold flex items-center justify-center">
                                                {step.num}
                                            </div>
                                        </div>
                                        <h3 className="mt-4 font-bold text-gray-900">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-[240px]">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Trusted Across Nepal */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] mb-12">
                        Trusted Across Nepal
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TRUSTED_ACROSS.map((card) => (
                            <div
                                key={card.title}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                            >
                                <div className="h-36 relative">
                                    <img
                                        src={card.img}
                                        alt={card.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-sm text-gray-900 mb-1">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                        {STATS.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex flex-col items-center">
                                    <Icon className="w-6 h-6 text-[#1e3a8a] mb-2" />
                                    <p className="text-xl font-extrabold text-gray-900">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Everything You Need Section */}
            <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Dashboard mockup image */}
                    <div className="relative">
                        <Image
                            src="/images/proimage.png"
                            alt="ServiceLink Pro bookings dashboard"
                            width={600}
                            height={400}
                            className="w-full max-w-lg object-contain"
                        />
                    </div>

                    {/* Right: Feature list */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                            Everything You Need
                            <br />
                            to Manage Services
                        </h2>

                        <ul className="mt-6 space-y-3">
                            {MANAGE_FEATURES.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center gap-3 text-white/90 text-sm"
                                >
                                    <Check className="w-4 h-4 text-[#e8683f] flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 lg:px-8">
                    <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] mb-10">
                        Common Questions about ServiceLink Pro
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left: FAQs */}
                        <div className="flex flex-col gap-4">
                            {PRO_FAQS.map((faq) => (
                                <ProFaqItem key={faq.q} faq={faq} />
                            ))}
                        </div>

                        {/* Right: Image */}
                        <div className="hidden lg:flex justify-center items-start sticky top-24">
                            <img
                                src="/images/servicelinkprofaq.png"
                                alt="ServiceLink Pro FAQ"
                                className="w-full max-w-sm object-contain rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section with Nepal pagoda silhouette */}
            <section className="relative bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] overflow-hidden">
                {/* Pagoda silhouette background */}
                <svg
                    className="absolute left-0 bottom-0 h-full w-auto opacity-10"
                    viewBox="0 0 400 200"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMinYMax slice"
                >
                    {/* Tall pagoda (Nepal-style multi-tier temple) */}
                    <g>
                        <rect x="60" y="170" width="60" height="30" />
                        <polygon points="40,170 140,170 120,150 60,150" />
                        <rect x="70" y="120" width="40" height="30" />
                        <polygon points="55,120 125,120 110,100 70,100" />
                        <rect x="78" y="78" width="24" height="22" />
                        <polygon points="68,78 112,78 100,60 80,60" />
                        <rect x="86" y="45" width="8" height="18" />
                        <circle cx="90" cy="40" r="5" />
                    </g>
                    {/* Smaller pagoda */}
                    <g>
                        <rect x="220" y="180" width="40" height="20" />
                        <polygon points="205,180 275,180 260,165 220,165" />
                        <rect x="227" y="145" width="26" height="20" />
                        <polygon points="216,145 264,145 252,130 228,130" />
                        <rect x="233" y="118" width="14" height="14" />
                        <polygon points="226,118 254,118 240,105 240,105" />
                    </g>
                    {/* Hill / mountain backdrop */}
                    <polygon points="0,200 0,160 90,110 180,160 260,120 340,165 400,140 400,200" />
                </svg>

                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                            Ready to Streamline
                            <br />
                            Your Service Operations?
                        </h2>
                        <p className="mt-3 text-white/80 text-sm max-w-md">
                            Join organizations across Nepal using ServiceLink Pro to manage
                            service providers more efficiently.
                        </p>

                        <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-1 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                No credit card required
              </span>
                            <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                14-day free trial
              </span>
                            <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Cancel anytime
              </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                        <Link
                            href="/register"
                            className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group whitespace-nowrap"
                        >
                            Start Free Trial
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold px-6 py-3.5 rounded-xl shadow-lg transition-all whitespace-nowrap">
                            Talk to Our Team
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}