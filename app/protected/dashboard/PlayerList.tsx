import React from "react";
import Link from "next/link";

interface PlayerListProps {
  players: any[];
  onAddObservation: (player: any) => void;
  onUpdatePDP: (player: any) => void;
  onViewPDPHistory: (player: any) => void;
}

export default function PlayerList({ players, onAddObservation, onUpdatePDP, onViewPDPHistory }: PlayerListProps) {
  return (
    <div className="space-y-4">
      {players.length === 0 ? (
        <div className="text-zinc-400">No players found.</div>
      ) : (
        players.map((player) => (
          <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900 rounded p-4 gap-2">
            <div className="font-semibold text-white">{player.first_name} {player.last_name}</div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/protected/players/${player.id}`}
                className="px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
              <button
                className="px-3 py-1 rounded bg-gold text-black font-semibold hover:bg-gold/80 transition-colors"
                onClick={() => onAddObservation(player)}
              >
                Add Observation
              </button>
              <button
                className="px-3 py-1 rounded border border-gold text-gold font-semibold hover:bg-gold/10 transition-colors"
                onClick={() => onUpdatePDP(player)}
              >
                Update PDP
              </button>
              <button
                className="px-3 py-1 rounded border border-gold text-gold font-semibold hover:bg-gold/10 transition-colors"
                onClick={() => onViewPDPHistory(player)}
              >
                PDP History
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 