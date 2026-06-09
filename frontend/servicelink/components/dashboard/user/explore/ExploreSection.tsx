// "use client";
//
// import { useState, useMemo } from "react";
// import {
//   Star,
//   MapPin,
//   Clock,
//   ShieldCheck,
//   MessageCircle,
//   Briefcase,
// } from "lucide-react";
// import FilterBar from "./FilterBar";
// import Link from "next/link";
//
// interface Provider {
//   id: string;
//   initials: string;
//   name: string;
//   specialty: string;
//   category: string;
//   rating: number;
//   reviews: number;
//   experience: number;
//   distance: number;
//   eta: string;
//   price: number;
//   verified: boolean;
//   available: boolean;
//   areas: string[];
//   bgColor: string;
// }
//
// const ALL_PROVIDERS: Provider[] = [
//   {
//     id: "1",
//     initials: "RE",
//     name: "Ram Electrical Services",
//     specialty: "Certified Electrician",
//     category: "Electrician",
//     rating: 4.8,
//     reviews: 124,
//     experience: 7,
//     distance: 8,
//     eta: "Within 1 hour",
//     price: 800,
//     verified: true,
//     available: true,
//     areas: ["Kathmandu", "Bhaktapur", "Lalitpur"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "2",
//     initials: "SP",
//     name: "Sita Plumbing Solutions",
//     specialty: "Master Plumber",
//     category: "Plumbing",
//     rating: 4.6,
//     reviews: 89,
//     experience: 5,
//     distance: 6,
//     eta: "Within 2 hours",
//     price: 600,
//     verified: true,
//     available: true,
//     areas: ["Kathmandu", "Lalitpur"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "3",
//     initials: "CS",
//     name: "CleanNest Services",
//     specialty: "Professional Cleaner",
//     category: "Cleaning",
//     rating: 4.9,
//     reviews: 203,
//     experience: 4,
//     distance: 10,
//     eta: "Within 30 min",
//     price: 1200,
//     verified: true,
//     available: true,
//     areas: ["Kathmandu", "Bhaktapur", "Lalitpur"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "4",
//     initials: "CP",
//     name: "ColorMaster Painting",
//     specialty: "Interior Painter",
//     category: "Painting",
//     rating: 4.7,
//     reviews: 67,
//     experience: 9,
//     distance: 12,
//     eta: "Within 3 hours",
//     price: 1500,
//     verified: true,
//     available: false,
//     areas: ["Kathmandu", "Lalitpur"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "5",
//     initials: "CA",
//     name: "CoolBreeze AC Service",
//     specialty: "AC Technician",
//     category: "AC Repair",
//     rating: 4.5,
//     reviews: 156,
//     experience: 6,
//     distance: 7,
//     eta: "Within 2 hours",
//     price: 1000,
//     verified: true,
//     available: true,
//     areas: ["Kathmandu", "Lalitpur", "Bhaktapur"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "6",
//     initials: "WC",
//     name: "WoodCraft Carpentry",
//     specialty: "Master Carpenter",
//     category: "Carpentry",
//     rating: 4.8,
//     reviews: 45,
//     experience: 12,
//     distance: 15,
//     eta: "Within 4 hours",
//     price: 1800,
//     verified: true,
//     available: true,
//     areas: ["Kathmandu", "Bhaktapur"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "7",
//     initials: "NR",
//     name: "NetRepair Solutions",
//     specialty: "Internet Technician",
//     category: "Internet Repair",
//     rating: 4.4,
//     reviews: 38,
//     experience: 3,
//     distance: 5,
//     eta: "Within 1 hour",
//     price: 500,
//     verified: false,
//     available: true,
//     areas: ["Kathmandu"],
//     bgColor: "#1e3a8a",
//   },
//   {
//     id: "8",
//     initials: "AS",
//     name: "ApplianceFix Services",
//     specialty: "Appliance Technician",
//     category: "Appliance Repair",
//     rating: 4.3,
//     reviews: 92,
//     experience: 8,
//     distance: 9,
//     eta: "Within 2 hours",
//     price: 700,
//     verified: true,
//     available: false,
//     areas: ["Lalitpur", "Bhaktapur"],
//     bgColor: "#1e3a8a",
//   },
// ];
//
// const renderStars = (r: number) =>
//   Array.from({ length: 5 }).map((_, i) => (
//     <Star
//       key={i}
//       className={`w-3.5 h-3.5 ${
//         i < Math.floor(r)
//           ? "fill-[#e8683f] text-[#e8683f]"
//           : i < r
//             ? "fill-[#e8683f]/50 text-[#e8683f]/50"
//             : "fill-gray-200 text-gray-200"
//       }`}
//     />
//   ));
//
// export default function ExploreSection() {
//   const [category, setCategory] = useState("All Categories");
//   const [distance, setDistance] = useState("Any Distance");
//   const [rating, setRating] = useState("Any Rating");
//   const [verifiedOnly, setVerifiedOnly] = useState(false);
//   const [availableOnly, setAvailableOnly] = useState(false);
//   const [sort, setSort] = useState("Relevance");
//
//   const filtered = useMemo(() => {
//     let list = [...ALL_PROVIDERS];
//     if (category !== "All Categories")
//       list = list.filter((p) => p.category === category);
//     if (distance !== "Any Distance") {
//       const km = parseInt(distance);
//       list = list.filter((p) => p.distance <= km);
//     }
//     if (rating !== "Any Rating") {
//       const min = parseFloat(rating);
//       list = list.filter((p) => p.rating >= min);
//     }
//     if (verifiedOnly) list = list.filter((p) => p.verified);
//     if (availableOnly) list = list.filter((p) => p.available);
//     if (sort === "Rating") list.sort((a, b) => b.rating - a.rating);
//     else if (sort === "Distance") list.sort((a, b) => a.distance - b.distance);
//     else if (sort === "Price: Low to High")
//       list.sort((a, b) => a.price - b.price);
//     else if (sort === "Price: High to Low")
//       list.sort((a, b) => b.price - a.price);
//     return list;
//   }, [category, distance, rating, verifiedOnly, availableOnly, sort]);
//
//   const hasFilters =
//     category !== "All Categories" ||
//     distance !== "Any Distance" ||
//     rating !== "Any Rating" ||
//     verifiedOnly ||
//     availableOnly;
//
//   const clearAll = () => {
//     setCategory("All Categories");
//     setDistance("Any Distance");
//     setRating("Any Rating");
//     setVerifiedOnly(false);
//     setAvailableOnly(false);
//     setSort("Relevance");
//   };
//
//   return (
//     <div>
//       <FilterBar
//         category={category}
//         setCategory={setCategory}
//         distance={distance}
//         setDistance={setDistance}
//         rating={rating}
//         setRating={setRating}
//         verifiedOnly={verifiedOnly}
//         setVerifiedOnly={setVerifiedOnly}
//         availableOnly={availableOnly}
//         setAvailableOnly={setAvailableOnly}
//         sort={sort}
//         setSort={setSort}
//         resultCount={filtered.length}
//         hasFilters={hasFilters}
//         onClearAll={clearAll}
//       />
//
//       {filtered.length === 0 ? (
//         <div className="text-center py-20 text-gray-400">
//           <p className="text-lg font-medium">No providers found</p>
//           <p className="text-sm mt-1">Try adjusting your filters</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-3 gap-5">
//           {filtered.map((provider) => (
//             <div
//               key={provider.id}
//               className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4"
//             >
//               {/* Top: avatar + name + badges */}
//               <div className="flex items-start gap-4">
//                 <div className="relative shrink-0">
//                   <div
//                     className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold"
//                     style={{ backgroundColor: provider.bgColor }}
//                   >
//                     {provider.initials}
//                   </div>
//                   {provider.available && (
//                     <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
//                   )}
//                   {provider.verified && (
//                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
//                       <ShieldCheck
//                         className="w-2.5 h-2.5 text-white"
//                         strokeWidth={3}
//                       />
//                     </div>
//                   )}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">
//                     {provider.name}
//                   </h3>
//                   <div className="flex flex-wrap gap-1.5">
//                     <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
//                       {provider.specialty}
//                     </span>
//                     {provider.verified && (
//                       <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
//                         <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
//                         Verified
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//
//               {/* Stars + meta */}
//               <div>
//                 <div className="flex items-center gap-1 mb-2">
//                   <div className="flex gap-0.5">
//                     {renderStars(provider.rating)}
//                   </div>
//                   <span className="text-sm font-semibold text-gray-800">
//                     {provider.rating}
//                   </span>
//                   <span className="text-xs text-gray-400">
//                     ({provider.reviews} reviews)
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-4 text-xs text-gray-500">
//                   <span className="flex items-center gap-1">
//                     <Briefcase className="w-3.5 h-3.5 text-gray-400" />
//                     {provider.experience} years
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <MapPin className="w-3.5 h-3.5 text-gray-400" />
//                     {provider.distance} km away
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <Clock className="w-3.5 h-3.5 text-gray-400" />
//                     {provider.eta}
//                   </span>
//                 </div>
//               </div>
//
//               {/* Area tags */}
//               <div className="flex flex-wrap gap-1.5">
//                 {provider.areas.map((area) => (
//                   <span
//                     key={area}
//                     className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full"
//                   >
//                     {area}
//                   </span>
//                 ))}
//               </div>
//
//               {/* Price */}
//               <p className="text-[#1e3a8a] font-bold text-base">
//                 From Rs. {provider.price}
//               </p>
//
//               {/* Buttons */}
//               <div className="flex gap-2 mt-auto">
//                 {/* <button className="flex-none border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
//                   View Profile
//                 </button> */}
//                 <Link
//                   href={`/dashboard/user/explore/profile?id=${provider.id}`}
//                   className="flex-none border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
//                 >
//                   View Profile
//                 </Link>
//                 <button className="flex-1 bg-[#e8683f] hover:bg-[#d75930] text-white py-2 rounded-xl font-semibold text-sm transition-colors">
//                   Book Now
//                 </button>
//                 <button className="flex-none bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
//                   <MessageCircle className="w-4 h-4" />
//                   WhatsApp
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Star, MapPin, Clock, ShieldCheck, MessageCircle, Briefcase,
} from "lucide-react";
import FilterBar from "./FilterBar";
import Link from "next/link";
import api from "@/utils/axios";

interface Provider {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  category: string;
  rating: number;
  reviews: number;
  experience: number;
  distance: number;
  eta: string;
  price: number;
  verified: boolean;
  available: boolean;
  areas: string[];
  bgColor: string;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function mapCategory(primaryService: string): string {
  const map: Record<string, string> = {
    ELECTRICIAN: "Electrician",
    PLUMBER: "Plumbing",
    PAINTER: "Painting",
    CLEANER: "Cleaning",
    CARPENTER: "Carpentry",
    AC_REPAIR: "AC Repair",
  };
  return map[primaryService] ?? primaryService;
}

function mapBackendToProvider(data: any): Provider {
  return {
    id: String(data.id),
    initials: getInitials(data.fullName ?? ""),
    name: data.businessName ?? data.fullName,
    specialty: mapCategory(data.primaryService),
    category: mapCategory(data.primaryService),
    rating: data.averageRating ?? 5.0,
    reviews: data.totalReviews ?? 0,
    experience: data.experienceYears ?? 0,
    distance: 5,
    eta: "Within 1 hour",
    price: data.services?.[0]?.customPrice ?? 0,
    verified: data.isVerified ?? false,
    available: data.isOnline ?? false,
    areas: data.coveredDistricts
        ? data.coveredDistricts.split(",").map((d: string) => d.trim())
        : [data.baseDistrict ?? "Kathmandu"],
    bgColor: "#1e3a8a",
  };
}

const renderStars = (r: number) =>
    Array.from({ length: 5 }).map((_, i) => (
        <Star
            key={i}
            className={`w-3.5 h-3.5 ${
                i < Math.floor(r)
                    ? "fill-[#e8683f] text-[#e8683f]"
                    : i < r
                        ? "fill-[#e8683f]/50 text-[#e8683f]/50"
                        : "fill-gray-200 text-gray-200"
            }`}
        />
    ));

export default function ExploreSection() {
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("All Categories");
  const [distance, setDistance] = useState("Any Distance");
  const [rating, setRating] = useState("Any Rating");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("Relevance");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const [res1, res2] = await Promise.all([
          api.get("/providers/1"),
          api.get("/providers/2"),
        ]);

        const mapped = [res1.data, res2.data].map(mapBackendToProvider);
        setAllProviders(mapped);
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setError("Failed to load providers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const filtered = useMemo(() => {
    let list = [...allProviders];
    if (category !== "All Categories")
      list = list.filter((p) => p.category === category);
    if (distance !== "Any Distance") {
      const km = parseInt(distance);
      list = list.filter((p) => p.distance <= km);
    }
    if (rating !== "Any Rating") {
      const min = parseFloat(rating);
      list = list.filter((p) => p.rating >= min);
    }
    if (verifiedOnly) list = list.filter((p) => p.verified);
    if (availableOnly) list = list.filter((p) => p.available);
    if (sort === "Rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "Distance") list.sort((a, b) => a.distance - b.distance);
    else if (sort === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    return list;
  }, [allProviders, category, distance, rating, verifiedOnly, availableOnly, sort]);

  const hasFilters =
      category !== "All Categories" ||
      distance !== "Any Distance" ||
      rating !== "Any Rating" ||
      verifiedOnly ||
      availableOnly;

  const clearAll = () => {
    setCategory("All Categories");
    setDistance("Any Distance");
    setRating("Any Rating");
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSort("Relevance");
  };

  if (loading) {
    return (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Loading providers...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-20 text-red-400">
          <p className="text-lg font-medium">{error}</p>
        </div>
    );
  }

  return (
      <div>
        <FilterBar
            category={category}
            setCategory={setCategory}
            distance={distance}
            setDistance={setDistance}
            rating={rating}
            setRating={setRating}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            sort={sort}
            setSort={setSort}
            resultCount={filtered.length}
            hasFilters={hasFilters}
            onClearAll={clearAll}
        />

        {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No providers found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-5">
              {filtered.map((provider) => (
                  <div
                      key={provider.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold"
                            style={{ backgroundColor: provider.bgColor }}
                        >
                          {provider.initials}
                        </div>
                        {provider.available && (
                            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                        )}
                        {provider.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <ShieldCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2">
                          {provider.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                    <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {provider.specialty}
                    </span>
                          {provider.verified && (
                              <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                        Verified
                      </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex gap-0.5">{renderStars(provider.rating)}</div>
                        <span className="text-sm font-semibold text-gray-800">{provider.rating}</span>
                        <span className="text-xs text-gray-400">({provider.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    {provider.experience} years
                  </span>
                        <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {provider.distance} km away
                  </span>
                        <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {provider.eta}
                  </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {provider.areas.map((area) => (
                          <span key={area} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                    {area}
                  </span>
                      ))}
                    </div>

                    <p className="text-[#1e3a8a] font-bold text-base">
                      From Rs. {provider.price}
                    </p>

                    <div className="flex gap-2 mt-auto">
                      <Link
                          href={`/dashboard/user/explore/profile?id=${provider.id}`}
                          className="flex-none border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        View Profile
                      </Link>
                      <button className="flex-1 bg-[#e8683f] hover:bg-[#d75930] text-white py-2 rounded-xl font-semibold text-sm transition-colors">
                        Book Now
                      </button>
                      <button className="flex-none bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}