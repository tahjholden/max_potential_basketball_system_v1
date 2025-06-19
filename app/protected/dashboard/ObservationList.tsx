import React, { useState } from "react";
import Link from "next/link";

interface ObservationListProps {
  observations: any[];
  players: any[];
}

export default function ObservationList({ observations, players }: ObservationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  // Helper to get player name by id
  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : "Unknown Player";
  };

  const filtered = observations.filter(obs =>
    getPlayerName(obs.player_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    obs.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name or keyword..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setVisibleCount(5); // reset to 5 on new search
          }}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded mr-4"
        />
        <Link
          href="/protected/observations"
          className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-gold/80 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((obs, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-md text-sm text-gray-100 space-y-2">
            <div className="flex justify-between items-center text-gold font-semibold text-sm">
              <span>{getPlayerName(obs.player_id)}</span>
              <span className="text-xs text-gray-400">{obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : 'No date'}</span>
            </div>
            <p className="text-gray-200">{obs.content}</p>
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold/80 transition"
          >
            See More
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 italic">No observations match your search.</div>
      )}
    </div>
  );
} 