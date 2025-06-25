import React from "react";
import { format } from "date-fns";
import PaneTitle from "@/components/PaneTitle";
// import DeleteCoachButton from "@/components/DeleteCoachButton";

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_name?: string;
}

interface CoachMetadataCardProps {
  coach: Coach;
  showDeleteButton?: boolean;
}

const CoachMetadataCard: React.FC<CoachMetadataCardProps> = ({
  coach,
  showDeleteButton = false,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <PaneTitle>Coach Profile</PaneTitle>
        {/* {showDeleteButton && (
          <DeleteCoachButton coachId={coach.id} coachName={`${coach.first_name} ${coach.last_name}`} />
        )} */}
      </div>
      <div className="bg-zinc-800 rounded px-4 py-3 text-sm space-y-2">
        <div>
          <span className="text-zinc-500">Name:</span>{" "}
          <span className="font-bold" style={{ color: "#C2B56B", fontSize: "1.1rem" }}>
            {coach.first_name} {coach.last_name}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Role:</span>{" "}
          <span className="font-medium text-zinc-300">{coach.is_admin ? "Administrator" : "Coach"}</span>
        </div>
        <div>
          <span className="text-zinc-500">Joined:</span>{" "}
          {format(new Date(coach.created_at), "MMMM do, yyyy")}
        </div>
        {coach.team_name && (
          <div>
            <span className="text-zinc-500">Team:</span>{" "}
            <span className="font-medium text-zinc-300">{coach.team_name}</span>
          </div>
        )}
        <div>
          <span className="text-zinc-500">Email:</span>{" "}
          <span className="text-zinc-300">{coach.email}</span>
        </div>
        <div>
          <span className="text-zinc-500">Status:</span>{" "}
          <span className={`font-medium ${coach.active ? "text-green-400" : "text-red-400"}`}>
            {coach.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoachMetadataCard; 