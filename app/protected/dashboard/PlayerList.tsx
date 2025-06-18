import React from "react";

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
              <button
                className="px-3 py-1 rounded bg-oldgold text-black font-semibold hover:bg-yellow-500 transition-colors"
                onClick={() => onAddObservation(player)}
              >
                Add Observation
              </button>
              <button
                className="px-3 py-1 rounded border border-oldgold text-oldgold font-semibold hover:bg-yellow-900/20 transition-colors"
                onClick={() => onUpdatePDP(player)}
              >
                Update PDP
              </button>
              <button
                className="px-3 py-1 rounded border border-oldgold text-oldgold font-semibold hover:bg-yellow-900/20 transition-colors"
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