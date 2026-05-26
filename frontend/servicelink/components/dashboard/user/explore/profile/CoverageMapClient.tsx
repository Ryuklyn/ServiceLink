"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon for Next.js
const fixLeafletIcons = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
};

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

interface CoverageMapClientProps {
  center: { lat: number; lng: number };
  radiusKm: number;
}

export default function CoverageMapClient({
  center,
  radiusKm,
}: CoverageMapClientProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const position: [number, number] = [center.lat, center.lng];
  const radiusMeters = radiusKm * 1000;

  return (
    <MapContainer
      center={position}
      zoom={11}
      scrollWheelZoom={false}
      className="w-full h-64 rounded-xl z-0"
      style={{ height: "260px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInvalidator />
      <Marker position={position} />
      <Circle
        center={position}
        radius={radiusMeters}
        pathOptions={{
          color: "#1e3a8a",
          fillColor: "#1e3a8a",
          fillOpacity: 0.08,
          weight: 2,
        }}
      />
    </MapContainer>
  );
}
