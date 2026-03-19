"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const zones = [
  { name: "Koramangala", center: [12.9352, 77.6245] as [number, number], claims: 3, color: "orange" },
  { name: "Indiranagar", center: [12.9784, 77.6408] as [number, number], claims: 2, color: "green" },
  { name: "HSR Layout", center: [12.9116, 77.6473] as [number, number], claims: 1, color: "green" },
  { name: "Whitefield", center: [12.9698, 77.7499] as [number, number], claims: 4, color: "red" },
  { name: "Electronic City", center: [12.8458, 77.6607] as [number, number], claims: 2, color: "orange" },
];

export default function AdminMap() {
  useEffect(() => {
    // Fix leaflet default icon issue with webpack
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
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
  }, []);

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={11}
      style={{ height: "400px", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zones.map((zone) => (
        <CircleMarker
          key={zone.name}
          center={zone.center}
          radius={zone.claims * 6}
          pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.5 }}
        >
          <Popup>
            <strong>{zone.name}</strong>
            <br />
            {zone.claims} claim{zone.claims !== 1 ? "s" : ""}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
