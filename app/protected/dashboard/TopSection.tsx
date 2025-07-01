import React from "react";

interface TopSectionProps {
  coachName: string;
  onAddPlayer: () => void;
  onAddObservation: () => void;
}

export default function TopSection({
  coachName,
  onAddPlayer,
  onAddObservation,
}: TopSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Welcome Section */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#f5f5f7] mb-2">Welcome, {coachName}</h1>
          <p className="text-[#b0b0b0]">Manage your players and observations</p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-row gap-2 mt-4 md:mt-0">
          <button
            className="bg-[#d8cc97] text-[#161616] font-bold px-4 py-2 rounded hover:bg-[#d8cc97]/80 transition"
            onClick={onAddPlayer}
          >
            Add Player
          </button>
          <button
            className="bg-[#d8cc97] text-[#161616] font-bold px-4 py-2 rounded hover:bg-[#d8cc97]/80 transition"
            onClick={onAddObservation}
          >
            Add Observation
          </button>
        </div>
      </div>
    </div>
  );
} 