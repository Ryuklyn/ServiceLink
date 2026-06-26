import Link from "next/link";
import Image from "next/image";
import {
    Target,
    Telescope,
    User,
    Wrench,
    Building2,
    Mail,
    Phone,
    MapPin,
    Clock,
    Handshake,
    Zap,
    TrendingUp,
    ArrowRight, ShieldCheck, Users,
} from "lucide-react";
// import { GiNepal } from "react-icons/gi";

const AUDIENCES = [
    {
        icon: User,
        iconBg: "bg-blue-100",
        iconColor: "text-[#1e3a8a]",
        title: "For Customers",
        desc: "Browse 50+ verified service categories, book by time slot, pay securely via eSewa or Khalti, and track your provider in real time. Simple, safe, reliable.",
    },
    {
        icon: Wrench,
        iconBg: "bg-orange-100",
        iconColor: "text-[#e8683f]",
        title: "For Providers",
        desc: "A steady stream of bookings without chasing clients. Set your own schedule, build your reputation through ratings, and get paid automatically after every job.",
    },
    {
        icon: Building2,
        iconBg: "bg-blue-100",
        iconColor: "text-[#1e3a8a]",
        title: "For Businesses",
        desc: "ServiceLink Pro gives hotels, hospitals, and organizations a dedicated enterprise dashboard to source, schedule, and manage verified service providers in bulk.",
    },
];

const STATS = [
    { icon: User, value: "10,000+", label: "Users Served across Nepal" },
    { icon: Target, value: "500+", label: "Verified Providers" },
    { icon: Building2, value: "50+", label: "Service Categories" },
    { icon: Clock, value: "2+", label: "Years of Development" },
];

const TECH_STACK = [
    { name: "Java Spring Boot", color: "text-green-600" },
    { name: "NEXT.js", color: "text-gray-900" },
    { name: "MySQL", color: "text-blue-500" },
    { name: "eSewa", color: "text-green-600" },
    { name: "Khalti", color: "text-purple-700" },
    { name: "twilio", color: "text-red-500" },
    { name: "Supabase", color: "text-green-500" },
];

function NepalFlagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 2v20h2V14.5l8 4.5v-6l-8-4.5V2H3zm2 2h1.764L13 7.5v3L5 6V4z" />
        </svg>
    );
}

const CORE_VALUES = [
    {
        icon: Handshake,
        iconColor: "text-[#e8683f]",
        title: "Trust First",
        desc: "Every provider is verified. Every payment is secure. Every booking is accountable.",
    },
    {
        icon: NepalFlagIcon,
        iconColor: "text-[#e8683f]",
        title: "Nepal First",
        desc: "Built specifically for how Nepalis pay, communicate, and hire. Not a copy-paste of a foreign platform.",
    },
    {
        icon: Zap,
        iconColor: "text-[#e8683f]",
        title: "Simplicity",
        desc: "If it takes more than 3 steps, we rethink it. Booking a service should be as easy as sending a WhatsApp message.",
    },
    {
        icon: TrendingUp,
        iconColor: "text-[#1e3a8a]",
        title: "Merit Over Network",
        desc: "Providers should earn based on skill and reviews — not on who they know. We level the playing field.",
    },
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
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
      <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
        Our Story
      </span>
                        <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                            Built in Nepal.<br />
                            <span className="text-[#e8683f]">Built for</span><br />
                            Nepal.
                        </h1>

                        <p className="mt-5 text-white/80 text-sm sm:text-base leading-relaxed max-w-md">
                            ServiceLink started with a simple frustration — finding a reliable
                            plumber, electrician, or cleaner in Kathmandu shouldn&apos;t be this
                            hard. So we built the platform we wished existed.
                        </p>

                        <div className="mt-7 flex flex-col sm:flex-row gap-3">
                            <button className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group">
                                Explore Services
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold px-6 py-3.5 rounded-xl shadow-lg transition-all">
                                Meet the Team
                            </button>
                        </div>

                        <hr className="mt-6 border-white/20" />

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/80 text-sm">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#e8683f]" />
                              Kathmandu Based
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#e8683f]" />
                              500+ Providers
                            </span>
                            <span className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-[#e8683f]" />
                                  Verified & Trusted
                                </span>
                            <span className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-[#e8683f]" />
                              Nepal-Built
                            </span>
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="hidden lg:flex relative justify-end">
                        <img
                            src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop"
                            alt="Kathmandu Durbar Square"
                            className="w-full max-w-xl object-cover h-[500px] rounded-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* Trust Problem + Mission/Vision */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-[1.2fr_1fr] gap-10">
                    <div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
              Why We Exist
            </span>
                        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                            Nepal&apos;s Service Economy Has a Trust Problem
                        </h2>

                        <div className="mt-4 space-y-4 text-sm text-gray-600 leading-relaxed">
                            <p>
                                Every day, thousands of Nepalis need home and business
                                services — plumbing, electrical work, cleaning, carpentry,
                                and more.
                            </p>
                            <p>
                                But the current system runs on word of mouth, unreliable
                                referrals, and uncertainty. You don&apos;t know if the person
                                showing up is qualified. You don&apos;t know what it&apos;ll
                                cost upfront. You don&apos;t know if they&apos;ll even show
                                up at all.
                            </p>
                            <p>
                                On the other side, skilled professionals — trained
                                electricians, certified plumbers, experienced cleaners —
                                struggle to find consistent work despite having real
                                expertise. Their income depends on knowing the right people,
                                not on the quality of their work.
                            </p>
                            <p className="font-semibold text-gray-800">
                                ServiceLink exists to fix both sides of that problem.
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                        <div className="border border-gray-200 rounded-2xl p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                <Target className="w-6 h-6 text-[#e8683f]" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Our Mission</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                To connect every Nepali home and business with verified,
                                trustworthy local service professionals — making quality
                                service accessible, affordable, and reliable for everyone.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <Telescope className="w-6 h-6 text-[#1e3a8a]" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Our Vision</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                A Nepal where skilled professionals earn consistently based
                                on merit, and every customer gets the service they deserve —
                                transparently priced, on time, every time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* One Platform, Three Audiences */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            The Platform
          </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                        One Platform. Three Audiences.
                    </h2>

                    <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
                        {AUDIENCES.map((aud) => {
                            const Icon = aud.icon;
                            return (
                                <div
                                    key={aud.title}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col"
                                >
                                    <div
                                        className={`w-11 h-11 rounded-full ${aud.iconBg} flex items-center justify-center mb-4`}
                                    >
                                        <Icon className={`w-5 h-5 ${aud.iconColor}`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        {aud.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                                        {aud.desc}
                                    </p>

                                    {aud.title === "For Customers" && (
                                        <div className="mt-5 flex items-center gap-3">
                                            <img
                                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop"
                                                alt="Customer using app"
                                                className="w-16 h-16 rounded-xl object-cover"
                                            />
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs">
                                                <p className="text-green-600 font-semibold flex items-center gap-1">
                                                    ✓ Booking Confirmed
                                                </p>
                                                <p className="text-gray-500">
                                                    Plumbing Service · Today, 2:00 PM
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {aud.title === "For Providers" && (
                                        <div className="mt-5 flex items-center gap-3">
                                            <img
                                                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=300&auto=format&fit=crop"
                                                alt="Provider with arms crossed"
                                                className="w-16 h-16 rounded-xl object-cover"
                                            />
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs">
                                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                                    4.8 ★
                                                </p>
                                                <p className="text-gray-500">(128 reviews)</p>
                                            </div>
                                        </div>
                                    )}

                                    {aud.title === "For Businesses" && (
                                        <div className="mt-5">
                                            <img
                                                src="/images/proimage.png"
                                                alt="ServiceLink Pro dashboard preview"
                                                className="w-full h-20 object-contain object-right"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] py-10">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {STATS.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="flex items-center gap-3 justify-center sm:justify-start"
                            >
                                <Icon className="w-7 h-7 text-white/80 flex-shrink-0" />
                                <div>
                                    <p className="text-xl sm:text-2xl font-extrabold text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-white/70">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-4 lg:px-8 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            How We Built It
          </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                        Production-Grade Technology, Nepal-First Design
                    </h2>

                    <div className="mt-5 space-y-3 text-sm text-gray-600 leading-relaxed text-left sm:text-center max-w-3xl mx-auto">
                        <p>
                            ServiceLink is built on a modern, scalable technology stack —
                            Java Spring Boot backend, Next.js frontend, MySQL database, and
                            real integrations with the tools Nepalis already use every
                            day.
                        </p>
                        <p>
                            WhatsApp OTP verification via Twilio means no separate app
                            download. eSewa and Khalti payment integration means payments
                            feel familiar and trusted. Supabase-powered media storage
                            means provider profiles load fast and look professional.
                        </p>
                        <p>
                            Every technical decision was made with one question in mind —
                            does this work for Nepal?
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        {TECH_STACK.map((tech) => (
                            <span
                                key={tech.name}
                                className={`border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-semibold ${tech.color}`}
                            >
                {tech.name}
              </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-16">
                <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl mx-4 lg:mx-8 px-8 lg:px-12 py-16">
                    <div className="max-w-5xl mx-auto grid sm:grid-cols-[220px_1fr] gap-10 items-start">

                        {/* Left: Photo + title */}
                        <div className="flex flex-col items-center text-center gap-3">
                            <Image
                                src="/images/Rukesh.webp"
                                alt="Rukesh Maharjan, founder"
                                width={800}
                                height={800}
                                className="w-full h-56 sm:h-60 rounded-2xl object-cover border-4 border-white/20"
                            />
                            <div>
                                <p className="text-white font-extrabold text-base tracking-wide">
                                    Rukesh Maharjan
                                </p>
                                <p className="text-[#e8683f] text-xs font-semibold mt-0.5 uppercase tracking-wider">
                                    Founder of ServiceLink
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 w-fit">
                                <Image
                                    src="/images/SL.png"
                                    alt="ServiceLink Logo"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                                <span className="font-extrabold text-sm text-[#1e3a8a]">
                                    Service<span className="text-[#e8683f]">Link</span>
                                  </span>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
                              Who Built This
                            </span>
                            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-white">
                                Made by a Developer Who{" "}
                                <span className="text-[#e8683f]">Understood the Problem</span>
                            </h2>

                            <p className="mt-4 text-sm text-white/80 leading-relaxed">
                                ServiceLink Nepal was designed and built by{" "}
                                <span className="text-white font-bold">Rukesh Maharjan</span>, a
                                final-semester BICT student at Virinchi College, Lalitpur — as
                                both a final year project and a genuine attempt to solve a real
                                problem in Nepal&apos;s local services economy.
                            </p>
                            <p className="mt-3 text-sm text-white/80 leading-relaxed">
                                With hands-on experience in full stack development, a certified
                                background in Solana blockchain development, and a 3-month
                                internship at Panda Infosys — ServiceLink reflects what happens
                                when technical skill meets a problem worth solving.
                            </p>
                            <p className="mt-4 text-sm font-semibold text-white">
                                This isn&apos;t just a college project. It&apos;s a platform built to work.
                            </p>

                            <hr className="mt-6 border-white/20" />

                            <div className="mt-6 flex flex-wrap gap-4">
                                <a
                                href="https://github.com/Ryuklyn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#e8683f] border border-white/20 hover:bg-white/20 rounded-xl px-4 py-2.5 transition"
                                >
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">
                                  <span className="block font-semibold text-white">GitHub</span>
                                  <span className="text-white/60 text-xs">github.com/Ryuklyn</span>
                                </span>
                            </a>

                            <a
                            href="https://www.linkedin.com/in/rukesh-maharjan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#e8683f] border border-white/20 hover:bg-white/20 rounded-xl px-4 py-2.5 transition"
                            >
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
                            </svg>
                            <span className="text-sm">
                              <span className="block font-semibold text-white">LinkedIn</span>
                              <span className="text-white/60 text-xs">linkedin.com/in/rukesh-maharjan</span>
                            </span>
                        </a>
                        </div>
                        </div>

                    </div>
                </div>
        </section>

    {/* Core Values */}
    <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
            What We Stand For
          </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e3a8a]">
                Our Core Values
            </h2>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
                {CORE_VALUES.map((val) => {
                    const Icon = val.icon;
                    return (
                        <div
                            key={val.title}
                            className="border border-gray-200 rounded-2xl p-5"
                        >
                            <Icon className={`w-6 h-6 ${val.iconColor} mb-3`} />
                            <h3 className="font-bold text-gray-900 mb-1.5">
                                {val.title}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {val.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    </section>

    {/* Contact Info */}
    <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-[1fr_1fr_1fr] gap-8">
            <div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#e8683f]">
              Get In Touch
            </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#1e3a8a]">
                    We&apos;d Love to Hear From You
                </h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    Whether you&apos;re a customer with feedback, a provider with
                    questions, or a business interested in ServiceLink Pro —
                    we&apos;re here.
                </p>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#e8683f]" />
                    servicelink1607@gmail.com
                </p>
                <p className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#e8683f]" />
                    +977-01-4XXXXXX
                </p>
                <p className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#e8683f]" />
                    Putalisadak, Kathmandu, Nepal
                </p>
                <p className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#e8683f]" />
                    Sunday – Friday, 9 AM – 6 PM NPT
                </p>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
                <a
                href="https://www.facebook.com/ryuklyn.king/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#1e3a8a] transition"
                >
                {/*<Facebook className="w-4 h-4 text-blue-600" />*/}
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 12.073c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.988C18.343 21.201 22 17.064 22 12.073z" />
                    </svg>
                <span>
                <span className="block font-semibold">Facebook</span>
                <span className="text-gray-500 text-xs">
                  /servicelinknepal
                </span>
              </span>
            </a>
            <a
            href="https://www.instagram.com/mohrjn/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:text-[#1e3a8a] transition"
            >
            {/*<Instagram className="w-4 h-4 text-pink-600" />*/}
                <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
            <span>
                <span className="block font-semibold">Instagram</span>
                <span className="text-gray-500 text-xs">
                  @servicelink.np
                </span>
              </span>
        </a>
        <a
        href="https://x.com/Rukeshmaharja12"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 hover:text-[#1e3a8a] transition"
        >
        {/*<Twitter className="w-4 h-4 text-gray-900" />*/}
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        <span>
                <span className="block font-semibold">Twitter / X</span>
                <span className="text-gray-500 text-xs">
                  @servicelink_np
                </span>
              </span>
    </a>
</div>
</div>
</section>

    {/* Final CTA */}
    <section className="relative bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] overflow-hidden py-14">
        <svg
            className="absolute left-0 bottom-0 h-full w-auto opacity-10"
            viewBox="0 0 400 200"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMax slice"
        >
            <g>
                <rect x="20" y="170" width="50" height="25" />
                <polygon points="5,170 95,170 80,150 30,150" />
                <circle cx="45" cy="120" r="22" />
            </g>
        </svg>
        <svg
            className="absolute right-0 bottom-0 h-full w-auto opacity-10"
            viewBox="0 0 400 200"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMax slice"
        >
            <g>
                <rect x="330" y="170" width="50" height="25" />
                <polygon points="315,170 405,170 390,150 340,150" />
                <circle cx="355" cy="120" r="22" />
            </g>
        </svg>

        <div className="relative max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready to Experience ServiceLink?
            </h2>
            <p className="mt-3 text-white/80 text-sm max-w-xl mx-auto">
                Whether you need a service, want to earn as a provider, or want
                to streamline your business operations — ServiceLink Nepal has
                you covered.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                    href="/services"
                    className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl shadow-lg transition-all group"
                >
                    Book a Service
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                    href="/become-a-provider"
                    className="bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold px-6 py-3.5 rounded-xl shadow-lg transition-all"
                >
                    Become a Provider
                </Link>
                <Link
                    href="/servicelink-pro"
                    className="border-2 border-white text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all"
                >
                    Explore ServiceLink Pro
                </Link>
            </div>
        </div>
    </section>
</div>
);
}