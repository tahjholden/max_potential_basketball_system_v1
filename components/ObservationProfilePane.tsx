"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib/ui-utils";
import DeleteObservationButton from "./DeleteObservationButton";
import { actionButtonClass } from "@/lib/utils";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_id: string;
}

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined?: string;
}

export default function ObservationProfilePane({
  player,
  observations,
}: {
  player: Player | null;
  observations: Observation[];
}) {
  const [viewAll, setViewAll] = useState(false);
  const visibleObservations = viewAll ? observations : observations.slice(0, 3);

  // Sort observations by date
  const sorted = observations.slice().sort((a, b) => {
    const dateA = a.observation_date || a.created_at;
    const dateB = b.observation_date || b.created_at;
    return dateA.localeCompare(dateB);
  });

  // Calculate date range
  const dateRange = sorted.length > 0
    ? `Observations from ${formatDate(sorted[0].observation_date || sorted[0].created_at)} to ${formatDate(sorted[sorted.length - 1].observation_date || sorted[sorted.length - 1].created_at)}`
    : null;

  if (!player) {
    return (
      <main className="w-full lg:flex-1 lg:max-w-[700px] bg-zinc-900 p-5 rounded-xl shadow-inner overflow-y-auto">
        <div className="text-center text-zinc-500 mt-8">
          <p>Select a player to view observations</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full lg:flex-1 lg:max-w-[700px] bg-zinc-900 p-5 rounded-xl shadow-inner overflow-y-auto">
      <h2 className="text-sm font-semibold text-zinc-400 mb-4">Observations: {player.name}</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-zinc-400">
            Total Observations: {observations.length}
          </p>
          {dateRange && (
            <p className="text-xs text-zinc-500 mt-1">{dateRange}</p>
          )}
        </div>
        <button className={actionButtonClass}>
          Add Observation
        </button>
      </div>

      <div className="bg-zinc-800 rounded p-4 shadow-inner mb-6">
        <p className="text-sm text-zinc-400 font-semibold mb-2">Recent Observations</p>
        {observations.length === 0 ? (
          <p className="text-zinc-500 text-sm">No observations found for this player.</p>
        ) : (
          <ul className="space-y-3">
            {visibleObservations.map((obs) => (
              <li key={obs.id} className="relative bg-zinc-700 p-3 rounded text-sm text-zinc-200">
                <div className="absolute top-2 right-2">
                  <DeleteObservationButton observationId={obs.id} />
                </div>
                <p className="text-xs text-zinc-500 mb-1">
                  {formatDate(obs.observation_date || obs.created_at)}
                </p>
                <p>{obs.content}</p>
              </li>
            ))}
          </ul>
        )}
        {observations.length > 3 && (
          <button
            className="mt-4 text-sm text-yellow-400 underline"
            onClick={() => setViewAll(!viewAll)}
          >
            {viewAll ? "Show Less" : "View All Observations"}
          </button>
        )}
      </div>
    </main>
  );
} 