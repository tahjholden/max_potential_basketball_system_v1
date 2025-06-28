"use client";

import React, { useState } from "react";
import SectionLabel from "@/components/SectionLabel";
import { ChevronDown } from "lucide-react";
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
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  onAddPlayer?: () => void;
  showAddPlayer?: boolean;
  teamOptions?: { id: string | null; name: string }[];
  selectedTeamId?: string | null;
  onSelectTeam?: (id: string | null) => void;
}

const MAX_PLAYERS = 10;

const DashboardPlayerListPane: React.FC<DashboardPlayerListPaneProps> = ({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onAddPlayer,
  showAddPlayer = true,
  teamOptions = [],
  selectedTeamId = null,
  onSelectTeam,
}) => {
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase())
  );
  const displayedPlayers = showAllPlayers
    ? filteredPlayers
    : filteredPlayers.slice(0, MAX_PLAYERS);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
      <SectionLabel>Players</SectionLabel>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
        {/* Header: Team select and Add Player */}
        <div className="flex items-center gap-2 mb-2">
          {teamOptions.length > 0 && onSelectTeam && (
            <select
              value={selectedTeamId || ''}
              onChange={e => onSelectTeam(e.target.value || null)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm"
              style={{ minWidth: 120 }}
            >
              {teamOptions.map(opt => (
                <option key={opt.id || 'all'} value={opt.id || ''}>{opt.name}</option>
              ))}
            </select>
          )}
          {showAddPlayer && onAddPlayer && (
            <button
              onClick={onAddPlayer}
              className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
            >
              + Add Player
            </button>
          )}
        </div>
        {/* Scrollable player list, responsive height */}
        <div className="flex-1 min-h-0 overflow-y-auto mb-2">
          {displayedPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={
                "w-full flex items-center justify-center rounded font-bold border-2 transition-colors px-4 py-2 mb-2 " +
                (player.id === selectedPlayerId
                  ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                  : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
              }
            >
              {player.name}
            </button>
          ))}
          {filteredPlayers.length > MAX_PLAYERS && (
            <div
              className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
              onClick={() => setShowAllPlayers(!showAllPlayers)}
              title={showAllPlayers ? "Show less" : "Show more"}
            >
              <div className="flex-1 border-t border-zinc-700"></div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showAllPlayers ? 'rotate-180' : ''}`} />
              <div className="flex-1 border-t border-zinc-700"></div>
            </div>
          )}
        </div>
        {/* Search bar at the bottom */}
        <input
          type="text"
          placeholder="Search players..."
          value={playerSearch}
          onChange={e => setPlayerSearch(e.target.value)}
          className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
        />
      </div>
    </div>
  );
};

export default DashboardPlayerListPane; 