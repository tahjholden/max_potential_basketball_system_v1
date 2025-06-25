"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import PaneTitle from "@/components/PaneTitle";
import AddPlayerButton from "./AddPlayerButton";

interface Player {
  id: string;
  name: string;
  observations: number;
  team_id?: string;
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
  teams?: { id: string; name: string }[];
  selectedTeamId?: string;
  setSelectedTeamId?: (id: string) => void;
}

export default function PlayerListPane({ 
  players, 
  pdps = [], 
  onSelect, 
  onPlayerAdded,
  sortNoPDPFirst = true,
  teams = [],
  selectedTeamId = "",
  setSelectedTeamId = () => {},
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

  // Filter by team
  const teamFilteredPlayers = selectedTeamId
    ? players.filter((p) => p.team_id === selectedTeamId)
    : players;

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
      {teams.length > 0 && (
        <div className="mb-2">
          <select
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
            className="w-full h-10 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm mb-2"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}
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
          filteredPlayers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((player) => {
              const hasNoPlan = !playerIdsWithPDP.has(player.id);
              const isSelected = playerId === player.id;

              let classes = "w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2";

              if (hasNoPlan) {
                classes += isSelected
                  ? " bg-[#A22828] text-white border-[#A22828]"
                  : " bg-zinc-900 text-[#A22828] border-[#A22828]";
              } else {
                classes += isSelected
                  ? " bg-[#C2B56B] text-black border-[#C2B56B]"
                  : " bg-zinc-900 text-[#C2B56B] border-[#C2B56B]";
              }

              return (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.id)}
                  className={classes}
                >
                  {player.name}
                </button>
              );
            })
        )}
      </div>
    </div>
  );
} 