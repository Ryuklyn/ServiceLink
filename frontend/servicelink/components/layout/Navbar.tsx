"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { NAV_LINKS } from "@/data/homeData";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setOpen(false);

  return (
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
          {/* Logo */}
          <Link
              href="/"
              onClick={closeMenu}
              className="flex flex-shrink-0 items-center gap-2"
          >
            <Image
                src="/images/SL.png"
                alt="ServiceLink Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
            />

            <h1 className="whitespace-nowrap text-xl font-bold tracking-tight">
              <span className="text-[#1e3a8a]">Service</span>
              <span className="text-[#e8683f]">Link</span>
            </h1>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden w-full max-w-xs flex-shrink items-center rounded-full border border-gray-100 bg-gray-50 px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-[#1e3a8a]/15 md:flex">
            <Search className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
                type="text"
                placeholder="Search services..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none"
            />
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden flex-shrink-0 items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                  <Link
                      key={link.href}
                      href={link.href}
                      className={`whitespace-nowrap pb-1 text-sm transition-colors ${
                          isActive
                              ? "border-b-2 border-[#1e3a8a] font-semibold text-[#1e3a8a]"
                              : "font-medium text-gray-600 hover:text-[#1e3a8a]"
                      }`}
                  >
                    {link.label}
                  </Link>
              );
            })}
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
            <Link
                href="/login"
                className="whitespace-nowrap rounded-full border border-[#1e3a8a] px-4 py-2 text-sm font-semibold text-[#1e3a8a] transition-colors hover:bg-[#1e3a8a]/10"
            >
              Sign In
            </Link>

            <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-[#1e3a8a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e8683f]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle — shows whenever full desktop row (lg) isn't visible */}
          <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex-shrink-0 p-2 text-gray-600 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile / Tablet Menu */}
        {open && (
            <div className="flex flex-col gap-4 border-t bg-gray-50 px-4 py-6 lg:hidden">
              {/* Search Bar — only needed here below md, since desktop search already shows at md+ */}
              <div className="flex w-full items-center rounded-full border border-gray-200 bg-white px-4 py-2 md:hidden">
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                      <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenu}
                          className={`rounded-md px-2 py-3 font-medium transition-colors ${
                              isActive
                                  ? "bg-[#1e3a8a]/10 text-[#1e3a8a]"
                                  : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {link.label}
                      </Link>
                  );
                })}
              </div>

              {/* Mobile/Tablet Action Buttons — only needed here below md */}
              <div className="mt-2 flex flex-col gap-2 border-t border-gray-200 pt-4 md:hidden">
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