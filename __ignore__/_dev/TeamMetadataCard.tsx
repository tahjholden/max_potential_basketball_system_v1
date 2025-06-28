import EntityMetadataCard from "@/components/EntityMetadataCard";
import { format } from "date-fns";
// import DeleteTeamButton from "@/components/DeleteTeamButton"; // If you want a delete

interface Team {
  id: string;
  name: string;
  created_at: string;
  coach_name?: string;
  player_count?: number;
}

interface TeamMetadataCardProps {
  team: Team;
  showDeleteButton?: boolean;
}

const TeamMetadataCard = ({ team }) => {
  const fields = [
    { label: "Name", value: <span className="font-bold text-[#C2B56B] text-base">{team.name}</span>, highlight: true },
    { label: "Created", value: format(new Date(team.created_at), "MMMM do, yyyy") },
    team.coach_name ? { label: "Coach", value: <span className="font-medium text-zinc-300">{team.coach_name}</span> } : undefined,
    typeof team.player_count === "number" ? { label: "Players", value: <span className="font-medium text-zinc-300">{team.player_count}</span> } : undefined,
  ].filter((f) => f !== undefined);
  return (
    <EntityMetadataCard
      fields={fields}
    />
  );
};

export default TeamMetadataCard; 