import React from "react";
import Link from "next/link";

interface PlayerListProps {
  players: any[];
  searchQuery: string;
  onSearch: (query: string) => void;
  onManagePDP: (player: any) => void;
}

export default function PlayerList({ players, searchQuery, onSearch, onManagePDP }: PlayerListProps) {
  if (!players || !Array.isArray(players)) {
    return <div className="text-[#f5f5f7]">No players found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="player-search" className="text-[#f5f5f7] font-semibold">
          Search Players
        </label>
        <input
          id="player-search"
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="px-3 py-2 bg-[#232323] border border-[#323232] rounded text-[#f5f5f7] placeholder-[#b0b0b0] focus:outline-none focus:border-[#d8cc97]"
        />
      </div>

      {players.length === 0 ? (
        <div className="text-[#f5f5f7]">No players found.</div>
      ) : (
        players.map((player) => (
          <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#232323] rounded p-4 gap-2 border border-[#323232]">
            <div className="font-semibold text-[#d8cc97]">
              {player.first_name && player.last_name 
                ? `${player.first_name} ${player.last_name}` 
                : player.name || `Player ${player.id}`}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/protected/players/${player.id}`}
                className="px-3 py-1 rounded bg-[#d8cc97] text-[#161616] font-bold hover:bg-[#d8cc97]/80 transition-colors"
              >
                View Details
              </Link>
              <button
                className="px-3 py-1 rounded border border-[#d8cc97] text-[#d8cc97] font-bold hover:bg-[#d8cc97]/10 transition-colors"
                onClick={() => onManagePDP(player)}
              >
                Manage PDP
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 