"use client";

import { KeyRound } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* LEFT SIDE (UNCHANGED) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl mix-blend-screen"></div>

        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-orange-500/30">
            <KeyRound className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Reset Your Password
          </h1>

          <p className="text-blue-100 text-lg leading-relaxed">
            Follow the steps to recover your account and create a new secure
            password.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 lg:py-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}
