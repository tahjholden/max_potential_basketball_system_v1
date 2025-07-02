"use client";

import { Users, Search, Building2 } from "lucide-react";
import { useState, useMemo } from "react";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  created_at: string;
  joined: string;
  team_name?: string;
}

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
}

interface CoachPlayersPaneProps {
  players: Player[];
  coach: Coach | undefined;
  onSortOrderChange?: (order: string) => void;
  sortOrder?: string;
}

export default function CoachPlayersPane({ 
  players, 
  coach, 
  onSortOrderChange, 
  sortOrder = "desc" 
}: CoachPlayersPaneProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  // Filter players based on search term
  useMemo(() => {
    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(filtered);
  }, [players, searchTerm]);

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    onSortOrderChange?.(newOrder);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gold" />
          <h3 className="text-xl font-bold text-white">Team Players</h3>
        </div>
        <div className="text-sm text-zinc-400">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search players or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
          />
        </div>
      </div>

      {/* Sort Button */}
      <div className="mb-4">
        <button
          onClick={handleSortOrderChange}
          className="text-xs px-3 py-1 border border-zinc-600 rounded text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-400 mb-2">
            {searchTerm ? "No Players Found" : "No Players Available"}
          </h4>
          <p className="text-sm text-zinc-500">
            {searchTerm 
              ? "Try adjusting your search terms." 
              : coach 
                ? `${coach.first_name} doesn't have any players assigned yet.`
                : "Select a coach to view their players."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-750 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{player.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gold text-black px-2 py-1 rounded font-bold">
                    {player.observations} obs
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                {player.team_name && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{player.team_name}</span>
                  </div>
                )}
                <div>
                  Joined: {player.joined}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPlayers.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="text-center text-sm text-zinc-400">
            Showing {filteredPlayers.length} of {players.length} players
          </div>
        </div>
      )}
    </div>
  );
} 