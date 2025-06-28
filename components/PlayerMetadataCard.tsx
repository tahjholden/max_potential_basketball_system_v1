import EntityMetadataCard from "@/components/EntityMetadataCard";
import Link from "next/link";
import { formatDate } from "@/lib/ui-utils";
import DeletePlayerButton from "@/components/DeletePlayerButton";

interface Player {
  name: string;
  joined: string;
  team_name?: string;
}

interface PlayerMetadataCardProps {
  player: Player;
  playerId?: string;
  showDeleteButton?: boolean;
}

const PlayerMetadataCard: React.FC<PlayerMetadataCardProps> = ({
  player,
  playerId,
  showDeleteButton = false,
}) => {
  const fields = [
    { label: "Name", value: <span className="font-bold text-[#C2B56B] text-base">{player.name}</span>, highlight: true },
    { label: "Joined", value: formatDate(player.joined) },
    player.team_name
      ? {
          label: "Team",
          value: (
            <Link href={`/protected/teams?playerId=${playerId}`} className="text-[#C2B56B] hover:text-[#C2B56B]/80 underline transition-colors">
              {player.team_name}
            </Link>
          ),
        }
      : undefined,
  ].filter((f) => f !== undefined);
  return (
    <EntityMetadataCard
      actions={
        showDeleteButton && playerId ? (
          <DeletePlayerButton playerId={playerId} playerName={player.name} />
        ) : null
      }
      fields={fields}
    />
  );
};

export default PlayerMetadataCard; 