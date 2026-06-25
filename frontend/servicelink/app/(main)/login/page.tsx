"use client";

import {
  UserCircle,
  Wrench,
  Building2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

interface RoleCard {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  description: string;
  signInColor: string;
  badge?: string;
  href: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    id: "user",
    icon: <UserCircle size={26} />,
    iconBg: "bg-[#e8edf8]",
    iconColor: "text-[#1e3a8a]",
    label: "Sign in as User",
    description:
      "Access your bookings, track services, and connect with verified professionals.",
    signInColor: "text-[#1e3a8a] hover:text-[#1e3a8a]",
    href: "/login/user",
  },
  {
    id: "provider",
    icon: <Wrench size={26} />,
    iconBg: "bg-[#fde8d8]",
    iconColor: "text-[#e8683f]",
    label: "Service Provider",
    description:
      "Manage your bookings, respond to clients, and grow your independent business.",
    signInColor: "text-[#e8683f] hover:text-[#d95a2f]",
    href: "/login/provider",
  },
  {
    id: "business",
    icon: <Building2 size={26} />,
    iconBg: "bg-[#e8edf8]",
    iconColor: "text-[#1e3a8a]",
    label: "Business Organization",
    description:
      "Access your enterprise dashboard, manage your team, and track analytics.",
    signInColor: "text-[#1e3a8a] hover:text-[#1e3a8a]",
    badge: "Enterprise",
    href: "/login/business",
  },
];

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#e8edf5] flex flex-col">
      {/*<Navbar />*/}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1e3a8a] mb-3">
            Welcome back to <span className="text-[#e8683f]">ServiceLink</span>
          </h1>
          <p className="text-gray-500 text-base">
            Select how you'd like to sign in and access your account.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl">
          {ROLE_CARDS.map((card) => (
            <div
              key={card.id}
              className="relative bg-white rounded-2xl border border-gray-200 p-7 flex flex-col hover:shadow-md transition group"
            >
              {/* Enterprise badge */}
              {card.badge && (
                <span className="absolute top-4 right-4 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {card.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-5`}
              >
                {card.icon}
              </div>

              {/* Label */}
              <h2 className="text-base font-bold text-[#1e3a8a] mb-2">
                {card.label}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-6">
                {card.description}
              </p>

              {/* Sign In link */}
              <Link
                href={card.href}
                className={`flex items-center gap-1.5 text-sm font-bold ${card.signInColor} transition`}
              >
                Sign In <span>→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer help */}
        <div className="flex items-center gap-5 mt-12 text-sm text-gray-400">
          <span>Need help?</span>
          <Link
            href="/support"
            className="flex items-center gap-1.5 hover:text-gray-600 transition"
          >
            <HelpCircle size={14} />
            SUPPORT
          </Link>
          <Link
            href="/faq"
            className="flex items-center gap-1.5 hover:text-gray-600 transition"
          >
            <BookOpen size={14} />
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
