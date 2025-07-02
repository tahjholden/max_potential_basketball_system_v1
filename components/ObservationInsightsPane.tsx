"use client";

import React from "react";
import EntityMetadataCard from "@/components/EntityMetadataCard";

// Reusable card for metrics, analytics, etc.
export default function ObservationInsightsPane({ total, playerTotal }: { total: number, playerTotal: number }) {
  return (
    <EntityMetadataCard
      fields={[{
        label: "",
        value: (
          <div className="flex flex-col gap-4 w-full">
            {/* Metrics Row with Card Boxes */}
            <div className="flex flex-row gap-3 w-full justify-center">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-center flex-1 min-w-0 h-32 justify-between">
                <div className="flex flex-col items-center w-full" style={{ minHeight: 38 }}>
                  <span className="text-zinc-400 text-xs mb-0.5 text-center w-full">Total Observations</span>
                  <span className="text-zinc-400 text-[11px] leading-tight text-center w-full">(This Week)</span>
                </div>
                <span className="text-2xl font-bold text-white mt-auto">{total}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-center flex-1 min-w-0 h-32 justify-between">
                <div className="flex flex-col items-center w-full" style={{ minHeight: 38 }}>
                  <span className="text-zinc-400 text-xs mb-0.5 text-center w-full">Player Observations</span>
                  <span className="text-zinc-400 text-[11px] leading-tight text-center w-full invisible">(This Week)</span>
                </div>
                <span className="text-2xl font-bold text-white mt-auto">&nbsp;{playerTotal}</span>
              </div>
            </div>
            {/* Coming Soon Features */}
            <div className="flex flex-col items-center text-center w-full">
              <ul className="mb-4 text-[#C2B56B] text-sm space-y-1 text-left w-full">
                <li>• Player growth metrics</li>
                <li>• Automated progress reports</li>
                <li>• AI-powered feedback</li>
                <li>• Tag trends & heatmaps</li>
                <li>• Development plan tracking</li>
              </ul>
              <span className="text-white italic text-xs block mt-2 w-full">
                These insights are coming soon. Stay tuned for advanced analytics!
              </span>
            </div>
          </div>
        ),
        highlight: false
      }]}
      cardClassName="w-full flex flex-col"
    />
  );
} 