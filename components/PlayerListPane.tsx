"use client";

import React from "react";
import DeletePlayerButton from "./DeletePlayerButton";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
}

interface PlayerListPaneProps {
  players: Player[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function PlayerListPane({
  players,
  selectedId,
  onSelect,
}: PlayerListPaneProps) {
  return (
    <aside className="w-full lg:max-w-[260px] bg-zinc-900 p-4 rounded-xl shadow-inner flex flex-col">
      <input
        placeholder="Search players..."
        className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700"
      />
      <div className="overflow-y-auto flex-1 pr-1 space-y-1">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`w-full text-left px-3 py-2 rounded ${
              selectedId === p.id ? "bg-yellow-800 text-black" : "bg-zinc-800 text-white"
            }`}
          >
            {p.name}
            <div className="text-xs opacity-70">{p.observations} observations</div>
          </button>
        ))}
      </div>
    </aside>
  );
} 