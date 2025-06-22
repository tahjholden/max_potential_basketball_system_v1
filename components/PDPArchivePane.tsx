"use client";

import React from "react";
import PaneTitle from "@/components/PaneTitle";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

interface ArchivedPdp {
  id: string;
  dateRange: string;
  summary: string;
}

interface PDPArchivePaneProps {
  pdps: ArchivedPdp[];
  sortOrder: string;
  onSortOrderChange: (order: string) => void;
}

export default function PDPArchivePane({
  pdps,
  sortOrder,
  onSortOrderChange,
}: PDPArchivePaneProps) {
  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <PaneTitle>Archived PDPs</PaneTitle>
      
      <div className="mb-4">
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
      
      <div className="space-y-3">
        {pdps.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-4">
            No archived plans found.
          </div>
        ) : (
          pdps.map((pdp) => (
            <div key={pdp.id} className="bg-zinc-800 p-3 rounded text-sm">
              <p className="text-yellow-400 font-semibold mb-1">{pdp.dateRange}</p>
              <p className="text-zinc-400 text-xs mb-2">{pdp.dateRange}</p>
              <p className="text-zinc-300">{pdp.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 