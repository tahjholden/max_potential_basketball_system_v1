import React from "react";

interface ObservationListProps {
  observations: any[];
  players: any[];
}

export default function ObservationList({ observations, players }: ObservationListProps) {
  // Helper to get player name by id
  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : "Unknown Player";
  };

  return (
    <div className="space-y-4">
      {observations.length === 0 ? (
        <div className="text-zinc-400">No observations found.</div>
      ) : (
        observations.map((obs) => (
          <div key={obs.id} className="bg-zinc-900 rounded p-4">
            <div className="font-semibold text-white mb-1">{getPlayerName(obs.player_id)}</div>
            <div className="text-zinc-300">{obs.content}</div>
            <div className="text-xs text-zinc-500 mt-1">{obs.observation_date || obs.created_at}</div>
          </div>
        ))
      )}
    </div>
  );
} 