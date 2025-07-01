import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ObservationListProps {
  observations: any[];
  players: any[];
  searchTerm: string;
}

export default function ObservationList({ observations, players, searchTerm }: ObservationListProps) {
  const [visibleCount, setVisibleCount] = useState(6); // Show 2 rows (3 columns x 2 rows = 6)

  const getPlayerName = (playerId: string) => {
    if (!players || !Array.isArray(players)) return 'Unknown Player';
    const player = players.find(p => p.id === playerId);
    return player ? (player.first_name && player.last_name 
      ? `${player.first_name} ${player.last_name}` 
      : player.name || `Player ${player.id}`) : 'Unknown Player';
  };

  // Filter observations based on search term
  const filtered = observations.filter(obs => {
    const playerName = getPlayerName(obs.player_id);
    return !searchTerm || 
      playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const visible = filtered.slice(0, visibleCount);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((obs, i) => (
          <div key={i} className="bg-[#232323] border border-[#323232] rounded-lg p-4 shadow-md text-sm text-[#f5f5f7] space-y-2">
            <div className="flex justify-between items-center text-[#d8cc97] font-semibold text-sm">
              <span>{getPlayerName(obs.player_id)}</span>
              <span className="text-xs text-[#b0b0b0]">{obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : 'No date'}</span>
            </div>
            <p className="text-[#f5f5f7]">{obs.content}</p>
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="bg-[#d8cc97] text-[#161616] font-bold px-4 py-2 rounded hover:bg-[#d8cc97]/80 transition-colors"
          >
            Show More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center text-[#f5f5f7] italic">No observations match your search.</div>
      )}
    </div>
  );
} 