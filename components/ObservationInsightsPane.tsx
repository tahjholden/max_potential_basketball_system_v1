"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ObservationInsightsPaneProps {
  totalObservations?: number;
  selectedPlayerObservations?: number;
}

export default function ObservationInsightsPane({
  totalObservations = 0,
  selectedPlayerObservations = 0,
}: ObservationInsightsPaneProps) {
  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <h2 className="text-zinc-100 text-sm font-semibold mb-3">Insights & Analytics</h2>
      <div className="grid gap-4 mt-4">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalObservations}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Player Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {selectedPlayerObservations}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-300">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-400">
            <ul className="list-disc pl-5 space-y-1">
              <li>AI-powered constraint suggestions</li>
              <li>Tag trend visualizations</li>
              <li>Drill recommendations</li>
              <li>Observation frequency analysis</li>
              <li>Progress tracking metrics</li>
              <li>Export Observations</li>
              <li>Generate Report</li>
              <li>View Analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 