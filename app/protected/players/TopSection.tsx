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
          <div className="bg-black text-center text-gold font-bold py-4 rounded-lg shadow w-full">
            <div className="text-3xl">{playerCount}</div>
            <div className="text-sm">Players</div>
          </div>
          <div className="bg-black text-center text-gold font-bold py-4 rounded-lg shadow w-full">
            <div className="text-3xl">{coachCount}</div>
            <div className="text-sm">Coaches</div>
          </div>
          <div className="bg-black text-center text-gold font-bold py-4 rounded-lg shadow w-full">
            <div className="text-3xl">{observationsCount}</div>
            <div className="text-sm">Observations</div>
          </div>
          <div className="bg-black text-center text-gold font-bold py-4 rounded-lg shadow w-full">
            <div className="text-3xl">{pdpCount}</div>
            <div className="text-sm">PDPs</div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-row gap-2 mt-4 md:mt-0">
          <button
            className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold/80 transition"
            onClick={onAddPlayer}
          >
            Add Player
          </button>
          <button
            className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold/80 transition"
            onClick={onAddObservation}
          >
            Add Observation
          </button>
        </div>
      </div>
    </div>
  );
} 