"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import PaneTitle from "@/components/PaneTitle";
import AddPlayerButton from "./AddPlayerButton";

interface Player {
  id: string;
  name: string;
  observations: number;
}

interface Pdp {
  id: string;
  player_id: string;
  content: string | null;
  archived_at: string | null;
}

interface PlayerListPaneProps {
  players: Player[];
  pdps?: Pdp[];
  onSelect?: () => void;
  onPlayerAdded?: () => void;
  sortNoPDPFirst?: boolean;
}

export default function PlayerListPane({ 
  players, 
  pdps = [], 
  onSelect, 
  onPlayerAdded,
  sortNoPDPFirst = true 
}: PlayerListPaneProps) {
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  // Get players without active PDPs - simplified logic
  const playerIdsWithPDP = useMemo(() => new Set(
    pdps
      .filter(pdp => !pdp.archived_at) // Check archived_at
      .map(pdp => pdp.player_id)
  ), [pdps]);
  
  // Debug logging to identify the issue
  console.log("=== PDP Debug Info ===");
  console.log("Total PDPs received:", pdps.length);
  console.log("PDPs data:", pdps);
  console.log("Player IDs with PDP:", Array.from(playerIdsWithPDP));
  console.log("Total players:", players.length);
  console.log("Player IDs:", players.map(p => p.id));
  console.log("Players without PDP count:", players.filter(p => !playerIdsWithPDP.has(p.id)).length);
  console.log("=== End Debug Info ===");
  
  const playersWithoutPDP = useMemo(() => 
    players.filter(p => !playerIdsWithPDP.has(p.id)), 
    [players, playerIdsWithPDP]
  );
  
  const playersWithPDP = useMemo(() => 
    players.filter(p => playerIdsWithPDP.has(p.id)), 
    [players, playerIdsWithPDP]
  );

  // Sort players: no-PDP first (if enabled), then by name
  const sortedPlayers = useMemo(() => {
    return sortNoPDPFirst 
      ? [
          ...playersWithoutPDP.sort((a, b) => a.name.localeCompare(b.name)),
          ...playersWithPDP.sort((a, b) => a.name.localeCompare(b.name))
        ]
      : players.sort((a, b) => a.name.localeCompare(b.name));
  }, [players, playersWithoutPDP, playersWithPDP, sortNoPDPFirst]);

  useEffect(() => {
    const filtered = sortedPlayers.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [sortedPlayers, searchTerm]);

  const handlePlayerSelect = (id: string) => {
    setPlayerId(id);
    if (onSelect) onSelect();
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <PaneTitle>Players</PaneTitle>
        {onPlayerAdded && <AddPlayerButton onPlayerAdded={onPlayerAdded} />}
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-3">
        {filteredPlayers.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-4">
            {searchTerm ? "No players found." : "No players available."}
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const missingPDP = !playerIdsWithPDP.has(player.id);
            
            return (
              <button
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                className={`w-full text-left p-3 rounded transition-colors flex items-center justify-between ${
                  playerId === player.id
                    ? missingPDP 
                      ? "bg-zinc-700 text-white font-bold text-base"
                      : "bg-gold text-black font-bold text-base"
                    : missingPDP
                    ? "border-2 border-red-500 bg-zinc-950/60 text-white text-sm hover:bg-zinc-800"
                    : "bg-zinc-800 text-white text-sm hover:bg-zinc-700"
                }`}
              >
                <span>{player.name}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
} 