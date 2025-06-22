"use client";

import React, { useState, useEffect } from "react";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import PaneTitle from "@/components/PaneTitle";

interface Player {
  id: string;
  name: string;
  observations: number;
}

interface PlayerListPaneProps {
  players: Player[];
  onSelect?: () => void;
}

export default function PlayerListPane({ players, onSelect }: PlayerListPaneProps) {
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [players, searchTerm]);

  const handlePlayerSelect = (id: string) => {
    setPlayerId(id);
    if (onSelect) onSelect();
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <PaneTitle>Players</PaneTitle>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredPlayers.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-4">
            {searchTerm ? "No players found." : "No players available."}
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              className={`w-full text-left p-3 rounded transition-colors ${
                playerId === player.id
                  ? "bg-gold text-black font-bold text-base"
                  : "bg-zinc-800 text-white text-sm hover:bg-zinc-700"
              }`}
            >
              {player.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
} 