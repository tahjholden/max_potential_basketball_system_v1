"use client";

import React from "react";
import { Card } from "@/components/ui/card";

// Reusable card for metrics, analytics, etc.
export default function ObservationInsightsPane({ total, playerTotal, comingSoon = true }: { total: number, playerTotal: number, comingSoon?: boolean}) {
  return (
    <Card className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col gap-4 w-full max-w-xs shadow-sm">
      {/* SECTION HEADER IS NOW INSIDE THE CARD */}
      <h2 className="text-white font-semibold text-base mb-3">
        Insights & Analytics
      </h2>
      {/* Metric Cards (look unified, not floating) */}
      <div className="flex flex-col gap-2">
        <Card className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-start">
          <span className="text-zinc-400 text-xs mb-0.5">Total Observations</span>
          <span className="text-2xl font-bold text-white">{total ?? 0}</span>
        </Card>
        <Card className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-start">
          <span className="text-zinc-400 text-xs mb-0.5">Player Observations</span>
          <span className="text-2xl font-bold text-white">{playerTotal ?? 0}</span>
        </Card>
      </div>
      {/* Coming Soon */}
      {comingSoon && (
        <Card className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
          <span className="block text-zinc-400 text-xs font-semibold mb-2">
            Coming Soon
          </span>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs ml-2">
            <li>AI-powered constraint suggestions</li>
            <li>Tag trend visualizations</li>
            <li>Drill recommendations</li>
            <li>Observation frequency analysis</li>
            <li>Progress tracking metrics</li>
            <li>Export Observations</li>
            <li>Generate Report</li>
            <li>View Analytics</li>
          </ul>
        </Card>
      )}
    </Card>
  );
} 