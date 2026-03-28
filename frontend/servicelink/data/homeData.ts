import {
  Wrench,
  Zap,
  Sparkles,
  Paintbrush,
  Hammer,
  TreePine,
  Truck,
  Monitor,
} from "lucide-react";

export const NAV_LINKS = ["Home", "Services", "Track", "Calculator"];

export const HERO_STATS = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Verified Providers" },
  { value: "50+", label: "Services" },
];

export const CATEGORIES = [
  { name: "Plumbing", providers: 24, icon: Wrench, color: "text-blue-500" },
  { name: "Electrical", providers: 31, icon: Zap, color: "text-orange-500" },
  { name: "Cleaning", providers: 42, icon: Sparkles, color: "text-sky-500" },
  { name: "Painting", providers: 18, icon: Paintbrush, color: "text-pink-500" },
  { name: "Carpentry", providers: 15, icon: Hammer, color: "text-amber-700" },
  { name: "Gardening", providers: 12, icon: TreePine, color: "text-green-500" },
  { name: "Moving", providers: 9, icon: Truck, color: "text-amber-500" },
  { name: "Technology", providers: 22, icon: Monitor, color: "text-indigo-500" },
];

export const FEATURED_SERVICES = [
  {
    category: "Plumbing",
    title: "Home Plumbing",
    description: "Expert plumbing services for residential properties. Fix leaks, install fixtures, and ensure your water systems work perfectly.",
    price: "500",
    rating: 4.8,
    reviews: 134,
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=2070&auto=format&fit=crop",
    featured: true,
  },
  {
    category: "Electrical",
    title: "Electrical Wiring & Repair",
    description: "Certified electricians for wiring, circuit breaker repairs, lighting installation, and electrical safety inspections.",
    price: "600",
    rating: 4.7,
    reviews: 84,
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop",
    featured: true,
  },
  {
    category: "Cleaning",
    title: "Deep House Cleaning",
    description: "Thorough cleaning service including kitchen, bathrooms, floors, windows, and dusting for a spotless home.",
    price: "350",
    rating: 4.9,
    reviews: 212,
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
    featured: true,
  },
  {
    category: "Carpentry",
    title: "Carpentry & Woodwork",
    description: "Custom furniture, door/window repair, kitchen cabinets, shelving, and general woodwork by skilled carpenters.",
    price: "450",
    rating: 4.7,
    reviews: 67,
    img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop",
    featured: true,
  },
  {
    category: "Electrical",
    title: "Home Appliance Repair",
    description: "Expert repair for refrigerators, washing machines, microwaves, and other major home appliances.",
    price: "500",
    rating: 4.6,
    reviews: 147,
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
    featured: true,
  },
  {
    category: "Technology",
    title: "Computer & Laptop Repair",
    description: "Hardware repair, software troubleshooting, virus removal, data recovery, and system upgrades.",
    price: "450",
    rating: 4.7,
    reviews: 38,
    img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070&auto=format&fit=crop",
    featured: true,
  },
];

export const TESTIMONIALS = [
  {
    name: "Anita Poudel",
    role: "Homeowner, Lalitpur",
    quote: "ServiceLink made finding a reliable plumber so easy. The booking process was smooth and the service was top-notch!",
    rating: 5,
    initial: "A",
  },
  {
    name: "Deepak KC",
    role: "Business Owner, Thamel",
    quote: "We use ServiceLink Pro to manage all our office maintenance. The enterprise dashboard is incredibly useful.",
    rating: 5,
    initial: "D",
  },
  {
    name: "Maya Gurung",
    role: "Regular Customer",
    quote: "Love the escrow payment system! I feel safe knowing my money is held until the job is done properly.",
    rating: 4,
    initial: "M",
  },
  {
    name: "Rajesh Lama",
    role: "Service Provider",
    quote: "As a provider, ServiceLink has given me a steady stream of clients. The verification badge helps build trust.",
    rating: 5,
    initial: "R",
  },
];

export const WHY_FEATURES = [
  {
    title: "Verified Providers",
    desc: "All providers go through background checks and certification verification.",
    icon: "BadgeCheck",
  },
  {
    title: "Escrow Payments",
    desc: "Your money is safe — payment released only after service is complete.",
    icon: "Wallet",
  },
  {
    title: "Real-time Tracking",
    desc: "Track your provider in real-time as they head to your location.",
    icon: "MapPin",
  },
  {
    title: "Ratings & Reviews",
    desc: "Transparent ratings help you choose the best service providers.",
    icon: "Star",
  },
  {
    title: "Enterprise Solutions",
    desc: "ServiceLink Pro for businesses managing multiple service teams.",
    icon: "Users",
  },
  {
    title: "Wide Service Range",
    desc: "From plumbing to technology — 50+ service categories available.",
    icon: "Grid",
  },
];

export const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Browse Services",
    desc: "Explore 50+ verified service categories.",
    icon: "Search",
  },
  {
    num: "02",
    title: "Book & Schedule",
    desc: "Pick a date, time, and preferred provider.",
    icon: "Calendar",
  },
  {
    num: "03",
    title: "Secure Payment",
    desc: "Pay via Khalti/eSewa with escrow protection.",
    icon: "CreditCard",
  },
  {
    num: "04",
    title: "Rate & Review",
    desc: "Share your experience to help others.",
    icon: "Star",
  },
];
