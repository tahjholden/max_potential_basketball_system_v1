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
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 space-y-1">
      <div className="space-y-1">
        <PaneTitle>Player Profile</PaneTitle>
        <div className="pt-2">
          <div>
            <span className="text-zinc-500">Name:</span> <span className="text-gold font-bold">{player.name}</span>
          </div>
          <div>
            <span className="text-zinc-500">Joined:</span> {format(new Date(player.joined), "MMMM do, yyyy")}
          </div>
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