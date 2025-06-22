"use client";

import React, { useState } from "react";
import DeletePlayerButton from "./DeletePlayerButton";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined?: string;
}

interface DashboardPlayerListPaneProps {
  players: Player[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function DashboardPlayerListPane({
  players,
  selectedId,
  onSelect,
}: DashboardPlayerListPaneProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[22%] max-w-xs bg-zinc-900 p-4 rounded-lg flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Players</h2>
      <input 
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 px-2 py-1 bg-zinc-800 rounded text-white border border-zinc-700" 
      />
      <div className="overflow-y-auto flex-1 space-y-1 pr-1">
        {filteredPlayers.map((p) => (
          <div key={p.id} className="relative group">
            <button
              onClick={() => onSelect(p.id)}
              className={`w-full text-left px-3 py-2 rounded ${
                selectedId === p.id ? "bg-gold text-black" : "bg-zinc-800 text-white"
              }`}
            >
              {p.name}
              <div className="text-xs opacity-70">{p.observations} observations</div>
            </button>
            <div className="absolute right-2 bottom-2 hidden group-hover:block">
              <DeletePlayerButton playerId={p.id} playerName={p.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 