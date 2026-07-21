"use client";

import React, { useEffect } from "react";
import { Circle } from "react-leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  center: [number, number];
  radius?: number;
  interactive?: boolean;
}

// Fix Leaflet's marker asset paths within NextJS bundle optimization architectures
const customMarkerIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to fix sizing bugs on initial load mount
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export default function MapComponent({
                                       center,
                                       radius = 0,
                                       interactive = false,
                                     }: MapComponentProps) {
  // Approximate coordinates matching your target operational region (Kathmandu Valley area)
  // const providerPosition: [number, number] = [27.6915, 85.342];

  return (
      <MapContainer
          center={center}
          zoom={14}
          className="w-full h-full"
          scrollWheelZoom={interactive}
          dragging={interactive}
          zoomControl={interactive}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={customMarkerIcon}>
        <Popup>
          <div className="text-xs">
            <p className="font-bold">Ram Electrical Services</p>
            <p className="text-gray-500">En Route to your address</p>
          </div>
        </Popup>
      </Marker>
      <MapRecenter center={center} />
    </MapContainer>
  );
}
