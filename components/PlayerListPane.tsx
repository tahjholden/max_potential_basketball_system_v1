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
              className={`w-full text-left p-3 rounded text-sm transition-colors ${
                playerId === player.id
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              <div className="font-medium">{player.name}</div>
              <div className="text-xs text-zinc-500">
                {player.observations} observation{player.observations !== 1 ? 's' : ''}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 