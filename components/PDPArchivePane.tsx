"use client";

import React, { useState } from "react";
import PaneTitle from "@/components/PaneTitle";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";

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
  observations: Observation[];
  start_date: string;
  archived_at: string;
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
  const [expandedPdps, setExpandedPdps] = useState<Set<string>>(new Set());

  const togglePdpExpansion = (pdpId: string) => {
    const newExpanded = new Set(expandedPdps);
    if (newExpanded.has(pdpId)) {
      newExpanded.delete(pdpId);
    } else {
      newExpanded.add(pdpId);
    }
    setExpandedPdps(newExpanded);
  };

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
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-400 font-semibold">{pdp.dateRange}</p>
                <button
                  onClick={() => togglePdpExpansion(pdp.id)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  {expandedPdps.has(pdp.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              </div>
              
              <p className="text-zinc-300 mb-2">{pdp.summary}</p>
              
              <p className="text-zinc-400 text-xs mb-2">
                {format(new Date(pdp.start_date), "MMM d, yyyy")} - {format(new Date(pdp.archived_at), "MMM d, yyyy")}
              </p>

              {/* Observations Section */}
              {expandedPdps.has(pdp.id) && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-zinc-400 text-xs font-semibold mb-2">
                    Observations ({pdp.observations.length})
                  </p>
                  {pdp.observations.length > 0 ? (
                    <div className="space-y-2">
                      {pdp.observations.map((obs) => (
                        <div key={obs.id} className="bg-zinc-900 p-2 rounded text-xs">
                          <p className="text-zinc-500 mb-1">
                            {format(new Date(obs.observation_date || obs.created_at), "MMM d, yyyy")}
                          </p>
                          <p className="text-zinc-300">{obs.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-xs italic">No observations in this period.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 