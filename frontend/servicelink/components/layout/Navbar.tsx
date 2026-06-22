"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search } from "lucide-react";
import { NAV_LINKS } from "@/data/homeData";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 flex-shrink-0"
        >
          <Image
                src="/images/SL.png"
              alt="ServiceLink Logo"
              width={30}
              height={30}
              className="h-12 w-12 object-contain"
              priority
          />

          <h1 className="text-xl font-bold ml-[-4] tracking-tight">
            <span className="text-[#1e3a8a]">Service</span>
            <span className="text-[#e8683f]">Link</span>
          </h1>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="mx-8 hidden w-full max-w-sm items-center rounded-full border border-gray-100 bg-gray-50 px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-[#1e3a8a]/15 md:flex">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1e3a8a]"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="ml-8 hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-[#1e3a8a] px-4 py-2 text-sm font-semibold text-[#1e3a8a] transition-colors hover:bg-[#1e3a8a]/10"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#1e3a8a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e8683f]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="text-gray-600 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t bg-gray-50 px-4 py-6 md:hidden">
          {/* Search Bar */}
          <div className="flex w-full items-center rounded-full border border-gray-200 bg-white px-4 py-2">
            <Search className="mr-2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                onClick={closeMenu}
                className="py-2 font-medium text-gray-700"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Mobile Action Buttons */}
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full rounded-lg border border-[#1e3a8a] px-4 py-3 text-center text-sm font-semibold text-[#1e3a8a]"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              onClick={closeMenu}
              className="block w-full rounded-lg bg-[#1e3a8a] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e8683f]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
