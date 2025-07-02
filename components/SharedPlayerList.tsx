import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations?: number;
  joined?: string;
}

interface TeamOption {
  id: string | null;
  name: string;
}

interface SharedPlayerListProps {
  players: Player[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  teamOptions?: TeamOption[];
  selectedTeamId?: string | null;
  onSelectTeam?: (id: string | null) => void;
  showAddPlayer?: boolean;
  onAddPlayer?: () => void;
  playerIdsWithPDP?: Set<string>;
}

const MAX_PLAYERS = 10;

const SharedPlayerList: React.FC<SharedPlayerListProps> = ({
  players,
  selectedPlayerId,
  onSelectPlayer,
  teamOptions = [],
  selectedTeamId = null,
  onSelectTeam,
  showAddPlayer = false,
  onAddPlayer,
  playerIdsWithPDP = new Set(),
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
    <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
      {/* Header: Team select */}
      <div className="flex items-center gap-2 mb-2">
        {teamOptions.length > 0 && onSelectTeam && (
          <select
            value={selectedTeamId || ''}
            onChange={e => onSelectTeam(e.target.value || null)}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm"
            style={{ minWidth: 120 }}
          >
            <option key="all" value="">All Teams</option>
            {teamOptions.map(opt => (
              <option key={opt.id || 'all'} value={opt.id || ''}>{opt.name}</option>
            ))}
          </select>
        )}
      </div>
      {/* Always show search bar */}
      <input
        type="text"
        placeholder="Search players..."
        value={playerSearch}
        onChange={e => setPlayerSearch(e.target.value)}
        className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm mb-2"
      />
      {/* Player list */}
      <div className="flex-1 min-h-0 mb-0">
        {displayedPlayers.map(player => {
          const hasPlan = playerIdsWithPDP.has(player.id);
          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={
                "w-full flex items-center justify-center rounded font-bold border-2 transition-colors px-4 py-2 mb-2 " +
                (hasPlan
                  ? (player.id === selectedPlayerId
                      ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                      : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
                  : (player.id === selectedPlayerId
                      ? "bg-[#A22828] text-white border-[#A22828]"
                      : "bg-zinc-900 text-[#A22828] border-[#A22828] hover:bg-[#A22828]/10")
                )
              }
            >
              {player.name}
            </button>
          );
        })}
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
    </div>
  );
};

export default SharedPlayerList; 