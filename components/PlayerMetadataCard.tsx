import React from "react";
import { format } from "date-fns";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import PaneTitle from "@/components/PaneTitle";

interface Player {
  name: string;
  joined: string;
}

interface PlayerMetadataCardProps {
  player: Player;
  observations: any[];
  playerId?: string;
  showDeleteButton?: boolean;
}

const PlayerMetadataCard: React.FC<PlayerMetadataCardProps> = ({
  player,
  observations,
  playerId,
  showDeleteButton = false,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <PaneTitle>Player Profile</PaneTitle>
        {showDeleteButton && playerId && (
          <DeletePlayerButton playerId={playerId} playerName={player.name} />
        )}
      </div>
      <div className="bg-zinc-800 rounded px-4 py-3 text-sm space-y-2">
        <div>
          <span className="text-zinc-500">Name:</span> <span className="text-gold font-bold">{player.name}</span>
        </div>
        <div>
          <span className="text-zinc-500">Joined:</span> {format(new Date(player.joined), "MMMM do, yyyy")}
        </div>
      </div>
    </div>
  );
};

export default PlayerMetadataCard; 