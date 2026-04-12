"use client";

import Link from "next/link";
import {
  ArrowRight,
  User,
  Wrench,
  Building2,
  HelpCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

const roles = [
  {
    icon: <User size={22} className="text-gray-500" />,
    title: "Register as User",
    description:
      "Book reliable services for your home or office. Connect with verified professionals in minutes.",
    cta: "Start Booking",
    href: "/register/user",
    ctaColor: "text-blue-600 hover:text-blue-800",
    image: "/images/reguser1.png",
  },
  {
    icon: <Wrench size={22} className="text-gray-500" />,
    title: "Become a Service Provider",
    description:
      "Grow your independent business. Find new customers, manage bookings, and get paid securely.",
    cta: "Join the Network",
    href: "/register/provider",
    ctaColor: "text-orange-500 hover:text-orange-700",
    image: "/images/regprovider2.png",
  },
  {
    icon: <Building2 size={22} className="text-gray-500" />,
    title: "Register as Business",
    description:
      "Enterprise solutions for service teams. Manage staff, track analytics, and scale your organization.",
    cta: "Go Pro",
    href: "/register/business",
    ctaColor: "text-blue-600 hover:text-blue-800",
    image: "/images/regbusiness1.jpeg",
  },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Choose your <span className="text-blue-600">ServiceLink</span>{" "}
            journey
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg mx-auto">
            Select the role that fits you best. Join a trusted network of
            professionals and customers across Nepal.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Card Image */}
              <div className="h-44 w-full bg-gray-200 overflow-hidden">
                {/* <img
                  src={role.image}
                  alt={role.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                /> */}
                <Image
                  src={role.image}
                  alt={role.title}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Icon Badge */}
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-4">
                  {role.icon}
                </div>

                <h2 className="text-base font-semibold text-gray-900 mb-2">
                  {role.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {role.description}
                </p>

                {/* CTA */}
                <Link
                  href={role.href}
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${role.ctaColor} transition-colors`}
                >
                  {role.cta}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Help */}
        <div className="mt-12 text-center text-sm text-gray-400 flex items-center justify-center gap-1">
          <span>Need help choosing?</span>
          <span className="mx-1">·</span>
          <Link
            href="/support"
            className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <HelpCircle size={14} />
            SUPPORT
          </Link>
          <span className="mx-1">·</span>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <FileText size={14} />
            FAQ
          </Link>
        </div>
      </main>
    </div>
  );
}
