"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
    center?: [number, number];
    radius?: number;
    interactive?: boolean;
    markers?: Array<{ lat: number; lng: number; label: string }>;
    centerLabel?: string;
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
function MapRecenter({ center, radius, markers = [] }: { center: [number, number]; radius: number; markers?: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const bounds = L.latLngBounds(markers.map((marker) => [marker.lat, marker.lng] as [number, number]));
    if (radius > 0) {
      const latitudeDelta = radius / 111_320;
      const longitudeScale = Math.max(Math.cos((center[0] * Math.PI) / 180), 0.01);
      const longitudeDelta = radius / (111_320 * longitudeScale);
      bounds.extend([center[0] - latitudeDelta, center[1] - longitudeDelta]);
      bounds.extend([center[0] + latitudeDelta, center[1] + longitudeDelta]);
    }
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    else map.setView(center, 12);
  }, [map, center, radius, markers]);
  return null;
}

export default function MapComponent({
                                         center = [27.7172, 85.324],
                                       radius = 0,
                                       interactive = false,
                                       markers,
                                       centerLabel = "Service area center",
                                     }: MapComponentProps) {
  // Approximate coordinates matching your target operational region (Kathmandu Valley area)
  // const providerPosition: [number, number] = [27.6915, 85.342];

  return (
      <MapContainer
          center={center}
          zoom={12}
          className="w-full h-full"
          scrollWheelZoom={interactive}
          dragging={interactive}
          zoomControl={interactive}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers && markers.length > 0 && (
        markers.map((m, idx) => (
          <Marker key={idx} position={[m.lat, m.lng]} icon={customMarkerIcon}>
            <Popup>
              <div className="text-xs font-semibold">
                <p>{m.label}</p>
              </div>
            </Popup>
          </Marker>
        ))
      )}
      {radius > 0 && (
        <>
        <Marker position={center} icon={customMarkerIcon}>
          <Popup>
            <p className="text-xs font-semibold">{centerLabel}</p>
          </Popup>
        </Marker>
        <Circle
          center={center}
          radius={radius}
          pathOptions={{ color: "#1e3a8a", fillColor: "#1e3a8a", fillOpacity: 0.08, weight: 2 }}
        />
        </>
      )}
      <MapRecenter center={center} radius={radius} markers={markers} />
    </MapContainer>
  );
}
