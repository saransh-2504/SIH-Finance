"use client";

import { useState } from "react";
import { ExternalLink, Layers, MapPin, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OsmMapViewProps {
  lat: number;
  lon: number;
  village: string;
  district?: string;
  state?: string;
  radiusKm?: number;
  directCompetitors?: number;
  density?: string;
}

export function OsmMapView({
  lat = 13.0711,
  lon = 77.7981,
  village = "Location",
  district = "",
  state = "",
  radiusKm = 5,
  directCompetitors = 5,
  density = "Moderate",
}: OsmMapViewProps) {
  const [mapType, setMapType] = useState<"standard" | "cycle">("standard");

  // Calculate bounding box for 5km radius (approx 0.045 deg)
  const delta = (radiusKm / 111) * 1.1;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const osmFullUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`;

  return (
    <div className="rounded-2xl border border-[#d8d1bd] bg-white overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="px-4 py-3 bg-[#f8f7f2] border-b border-[#e2dccb] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-xs font-semibold text-[#0f2d1c] uppercase tracking-wider">
            OpenStreetMap Live Catchment Analysis
          </span>
          <Badge variant="outline" className="text-[10px] bg-white border-[#166534]/30 text-[#166534]">
            {radiusKm} km Radius
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#66715f]">
          <span className="font-mono text-[11px]">
            📍 {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
          </span>
          <a
            href={osmFullUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#166534] font-medium hover:underline"
          >
            Full Map <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* Interactive Map Iframe Container */}
      <div className="relative w-full h-[280px] bg-[#e5e7eb]">
        <iframe
          title={`OpenStreetMap for ${village}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* 5km Radius Floating Indicator Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-[#d8d1bd] rounded-xl p-2.5 shadow-md flex items-center gap-3 text-xs">
          <div className="size-8 rounded-lg bg-[#f0fdf4] border border-[#166534]/30 grid place-items-center text-[#166534]">
            <MapPin className="size-4" />
          </div>
          <div>
            <p className="font-bold text-[#1f2937] leading-tight">{village}{district ? `, ${district}` : ""}</p>
            <p className="text-[11px] text-[#66715f]">
              {directCompetitors} competitors detected · <span className="font-medium text-[#166534]">{density} Density</span>
            </p>
          </div>
        </div>

        {/* Legend Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-[#d8d1bd] rounded-lg px-2.5 py-1 shadow-sm text-[10px] font-medium text-[#374151] flex items-center gap-1.5">
          <Layers className="size-3 text-[#166534]" /> Real-Time POI Scan
        </div>
      </div>

      {/* Map Footer Intelligence Summary */}
      <div className="px-4 py-2.5 bg-[#faf9f5] border-t border-[#e2dccb] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[#66715f] text-[10px]">Market Radius</span>
          <p className="font-bold text-[#1f2937]">{radiusKm} km Circle</p>
        </div>
        <div className="border-x border-[#e2dccb]">
          <span className="text-[#66715f] text-[10px]">Competitor Units</span>
          <p className="font-bold text-[#166534]">{directCompetitors} Direct POIs</p>
        </div>
        <div>
          <span className="text-[#66715f] text-[10px]">Market Saturation</span>
          <p className="font-bold text-[#1f2937]">{density} Saturation</p>
        </div>
      </div>
    </div>
  );
}
