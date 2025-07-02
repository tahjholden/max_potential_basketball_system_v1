// This file has been moved to __ignore__/_dev/PlayerListShared.tsx as part of archiving old player list variations.
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { NoTeamsEmptyState } from "@/components/ui/EmptyState";
import EmptyStateCard from "@/components/ui/EmptyStateCard";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
  team_id?: string;
  team_name?: string;
}

interface Team {
  id: string | null;
  name: string;
}

interface PlayerListSharedProps {
  players: Player[];
  teams: Team[];
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string) => void;
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  playerIdsWithPDP?: Set<string>;
}

const MAX_PLAYERS = 10;

const PlayerListShared: React.FC<PlayerListSharedProps> = ({
  players,
  teams,
  selectedPlayerId,
  setSelectedPlayerId,
  selectedTeamId,
  setSelectedTeamId,
  playerIdsWithPDP = new Set(),
}) => {
  const [playerSearch, setPlayerSearch] = useState("");
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  // Team filter options
  const teamOptions = [
    { id: null, name: "All Teams" },
    ...teams.map((t) => ({ id: t.id, name: t.name })),
  ];

  // Filter and sort players
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  const filteredByTeam = selectedTeamId
    ? sortedPlayers.filter((p) => p.team_id === selectedTeamId)
    : sortedPlayers;
  const filteredPlayers = playerSearch.trim()
    ? filteredByTeam.filter((p) =>
        p.name.toLowerCase().includes(playerSearch.toLowerCase())
      )
    : filteredByTeam;
  const displayedPlayers = showAllPlayers
    ? filteredPlayers
    : filteredPlayers.slice(0, MAX_PLAYERS);

  // Player item rendering (with PDP status coloring)
  const renderPlayerItem = (player: Player, isSelected: boolean) => {
    const hasNoPlan = playerIdsWithPDP.size > 0 && !playerIdsWithPDP.has(player.id);
    const baseClasses =
      "w-[calc(100%-0.5rem)] text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2";
    let classes = baseClasses;
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
        onClick={() => setSelectedPlayerId(player.id)}
        className={classes + " text-center"}
      >
        {player.name}
      </button>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
      {(teams.length === 0 || players.length === 0) ? (
        <NoTeamsEmptyState onAddTeam={() => {}} />
      ) : (
        <>
          {/* Header: Team select */}
          <div className="flex items-center gap-2 mb-2">
            <select
              value={selectedTeamId || ""}
              onChange={(e) => setSelectedTeamId(e.target.value || null)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm"
              style={{ minWidth: 120 }}
            >
              {teamOptions.map((opt) => (
                <option key={opt.id || "all"} value={opt.id || ""}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
          {/* Scrollable player list, responsive height */}
          <div className="flex-1 min-h-0 mb-2">
            {displayedPlayers.map((player) =>
              renderPlayerItem(player, selectedPlayerId === player.id)
            )}
            {teams.length > 0 && filteredPlayers.length > MAX_PLAYERS && (
              <div
                className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                title={showAllPlayers ? "Show less" : "Show more"}
              >
                <div className="flex-1 border-t border-zinc-700"></div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${showAllPlayers ? "rotate-180" : ""}`}
                />
                <div className="flex-1 border-t border-zinc-700"></div>
              </div>
            )}
          </div>
          {/* Search bar at the bottom - only show when chevron is needed and there are players */}
          {teams.length > 0 && displayedPlayers.length > 0 && filteredPlayers.length > MAX_PLAYERS && (
            <input
              type="text"
              placeholder="Search players..."
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
            />
          )}
        </>
      )}
    </div>
  );
};

export default PlayerListShared; 