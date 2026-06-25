"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Search,
    Wrench,
    Zap,
    Sparkles,
    Hammer,
    Snowflake,
    Paintbrush,
    WashingMachine,
    Monitor,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Heart,
    Star,
    Users,
    Clock,
    ArrowRight,
} from "lucide-react";

const POPULAR_TAGS = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Carpentry",
    "AC Repair",
    "Painting",
];

const SERVICE_CATEGORIES = [
    { name: "All", icon: Users },
    { name: "Plumbing", icon: Wrench },
    { name: "Electrical", icon: Zap },
    { name: "Cleaning", icon: Sparkles },
    { name: "Carpentry", icon: Hammer },
    { name: "AC Repair", icon: Snowflake },
    { name: "Painting", icon: Paintbrush },
    { name: "Appliance", icon: WashingMachine },
    { name: "Technology", icon: Monitor },
    { name: "More", icon: MoreHorizontal },
];

const SERVICES_TOP = [
    {
        title: "Home Plumbing",
        img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=2070&auto=format&fit=crop",
        rating: 4.8,
        reviews: 245,
        providers: 24,
        duration: "~2 hrs typical job",
        price: "500",
    },
    {
        title: "Electrical Wiring & Repair",
        img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop",
        rating: 4.7,
        reviews: 199,
        providers: 18,
        duration: "~2-3 hrs typical job",
        price: "600",
    },
    {
        title: "Deep House Cleaning",
        img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
        rating: 4.9,
        reviews: 312,
        providers: 32,
        duration: "~3-4 hrs typical job",
        price: "350",
    },
    {
        title: "Carpentry & Woodwork",
        img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop",
        rating: 4.6,
        reviews: 156,
        providers: 20,
        duration: "~4-6 hrs typical job",
        price: "450",
    },
    {
        title: "AC Repair & Installation",
        img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2070&auto=format&fit=crop",
        rating: 4.7,
        reviews: 142,
        providers: 16,
        duration: "~2-3 hrs typical job",
        price: "700",
    },
    {
        title: "Painting Services",
        img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2070&auto=format&fit=crop",
        rating: 4.6,
        reviews: 124,
        providers: 14,
        duration: "~4-6 hrs typical job",
        price: "400",
    },
];

const SERVICES_BOTTOM = [
    {
        title: "Appliance Repair",
        img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
        rating: 4.5,
        reviews: 98,
        providers: 12,
        duration: "~1-2 hrs typical job",
        price: "550",
    },
    {
        title: "Pest Control",
        img: "https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?q=80&w=2070&auto=format&fit=crop",
        rating: 4.8,
        reviews: 87,
        providers: 10,
        duration: "~2-3 hrs typical job",
        price: "650",
    },
    {
        title: "Computer Repair",
        img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070&auto=format&fit=crop",
        rating: 4.7,
        reviews: 76,
        providers: 15,
        duration: "~1-2 hrs typical job",
        price: "400",
    },
];

function ServiceCard({ service }) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="relative h-48">
                <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition">
                    <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 text-xs font-semibold text-gray-800">
                    <Star className="w-3 h-3 fill-[#e8683f] text-[#e8683f]" />
                    {service.rating}
                    <span className="text-gray-400 font-normal">({service.reviews})</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
              {service.providers} providers available
          </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    {service.duration}
                </div>

                <div className="flex items-center justify-between">
          <span className="font-bold text-[#1e3a8a]">
            NPR {service.price}/hr
          </span>
                    <button className="bg-[#1e3a8a] hover:bg-[#e8683f] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ServicesPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [location, setLocation] = useState("near-me");

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Search Section */}
            <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white py-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-6">
                        Find the right professional for any job
                    </h1>

                    {/*<div className="flex max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg">*/}
                    {/*    <div className="flex items-center flex-1 bg-white px-4">*/}
                    {/*        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />*/}
                    {/*        <input*/}
                    {/*            type="text"*/}
                    {/*            placeholder="Search for services, professionals, or keywords..."*/}
                    {/*            className="w-full px-3 py-3.5 text-sm text-gray-700 outline-none"*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*    <button className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold px-6 flex items-center gap-2 transition-colors">*/}
                    {/*        <Search className="w-4 h-4" />*/}
                    {/*        Search*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                    <div className="flex w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg">
                        <div className="flex items-center flex-1 min-w-0 bg-white px-4">
                            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search for services, professionals, or keywords..."
                                className="w-full px-3 py-3.5 text-sm text-gray-700 outline-none"
                            />
                        </div>
                        <button className="bg-[#e8683f] hover:bg-[#d95a2f] text-white font-semibold px-6 flex items-center gap-2 transition-colors flex-shrink-0">
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-sm">
                        <span className="text-white/70 mr-1">Popular:</span>
                        {POPULAR_TAGS.map((tag) => (
                            <button
                                key={tag}
                                className="bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Pills */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
                    <div className="flex items-center gap-2">
                        <button className="hidden sm:flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50">
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-6 overflow-x-auto flex-1 px-1 scrollbar-hide">
                            {SERVICE_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.name;
                                return (
                                    <button
                                        key={cat.name}
                                        onClick={() => setActiveCategory(cat.name)}
                                        className="flex flex-col items-center gap-2 flex-shrink-0"
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                                                isActive
                                                    ? "border-[#1e3a8a] text-[#1e3a8a] bg-[#1e3a8a]/5"
                                                    : "border-gray-200 text-gray-500"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span
                                            className={`text-xs whitespace-nowrap ${
                                                isActive
                                                    ? "font-semibold text-[#1e3a8a]"
                                                    : "text-gray-600"
                                            }`}
                                        >
                      {cat.name}
                    </span>
                                    </button>
                                );
                            })}
                        </div>

                        <button className="hidden sm:flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Filters Bar */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Filter by:</span>
                        {["Category", "Price Range", "Rating", "Availability"].map(
                            (filter) => (
                                <button
                                    key={filter}
                                    className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                                >
                                    {filter}
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            )
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Sort by:</span>
                        <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-50">
                            Most Popular
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Location:</span>
                        <div className="flex rounded-full bg-gray-100 p-1">
                            <button
                                onClick={() => setLocation("near-me")}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                    location === "near-me"
                                        ? "bg-[#1e3a8a] text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                Near Me
                            </button>
                            <button
                                onClick={() => setLocation("all-nepal")}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                    location === "all-nepal"
                                        ? "bg-[#1e3a8a] text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                All Nepal
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <p className="text-sm text-gray-500 mb-4">Showing 120+ services</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SERVICES_TOP.map((service) => (
                        <ServiceCard key={service.title} service={service} />
                    ))}
                </div>

                {/* ServiceLink Pro Banner */}
                <div className="my-8 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl px-8 py-8 relative overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-6 items-center">
                        <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e8683f]">
                For Businesses
              </span>
                            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                                Need services regularly
                                <br />
                                for your business?
                            </h3>
                            <p className="mt-3 text-white/80 text-sm max-w-md">
                                Hotels, hospitals &amp; offices use ServiceLink Pro for bulk
                                bookings and dedicated provider management.
                            </p>
                            <Link
                                href="/servicelink-pro"
                                className="mt-5 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1e3a8a] font-semibold px-5 py-3 rounded-xl shadow-lg transition-all group"
                            >
                                Explore ServiceLink Pro
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="hidden lg:flex justify-end">
                            <Image
                                src="/images/proimage.png"
                                alt="ServiceLink Pro dashboard"
                                width={500}
                                height={300}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SERVICES_BOTTOM.map((service) => (
                        <ServiceCard key={service.title} service={service} />
                    ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center mt-10">
                    <button className="flex items-center gap-2 border border-[#1e3a8a] text-[#1e3a8a] font-semibold px-6 py-3 rounded-xl hover:bg-[#1e3a8a]/5 transition-colors">
                        Load More Services
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </section>
        </div>
    );
}