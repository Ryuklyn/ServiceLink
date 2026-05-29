"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Safely lazy load React-Leaflet tracking nodes dynamically outside the Next SSR compilation cycle
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), {
  ssr: false,
});

// Provider location profile structure models
interface MapProvider {
  id: string;
  name: string;
  category:
    | "Electrician"
    | "Plumbing"
    | "Cleaning"
    | "Painting"
    | "AC Repair"
    | "Carpentry"
    | "Internet Repair";
  lat: number;
  lng: number;
  rating: number;
  isVerified: boolean;
  markerColor: string;
}

const CATEGORIES = [
  "All",
  "Verified",
  "Available Now",
  "Electrician",
  "Plumbing",
  "Cleaning",
  "Painting",
  "AC Repair",
  "Carpentry",
  "Internet Repair",
];

export default function ServiceMapPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [rangeRadius, setRangeRadius] = useState<number>(8); // Unit state representing spatial filter radius in kilometers

  // Bounded geolocation mock references mapping core fields near Kathmandu coordinates
  const userLocation: [number, number] = [27.6915, 85.342]; // Centered close to Baneshwor, Kathmandu

  const serviceProviders: MapProvider[] = [
    {
      id: "1",
      name: "Ram Electrical Services",
      category: "Electrician",
      lat: 27.705,
      lng: 85.328,
      rating: 4.8,
      isVerified: true,
      markerColor: "#b45309",
    },
    {
      id: "2",
      name: "Sita Plumbing Solutions",
      category: "Plumbing",
      lat: 27.686,
      lng: 85.322,
      rating: 4.9,
      isVerified: true,
      markerColor: "#1e3a8a",
    },
    {
      id: "3",
      name: "CleanNest Deep Cleaning",
      category: "Cleaning",
      lat: 27.698,
      lng: 85.351,
      rating: 4.6,
      isVerified: false,
      markerColor: "#10b981",
    },
    {
      id: "4",
      name: "CoolTech AC Repair",
      category: "AC Repair",
      lat: 27.712,
      lng: 85.345,
      rating: 4.7,
      isVerified: true,
      markerColor: "#f97316",
    },
    {
      id: "5",
      name: "KTM Painting Masters",
      category: "Painting",
      lat: 27.678,
      lng: 85.339,
      rating: 4.5,
      isVerified: false,
      markerColor: "#06b6d4",
    },
  ];

  // Client side distance matrix calculator running geographic range matching operations
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Earth's Radius constants metrics
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Perform dynamic coordinate cross calculations within the filtering logic tree
  const filteredProviders = useMemo(() => {
    return serviceProviders.filter((provider) => {
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        provider.lat,
        provider.lng,
      );
      if (distance > rangeRadius) return false;

      if (selectedCategory === "All") return true;
      if (selectedCategory === "Verified") return provider.isVerified;
      if (selectedCategory === "Available Now") return true; // Mimic layout context matching everything active
      return provider.category === selectedCategory;
    });
  }, [selectedCategory, rangeRadius]);

  // Leaflet Marker Icon Generators inject inline HTML vector properties mapping theme color arrays
  const createCustomIcon = (color: string) => {
    if (typeof window === "undefined") return null;
    const L = require("leaflet");
    return new L.DivIcon({
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      className: "custom-map-marker-node",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const createUserMarkerIcon = () => {
    if (typeof window === "undefined") return null;
    const L = require("leaflet");
    return new L.DivIcon({
      html: `<div style="background-color: #3a57b5; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(30,58,138,0.4);" class="pulse-user-node"></div>`,
      className: "user-location-marker-node",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Horizontal Nav Bar Chip Scroller Filters Component Row */}
      <div className="relative flex items-center shrink-0">
        <button className="absolute left-0 bg-linear-to-r from-gray-50 via-white to-transparent p-1 z-10 text-gray-500 hover:text-gray-800">
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 overflow-x-auto px-6 py-1 no-scrollbar scroll-smooth w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat
                  ? "bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="absolute right-0 bg-linear-to-l from-gray-50 via-white to-transparent p-1 z-10 text-gray-500 hover:text-gray-800">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Spatial Proximity Radius Slide Filter Box */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-3.5 space-y-2.5 shrink-0 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>
            Showing providers within{" "}
            <span className="text-[#e8683f] text-sm font-extrabold">
              {rangeRadius} km
            </span>
          </span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min="1"
            max="25"
            value={rangeRadius}
            onChange={(e) => setRangeRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#e8683f] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Map Display Container Wrapper */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative group z-15">
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          {/* Load Standard Topography Asset Layer Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Spatial Proximity Radius Visual Reference Rings */}
          <Circle
            center={userLocation}
            radius={rangeRadius * 1000}
            pathOptions={{
              color: "#e8683f",
              fillColor: "#e8683f",
              fillOpacity: 0.04,
              weight: 1.5,
              dashArray: "4, 6",
            }}
          />

          {/* User Fixed Core Centered Anchor Node */}
          {createUserMarkerIcon() && (
            <Marker position={userLocation} icon={createUserMarkerIcon()!}>
              <Popup className="custom-leaflet-popup">
                <div className="p-1 font-sans">
                  <p className="text-xs font-bold text-gray-900">
                    You are here
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Baneshwor, Kathmandu
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Map Over Provider Collection Elements */}
          {filteredProviders.map((provider) => {
            const icon = createCustomIcon(provider.markerColor);
            return icon ? (
              <Marker
                key={provider.id}
                position={[provider.lat, provider.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-1 font-sans min-w-[140px]">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-gray-900">
                        {provider.name}
                      </p>
                      {provider.isVerified && (
                        <span className="text-[9px] bg-blue-50 text-[#1e3a8a] px-1 rounded font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#e8683f] font-semibold mt-0.5">
                      {provider.category}
                    </p>
                    <p className="text-[10px] text-amber-500 font-bold mt-1">
                      ★ {provider.rating} Rating
                    </p>
                  </div>
                </Popup>
              </Marker>
            ) : null;
          })}
        </MapContainer>
      </div>

      {/* Custom Styles Injection Overrides */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes custom-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
            box-shadow: 0 0 12px rgba(30, 58, 138, 0.6);
          }
        }
        .pulse-user-node {
          animation: custom-pulse 2s infinite ease-in-out;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          padding: 2px !important;
        }
        .leaflet-popup-content {
          margin: 8px 10px !important;
        }
      `}</style>
    </div>
  );
}
