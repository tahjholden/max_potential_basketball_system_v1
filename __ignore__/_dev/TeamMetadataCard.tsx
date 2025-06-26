import React from "react";
import { format } from "date-fns";
import PaneTitle from "@/components/PaneTitle";
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

const TeamMetadataCard: React.FC<TeamMetadataCardProps> = ({
  team,
  showDeleteButton = false,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-0">
        <PaneTitle>Team Profile</PaneTitle>
        {/* {showDeleteButton && (
          <DeleteTeamButton teamId={team.id} teamName={team.name} />
        )} */}
      </div>
      <div className="bg-zinc-800 rounded px-4 py-3 text-sm space-y-2">
        <div>
          <span className="text-zinc-500">Name:</span>{" "}
          <span className="font-bold" style={{ color: "#C2B56B", fontSize: "1.1rem" }}>{team.name}</span>
        </div>
        <div>
          <span className="text-zinc-500">Created:</span>{" "}
          {format(new Date(team.created_at), "MMMM do, yyyy")}
        </div>
        {team.coach_name && (
          <div>
            <span className="text-zinc-500">Coach:</span>{" "}
            <span className="font-medium text-zinc-300">{team.coach_name}</span>
          </div>
        )}
        {typeof team.player_count === "number" && (
          <div>
            <span className="text-zinc-500">Players:</span>{" "}
            <span className="font-medium text-zinc-300">{team.player_count}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMetadataCard; 