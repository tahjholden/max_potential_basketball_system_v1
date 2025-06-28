import React from "react";
import { format } from "date-fns";
import EntityMetadataCard from "@/components/EntityMetadataCard";
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
  const fields = [
    { label: "Name", value: <span className="font-bold text-[#C2B56B] text-base">{coach.first_name} {coach.last_name}</span>, highlight: true },
    { label: "Role", value: <span className="font-medium text-zinc-300">{coach.is_admin ? "Administrator" : "Coach"}</span> },
    { label: "Joined", value: format(new Date(coach.created_at), "MMMM do, yyyy") },
    coach.team_name ? { label: "Team", value: <span className="font-medium text-zinc-300">{coach.team_name}</span> } : undefined,
    { label: "Email", value: <span className="text-zinc-300">{coach.email}</span> },
    { label: "Status", value: <span className={`font-medium ${coach.active ? "text-green-400" : "text-red-400"}`}>{coach.active ? "Active" : "Inactive"}</span> },
  ].filter((f) => f !== undefined);
  return (
    <EntityMetadataCard
      fields={fields}
    />
  );
};

export default CoachMetadataCard; 