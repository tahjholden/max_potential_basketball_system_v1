"use client";

import React from "react";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

export default function PDPArchivePane({
  pdps,
  sortOrder,
  onSortOrderChange,
}: {
  pdps: any[];
  sortOrder: string;
  onSortOrderChange: (order: string) => void;
}) {
  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <h2 className="text-zinc-100 text-sm font-semibold mb-3">Archived PDPs</h2>

      <div className="mb-3">
        <label className="text-xs text-zinc-500">Sort Order:</label>
        <select
          className="w-full mt-1 px-2 py-1 bg-zinc-800 text-white border border-zinc-600 rounded"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <ul className="space-y-3">
        {pdps.length > 0 ? (
          pdps.map((pdp) => (
            <li key={pdp.id} className="bg-zinc-800 p-3 rounded text-sm text-zinc-200">
              <p className="text-xs text-zinc-500 mb-1">{pdp.dateRange}</p>
              <p>{pdp.summary}</p>
            </li>
          ))
        ) : (
          <li className="bg-zinc-800 p-3 rounded text-sm text-zinc-500 text-center">
            No archived PDPs found
          </li>
        )}
      </ul>
    </div>
  );
} 