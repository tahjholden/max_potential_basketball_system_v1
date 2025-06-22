"use client";

import React, { useState } from "react";

interface Player {
  id: string;
  name: string;
  observations: number;
}

export default function PlayerListPane({
  players,
  selectedId,
  onSelect,
}: {
  players: Player[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <h2 className="text-zinc-100 text-sm font-semibold mb-3">
        Players ({filteredPlayers.length})
      </h2>
      <input
        placeholder="Search players..."
        className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1 max-h-[396px]">
        {filteredPlayers.map((p) => (
          <div key={p.id} className="relative group">
            <button
              onClick={() => onSelect(p.id)}
              className={`w-full text-left px-3 py-2 rounded ${
                selectedId === p.id
                  ? "bg-gold text-black"
                  : "bg-zinc-800 text-white"
              }`}
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 