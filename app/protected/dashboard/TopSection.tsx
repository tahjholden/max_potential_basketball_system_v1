import React from "react";

interface TopSectionProps {
  playerCount: number;
  coachCount: number;
  observationsCount: number;
  pdpCount: number;
  onAddPlayer: () => void;
  onAddObservation: () => void;
}

export default function TopSection({
  playerCount,
  coachCount,
  observationsCount,
  pdpCount,
  onAddPlayer,
  onAddObservation,
}: TopSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <div className="bg-zinc-900 rounded-lg shadow border border-oldgold flex flex-col items-center py-6">
            <span className="text-3xl font-bold text-oldgold">{playerCount}</span>
            <span className="text-lg font-semibold text-oldgold mt-2">Players</span>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow border border-oldgold flex flex-col items-center py-6">
            <span className="text-3xl font-bold text-oldgold">{coachCount}</span>
            <span className="text-lg font-semibold text-oldgold mt-2">Coaches</span>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow border border-oldgold flex flex-col items-center py-6">
            <span className="text-3xl font-bold text-oldgold">{observationsCount}</span>
            <span className="text-lg font-semibold text-oldgold mt-2">Observations</span>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow border border-oldgold flex flex-col items-center py-6">
            <span className="text-3xl font-bold text-oldgold">{pdpCount}</span>
            <span className="text-lg font-semibold text-oldgold mt-2">PDPs</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-row gap-4 md:ml-8 mt-4 md:mt-0 self-end">
          <button
            className="px-6 py-2 rounded bg-oldgold text-black font-bold hover:bg-yellow-500 transition-colors"
            onClick={onAddPlayer}
          >
            Add Player
          </button>
          <button
            className="px-6 py-2 rounded bg-oldgold text-black font-bold hover:bg-yellow-500 transition-colors"
            onClick={onAddObservation}
          >
            Add Observation
          </button>
        </div>
      </div>
    </div>
  );
} 