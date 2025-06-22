"use client";

import React from "react";
import DeletePlayerButton from "./DeletePlayerButton";

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
  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <h2 className="text-zinc-100 text-sm font-semibold mb-3">
        Players ({players.length})
      </h2>
      <input
        placeholder="Search players..."
        className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700"
      />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1 max-h-[calc(100vh-240px)]">
        {players.map((p) => (
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
            <div className="absolute right-2 bottom-2 hidden group-hover:block">
              <DeletePlayerButton playerId={p.id} playerName={p.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 