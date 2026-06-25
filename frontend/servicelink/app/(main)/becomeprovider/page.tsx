"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    Calendar,
    Wallet,
    CalendarClock,
    Clock,
    Briefcase,
    IndianRupee,
    Shield,
    Star,
    ChevronUp,
    ChevronDown,
    IdCard,
    Award,
    User,
    MapPin,
    Check,
} from "lucide-react";
import { FaLeaf } from "react-icons/fa";

const WHY_JOIN = [
    {
        icon: IndianRupee,
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
        title: "Earn Consistently",
        desc: "Stop depending on word-of-mouth. ServiceLink connects you with customers actively looking for your skills — daily.",
    },
    {
        icon: Calendar,
        iconColor: "text-[#1e3a8a]",
        iconBg: "bg-blue-100",
        title: "Work on Your Terms",
        desc: "You control your availability. Accept bookings that fit your schedule and reject ones that don't. No pressure, full flexibility.",
    },
    {
        icon: Shield,
        iconColor: "text-[#e8683f]",
        iconBg: "bg-orange-100",
        title: "Build Trust Instantly",
        desc: "Your ServiceLink Verified badge signals credibility to every customer before you even arrive. Background-checked, certified, trusted.",
    },
];

const STEPS = [
    {
        num: "01",
        icon: User,
        title: "Create Your Profile",
        desc: "Sign up and fill in your details — name, service category, location, and a short bio about your expertise.",
    },
    {
        num: "02",
        icon: ShieldCheck,
        title: "Submit for Verification",
        desc: "Upload your citizenship ID and relevant certifications (CTEVT, NSTB, or equivalent). We review and approve within 1-2 business days.",
    },
    {
        num: "03",
        icon: Clock,
        title: "Set Your Availability",
        desc: "Define your working hours and service area. Customers will only see you when you're available.",
    },
    {
        num: "04",
        icon: Briefcase,
        title: "Start Getting Booked",
        desc: "Go live, receive booking requests, complete jobs, and get paid — directly to your eSewa or Khalti.",
    },
];

const PLANS = [
    {
        name: "Monthly",
        price: "500",
        period: "/mo",
        badge: null,
        save: null,
        features: [
            "All platform features",
            "Unlimited booking requests",
            "Earnings dashboard",
            "Customer messaging",
            "Priority search listing",
            "eSewa & Khalti payouts",
        ],
        cta: "Choose Monthly Plan",
        highlighted: false,
    },
    {
        name: "Quarterly",
        price: "1,200",
        period: "/3mo",
        badge: "Most Popular",
        save: "Save Rs. 300",
        features: [
            "All platform features",
            "Unlimited booking requests",
            "Earnings dashboard",
            "Customer messaging",
            "Priority search listing",
            "eSewa & Khalti payouts",
        ],
        cta: "Choose Quarterly Plan",
        highlighted: true,
    },
    {
        name: "Yearly",
        price: "4,000",
        period: "/yr",
        badge: null,
        save: "Save Rs. 2,300 ★ Best Value",
        features: [
            "All platform features",
            "Unlimited booking requests",
            "Earnings dashboard",
            "Customer messaging",
            "Priority search listing",
            "eSewa & Khalti payouts",
        ],
        cta: "Choose Yearly Plan",
        highlighted: false,
    },
];

const PREPARE_ITEMS = [
    {
        icon: IdCard,
        title: "Valid ID",
        desc: "Citizenship card or national identity document",
    },
    {
        icon: Award,
        title: "Certification (If applicable)",
        desc: "CTEVT, NSTB, or relevant trade certification",
    },
    {
        icon: User,
        title: "Profile Photo",
        desc: "A clear, professional photo so customers recognize you",
    },
    {
        icon: MapPin,
        title: "Service Area",
        desc: "The district or neighborhood you operate in",
    },
];

const FAQS = [
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

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
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

export default function BecomeAProviderPage() {
    const [hoursPerDay, setHoursPerDay] = useState(6);
    const [daysPerWeek, setDaysPerWeek] = useState(5);
    const [serviceType, setServiceType] = useState("Plumbing");

    const baseRates: Record<string, number> = {
        Plumbing: 500,
        Electrical: 600,
        Cleaning: 350,
        Carpentry: 450,
    };

    const estimatedMonthly =
        (baseRates[serviceType] || 500) * hoursPerDay * daysPerWeek * 4;

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-[#1e3a8a] py-16">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                            <span className="text-white">Turn Your Skills Into</span>
                            <br />
                            <span className="text-[#e8683f]">Steady</span>{" "}
                            <span className="text-white">Income.</span>
                        </h1>
                        <p className="mt-5 text-white leading-relaxed max-w-md">
                            Join 500+ verified professionals already earning through
                            ServiceLink Nepal. Customers come to you — you just show up and
                            deliver.
                        </p>

                        <div className="mt-7 flex flex-col sm:flex-row gap-3">
                            <button className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group">
                                Register as a Provider
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="text-[#1e3a8a] bg-white font-semibold flex items-center justify-center px-6 py-3.5 rounded-xl hover:bg-white transition-all">
                                See Pricing Plans
                            </button>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 text-white">
                <ShieldCheck className="w-4 h-4 text-[#e8683f] font-semibold" />
                Verified Badge
              </span>
                            <span className="flex items-center gap-1.5 text-white">
                <CalendarClock className="w-4 h-4 text-[#e8683f] font-semibold" />
                Flexible Schedule
              </span>
                            <span className="flex items-center gap-1.5 text-white">
                <FaLeaf className="w-3.5 h-3.5 text-[#e8683f] font-semibold" />
                Fast Payments
              </span>
                            <span className="flex items-center gap-1.5 text-white">
                <MapPin className="w-4 h-4 text-[#e8683f] font-semibold" />
                Nepal-Built
              </span>
                        </div>
                    </div>

                    {/* Right: Image + Floating Stats Card */}
                    <div className="relative flex justify-center lg:justify-end">
                        <img
                            src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1000&auto=format&fit=crop"
                            alt="Verified ServiceLink provider"
                            className="w-full max-w-sm rounded-2xl object-cover h-[420px]"
                        />

                        <div className="absolute -right-2 sm:right-4 bottom-6 bg-white rounded-2xl shadow-xl p-5 w-48 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500">Total Earnings</p>
                                <p className="font-bold text-gray-900">Rs. 45,680</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Completed Jobs</p>
                                <p className="font-bold text-gray-900">
                                    128{" "}
                                    <span className="text-green-600 text-xs font-semibold">
                    ↑ 18%
                  </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Rating</p>
                                <p className="font-bold text-gray-900 flex items-center gap-1">
                                    4.8 <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold pt-1 border-t border-gray-100">
                                <Check className="w-3.5 h-3.5" />
                                Verified Provider
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            Why Join ServiceLink
          </span>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1e3a8a]">
                        Everything a Professional Needs to Grow
                    </h2>

                    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        {WHY_JOIN.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="border border-gray-200 rounded-2xl p-6"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg} mb-4`}
                                    >
                                        <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4 Steps Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            Simple Process
          </span>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1e3a8a]">
                        Start Earning in 4 Steps
                    </h2>

                    <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.num} className="relative">
                                    {idx < STEPS.length - 1 && (
                                        <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] border-t-2 border-dashed border-gray-300" />
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
                                        <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-[220px]">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            Provider Plans
          </span>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1e3a8a]">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                        Start with a 30-day free trial. No hidden fees. Cancel anytime.
                        All plans include unlimited booking requests, earnings dashboard,
                        customer messaging, and priority search listing.
                    </p>

                    <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left items-stretch">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl p-6 flex flex-col ${
                                    plan.highlighted
                                        ? "border-2 border-[#e8683f] shadow-xl"
                                        : "border border-gray-200"
                                }`}
                            >
                                {plan.badge && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8683f] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                                )}

                                <h3 className="font-bold text-[#1e3a8a] mt-2">{plan.name}</h3>
                                <p className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    Rs. {plan.price}
                  </span>
                                    <span className="text-gray-500">{plan.period}</span>
                                </p>
                                {plan.save && (
                                    <p className="text-xs font-semibold text-[#e8683f] mt-1">
                                        {plan.save}
                                    </p>
                                )}

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
                </div>
            </section>

            {/* Verification + Earnings Calculator */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-8">
                    {/* What to Prepare */}
                    <div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
              Verification
            </span>
                        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                            What to Prepare Before Registering
                        </h2>
                        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                            ServiceLink verifies every provider to protect customers and
                            build platform trust.
                        </p>

                        <div className="mt-6 grid sm:grid-cols-2 gap-4">
                            {PREPARE_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="border border-gray-200 rounded-xl p-4 bg-white"
                                    >
                                        <Icon className="w-5 h-5 text-[#1e3a8a] mb-2" />
                                        <h4 className="font-semibold text-sm text-gray-900">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-4 h-4" />
                            Verification typically takes 1-2 business days. You&apos;ll be
                            notified via WhatsApp once approved.
                        </p>
                    </div>

                    {/* Earnings Calculator */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            See How Much You Can Earn
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Estimate your monthly income based on your service type and
                            availability.
                        </p>

                        <div className="mt-6 space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-700">
                                    Service Type
                                </label>
                                <select
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1e3a8a]"
                                >
                                    {Object.keys(baseRates).map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="font-semibold text-gray-700">
                                        Hours per day: 2 – 8 hrs
                                    </label>
                                    <span className="border border-gray-300 rounded-md px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {hoursPerDay} hrs
                  </span>
                                </div>
                                <input
                                    type="range"
                                    min={2}
                                    max={8}
                                    value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                                    className="mt-3 w-full accent-[#1e3a8a]"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-sm">
                                    <label className="font-semibold text-gray-700">
                                        Days per week: 1 – 7 days
                                    </label>
                                    <span className="border border-gray-300 rounded-md px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {daysPerWeek} days
                  </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={7}
                                    value={daysPerWeek}
                                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                                    className="mt-3 w-full accent-[#1e3a8a]"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Estimated Monthly Earning
                                    </p>
                                    <p className="text-2xl font-extrabold text-green-600">
                                        Rs. {estimatedMonthly.toLocaleString()}
                                    </p>
                                </div>
                                <Wallet className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 lg:px-8">
                    <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] mb-10">
                        Common Questions from Providers
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {FAQS.map((faq) => (
                            <FaqItem key={faq.q} faq={faq} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                className="relative py-16 bg-cover bg-center bg-no-repeat overflow-hidden"
                style={{ backgroundImage: "url('images/CTA.png')" }}
            >
                {/* Transparent Gradient Overlay with Blur */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/95 via-[#1e3a8a]/85 to-[#1e40af]/90 backdrop-blur-[2px]" />

                {/* Content Container */}
                <div className="relative z-10 max-w-3xl mx-auto px-4 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                        Ready to Start Earning?
                    </h2>
                    <p className="mt-3 text-white/80">
                        Whether you&apos;re a plumber, electrician, cleaner, or carpenter
                        — ServiceLink connects you with customers who need you right now.
                    </p>

                    <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
                        <Link
                            href="/register"
                            className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group"
                        >
                            Create Provider Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold px-6 py-3.5 rounded-xl shadow-lg transition-all">
                            View Pricing Plans
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}