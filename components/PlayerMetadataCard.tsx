import React from "react";
import { format } from "date-fns";
import DeletePlayerButton from "@/components/DeletePlayerButton";

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
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 space-y-1">
      <div className="space-y-1">
        <h3 className="text-zinc-100 text-sm font-semibold mb-2">Player Profile</h3>
        <div>
          <span className="text-zinc-500">Name:</span> {player.name}
        </div>
        <div>
          <span className="text-zinc-500">Joined:</span> {format(new Date(player.joined), "MMMM do, yyyy")}
        </div>
      </div>
      {showDeleteButton && playerId && (
        <div className="flex justify-end mt-3">
          <DeletePlayerButton playerId={playerId} playerName={player.name} />
        </div>
      )}
    </div>
  );
};

export default PlayerMetadataCard; 