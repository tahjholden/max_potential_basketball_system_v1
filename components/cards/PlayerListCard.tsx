import type { Player } from "@/types/entities";
import EmptyCard from "@/components/ui/EmptyCard";

interface PlayerListCardProps {
  players: Player[];
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
  teams: any[];
}

export default function PlayerListCard({ players, selectedPlayerId, onSelect, teams }: PlayerListCardProps) {
  const hasTeams = teams && teams.length > 0;
  return (
    <div className="bg-white border-r border-gray-200 w-80 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Players</h2>
        <p className="text-sm text-gray-500">{players.length} players</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!hasTeams ? (
          <EmptyCard title="Add your first team to get started" />
        ) : players.length === 0 ? (
          <EmptyCard title="No players found" />
        ) : (
          <div className="divide-y divide-gray-200">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedPlayerId === player.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => onSelect(player.id)}
              >
                <div className="font-medium text-gray-900">{player.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 