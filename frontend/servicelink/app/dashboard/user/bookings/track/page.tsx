"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  PlayCircle,
  MapPin,
  AlertTriangle,
  Phone,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

// Dynamically import React Leaflet to prevent Next.js SSR errors
const MapComponent = dynamic(
  () => import("@/components/dashboard/user/map/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
        <span className="text-gray-500 animate-pulse text-sm">
          Loading Live Map...
        </span>
      </div>
    ),
  },
);

export default function BookingTrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans antialiased text-gray-800">
      {/* 1. Fixed Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1e3a8a] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="p-1 hover:bg-blue-800 rounded-full transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-semibold text-sm tracking-wide text-gray-200 uppercase">
                Booking ID
              </h1>
              <p className="text-base font-bold text-white">SL-2026-1042</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm bg-blue-900/50 px-3 py-1.5 rounded-md border border-blue-700/50">
            <Clock className="w-4 h-4 text-[#e8683f]" />
            <span className="font-medium text-gray-100">Today, 2:00 PM</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* 2. Provider Info Card */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-16 h-16 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center font-bold text-xl tracking-wider shrink-0 shadow-inner">
              RE
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">
                  Ram Electrical Services
                </h2>
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Certified Electrician
              </p>
            </div>
          </div>

          {/* Quick Actions (Desktop view right-aligned) */}
          <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
            <a
              href="https://wa.me/#"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href="tel:#"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-300 transition shadow-sm"
            >
              <Phone className="w-4 h-4 text-gray-500" /> Call
            </a>
          </div>
        </section>

        {/* 3. Provider On The Way Banner */}
        <section className="bg-[#e8683f] text-white rounded-xl p-4 shadow-sm flex items-center gap-3 animate-pulse">
          <div className="p-2 bg-white/10 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">Provider is on the way</h3>
            <p className="text-sm text-orange-50 text-opacity-90">
              Estimated Arrival Time:{" "}
              <span className="underline font-semibold">~15 mins</span>
            </p>
          </div>
        </section>

        {/* 4. Interactive Live Map Section */}
        <section className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />{" "}
              Live Tracking
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
              Route Updates Live
            </span>
          </div>
          <div className="h-72 w-full relative z-10">
            <MapComponent />
          </div>
        </section>

        {/* 5. Two-Column Dashboard: Status Timeline & Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Timeline */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              Booking Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-2 before:w-0.5 before:bg-gray-200">
              {/* Node 1: Completed */}
              <div className="relative group">
                <div className="absolute -left-[22px] top-1 bg-green-500 text-white rounded-full p-0.5 z-10">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Booking Confirmed
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    10:30 AM
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Your booking was successfully placed.
                  </p>
                </div>
              </div>

              {/* Node 2: Completed */}
              <div className="relative group">
                <div className="absolute -left-[22px] top-1 bg-green-500 text-white rounded-full p-0.5 z-10">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Provider Assigned
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">
                    10:45 AM
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Ram Electrical Services accepted your request.
                  </p>
                </div>
              </div>

              {/* Node 3: Active State */}
              <div className="relative group">
                <div className="absolute -left-[22px] top-1 bg-[#e8683f] text-white rounded-full p-0.5 z-10 shadow-sm shadow-orange-300">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#e8683f]">
                    Provider Traveling
                  </h4>
                  <span className="text-xs text-[#e8683f] font-semibold bg-orange-50 px-1.5 py-0.5 rounded">
                    1:30 PM
                  </span>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    Provider is en route to your location. ETA 15 minutes.
                  </p>
                </div>
              </div>

              {/* Node 4: Future State */}
              <div className="relative group opacity-50">
                <div className="absolute -left-[22px] top-1 bg-gray-200 text-gray-400 rounded-full p-0.5 z-10">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-700">
                    In Progress
                  </h4>
                  <span className="text-xs text-gray-400">—</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Service is currently being performed.
                  </p>
                </div>
              </div>

              {/* Node 5: Future State */}
              <div className="relative group opacity-50">
                <div className="absolute -left-[22px] top-1 bg-gray-200 text-gray-400 rounded-full p-0.5 z-10">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-700">Completed</h4>
                  <span className="text-xs text-gray-400">—</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Service has been completed successfully.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Booking Details */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Booking Details
              </h3>

              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Service
                  </dt>
                  <dd className="text-base font-bold text-gray-900 mt-0.5">
                    Fan Installation
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </dt>
                  <dd className="text-sm font-medium text-gray-700 mt-0.5">
                    Baneshwor, Kathmandu
                  </dd>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Payment Method
                    </dt>
                    <dd className="text-sm font-bold text-emerald-600 mt-0.5">
                      Pay after service
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </dt>
                    <dd className="text-base font-black text-[#1e3a8a] mt-0.5">
                      Rs. 650
                    </dd>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50">
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User Instruction Notes
                  </dt>
                  <dd className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-600 mt-1 italic">
                    "Please bring a ladder. The fan is in the bedroom."
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        {/* 6. Modification Policy Warning Banner */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            Modifications are not available once your provider is en route.
            Please contact our
            <a
              href="#"
              className="underline ml-1 font-semibold text-amber-900 hover:text-amber-700"
            >
              Customer Support Desk
            </a>{" "}
            if you need urgent changes.
          </p>
        </section>

        {/* 7. Bottom Three-Button Row Action Center */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button className="inline-flex items-center justify-center gap-2 border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 font-bold px-4 py-3 rounded-xl transition duration-200 active:scale-[0.99]">
            <Phone className="w-4 h-4" /> Call Provider
          </button>

          <button className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd55] text-white font-bold px-4 py-3 rounded-xl transition duration-200 shadow-sm active:scale-[0.99]">
            <MessageSquare className="w-4 h-4" /> Chat via WhatsApp
          </button>

          <button className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold px-4 py-3 rounded-xl transition duration-200 active:scale-[0.99]">
            <ShieldAlert className="w-4 h-4" /> Emergency Contact
          </button>
        </section>
      </main>
    </div>
  );
}
