"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import api from "@/utils/axios";
import { getCategories } from "@/lib/api/providersApi";
import Link from "next/link";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

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
  category: string;
  lat: number;
  lng: number;
  rating: number;
  isVerified: boolean;
  phone: string;
  avatarUrl: string | null;
  initials: string;
  markerColor: string;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ServiceMapPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [rangeRadius, setRangeRadius] = useState<number>(8); // Unit state representing spatial filter radius in kilometers
  const [categories, setCategories] = useState<string[]>(["All", "Verified", "Available Now"]);
  const [providers, setProviders] = useState<MapProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<MapProvider | null>(null);
  const [loading, setLoading] = useState(true);

  // Bounded geolocation mock references mapping core fields near Kathmandu coordinates
  const userLocation: [number, number] = [27.6915, 85.342]; // Centered close to Baneshwor, Kathmandu

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load categories
        const cats = await getCategories();
        const activeCats = cats.filter(c => c.isActive).map(c => c.name);
        setCategories(["All", "Verified", "Available Now", ...activeCats]);

        // Load providers
        const { data } = await api.get("/providers", { params: { size: 100 } });
        const mapped = (data.content || []).map((p: any, idx: number) => {
          // If lat/lng are missing or 0, jitter around center
          const lat = p.latitude && p.latitude !== 0 ? p.latitude : 27.6915 + Math.sin(idx + 1) * 0.02;
          const lng = p.longitude && p.longitude !== 0 ? p.longitude : 85.342 + Math.cos(idx + 1) * 0.02;

          return {
            id: String(p.id),
            name: p.businessName || p.fullName,
            category: p.primaryCategoryName || "General",
            lat,
            lng,
            rating: p.averageRating || 5.0,
            isVerified: p.isVerified || false,
            phone: p.phone || "",
            avatarUrl: p.profilePictureUrl?.trim() ? p.profilePictureUrl : null,
            initials: getInitials(p.fullName || ""),
            markerColor: p.isVerified ? "#16a34a" : "#1e3a8a"
          };
        });
        setProviders(mapped);
      } catch (err) {
        console.error("Error loading map data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
    const b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * b;
  };

  // Perform dynamic coordinate cross calculations within the filtering logic tree
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
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
  }, [providers, selectedCategory, rangeRadius]);

  // Leaflet Marker Icon Generators inject inline HTML vector properties mapping theme color arrays
  const createCustomIcon = (avatarUrl: string | null, initials: string) => {
    if (typeof window === "undefined") return null;
    const L = require("leaflet");
    const avatarHtml = avatarUrl
      ? `<img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
      : `<div style="background-color: #1e3a8a; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">${initials}</div>`;

    return new L.DivIcon({
      html: `<div style="width: 36px; height: 36px; border-radius: 55%; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); overflow: hidden; display: flex; align-items: center; justify-content: center; background: white;">${avatarHtml}</div>`,
      className: "custom-map-marker-node",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const createUserMarkerIcon = () => {
    if (typeof window === "undefined") return null;
    const L = require("leaflet");
    return new L.DivIcon({
      html: `<div style="background-color: #e8683f; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(232,104,63,0.4);" class="pulse-user-node"></div>`,
      className: "user-location-marker-node",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-slate-400">
        Loading service map...
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col relative">
      {/* Horizontal Nav Bar Chip Scroller Filters Component Row */}
      <div className="relative flex items-center shrink-0">
        <button className="absolute left-0 bg-linear-to-r from-gray-50 via-white to-transparent p-1 z-10 text-gray-500 hover:text-gray-800">
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 overflow-x-auto px-6 py-1 no-scrollbar scroll-smooth w-full">
          {categories.map((cat) => (
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
            style={{
              background: `linear-gradient(to right, #e8683f 0%, #e8683f ${((rangeRadius - 1) / (25 - 1)) * 100}%, #374151 ${((rangeRadius - 1) / (25 - 1)) * 100}%, #374151 100%)`,
            }}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#e8683f] focus:outline-none transition-all"
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
            const icon = createCustomIcon(provider.avatarUrl, provider.initials);
            return icon ? (
              <Marker
                key={provider.id}
                position={[provider.lat, provider.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedProvider(provider),
                }}
              >
                <Popup>
                  <div className="p-1 font-sans min-w-[140px] text-center">
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      {provider.name}
                    </p>
                    <p className="text-[9px] text-[#e8683f] font-semibold">
                      {provider.category}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ) : null;
          })}
        </MapContainer>

        {/* Empty State Overlay */}
        {filteredProviders.length === 0 && (
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center z-20">
            <MapPin className="w-10 h-10 text-gray-400 mb-2 animate-bounce" />
            <h3 className="font-bold text-sm text-gray-900">No Providers Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
              Try expanding the search radius or selecting a different category.
            </p>
          </div>
        )}

        {/* Active Provider Short Details Card */}
        {selectedProvider && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-20 flex gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="relative shrink-0">
              {selectedProvider.avatarUrl ? (
                <img
                  src={selectedProvider.avatarUrl}
                  alt={selectedProvider.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {selectedProvider.initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-sm text-gray-900 truncate">
                  {selectedProvider.name}
                </h4>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-xs px-1.5 py-0.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-[#e8683f] font-semibold">
                {selectedProvider.category}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                ★ {selectedProvider.rating.toFixed(1)}
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  href={`/dashboard/user/explore/profile?id=${selectedProvider.id}`}
                  className="flex-1 text-center bg-primary hover:bg-[#152a65] text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                >
                  View Profile
                </Link>
                <WhatsAppButton
                  phone={selectedProvider.phone}
                  message={`Hi ${selectedProvider.name}, I saw your location on the ServiceLink Map and wanted to ask about your services.`}
                  className="flex-1 py-1.5 text-[11px]"
                />
              </div>
            </div>
          </div>
        )}
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
            box-shadow: 0 0 12px rgba(232, 104, 63, 0.6);
          }
        }
        .pulse-user-node {
          animation: custom-pulse 2s infinite ease-in-out;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          padding: 2px !important;
        }
        .leaflet-popup-content {
          margin: 8px 10px !important;
        }
      `}</style>
    </div>
  );
}
