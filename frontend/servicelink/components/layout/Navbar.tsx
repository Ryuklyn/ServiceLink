// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Menu, X, Search } from "lucide-react";
// import { NAV_LINKS } from "@/data/homeData";

// export default function Navbar() {
//   const [open, setOpen] = useState(false);

//   return (
//     <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto flex justify-between h-20 items-center px-4 lg:px-8">
//         {/* Logo */}
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <div className="bg-[#1e3a8a] text-white p-1.5 rounded-lg flex items-center justify-center">
//             <span className="font-bold text-xl leading-none">S</span>
//           </div>
//           <h1 className="font-bold text-xl text-[#1e3a8a] tracking-tight">
//             ServiceLink
//           </h1>
//         </div>

//         {/* Search Bar (Desktop) */}
//         <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-full max-w-sm mx-8 focus-within:ring-2 focus-within:ring-[#1e3a8a]/15 transition-all">
//           <Search className="text-gray-400 w-4 h-4 mr-2" />
//           <input
//             type="text"
//             placeholder="Search services..."
//             className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
//           />
//         </div>

//         {/* Navigation Links (Desktop) */}
//         <div className="hidden lg:flex items-center gap-8">
//           {NAV_LINKS.map((l) => (
//             <a
//               key={l}
//               href="#"
//               className="text-sm font-medium text-gray-600 hover:text-[#1e3a8a] transition-colors"
//             >
//               {l}
//             </a>
//           ))}
//         </div>

//         {/* Action Buttons (Desktop) */}
//         <div className="hidden md:flex items-center gap-4 ml-8">
//           <Link
//             href="/login"
//             className="text-sm font-semibold text-[#1e3a8a] px-4 py-2 border border-[#1e3a8a] rounded-full hover:bg-[#1e3a8a]/10 transition-colors"
//           >
//             Sign In
//           </Link>
//           <button className="text-sm font-semibold text-white bg-[#1e3a8a] px-5 py-2 rounded-full shadow-sm hover:bg-[#1e3a8a] transition-colors">
//             Get Started
//           </button>
//         </div>

//         {/* Mobile Menu Toggle */}
//         <button
//           onClick={() => setOpen(!open)}
//           className="md:hidden text-gray-600"
//         >
//           {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {open && (
//         <div className="md:hidden px-4 py-6 border-t bg-gray-50 flex flex-col gap-4">
//           <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 w-full">
//             <Search className="text-gray-400 w-4 h-4 mr-2" />
//             <input
//               type="text"
//               placeholder="Search services..."
//               className="bg-transparent border-none outline-none w-full text-sm"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             {NAV_LINKS.map((l) => (
//               <a key={l} href="#" className="font-medium text-gray-700 py-2">
//                 {l}
//               </a>
//             ))}
//           </div>
//           <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
//             <Link
//               href="/login"
//               onClick={() => setOpen(false)}
//               className="w-full text-center text-sm font-semibold text-[#1e3a8a] px-4 py-3 border border-[#1e3a8a] rounded-lg block"
//             >
//               Sign In
//             </Link>
//             <Link
//               href="/register"
//               onClick={() => setOpen(false)}
//               className="w-full block"
//             >
//               <span className="block w-full text-center text-sm font-semibold text-white bg-[#1e3a8a] px-5 py-3 rounded-lg">
//                 Get Started
//               </span>
//             </Link>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
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
          <div className="flex items-center justify-center rounded-lg bg-[#1e3a8a] p-1.5 text-white">
            <span className="text-xl font-bold leading-none">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1e3a8a]">
            ServiceLink
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
