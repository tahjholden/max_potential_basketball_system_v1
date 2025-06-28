"use client";

import { useState } from "react";
import { GoldButton } from "@/components/ui/gold-button";
import { Button } from "@/components/ui/button";
import EntityMetadataCard, { EntityField } from "@/components/EntityMetadataCard";

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_name?: string;
}

interface CoachMetadataCardProps {
  coach: Coach;
}

const CoachMetadataCard: React.FC<CoachMetadataCardProps> = ({ coach }) => {
  const fields: EntityField[] = [
    { label: "Name", value: <span className="font-bold text-[#C2B56B] text-base">{coach.first_name} {coach.last_name}</span>, highlight: true },
    { label: "Email", value: coach.email },
    ...(coach.team_name
      ? [{ label: "Team", value: <span className="text-[#C2B56B]">{coach.team_name}</span> }]
      : []),
    {
      label: "Status",
      value: (
        <span className={coach.active ? "text-[#C2B56B] font-semibold" : "text-red-400 font-semibold"}>
          {coach.active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return <EntityMetadataCard fields={fields} />;
};

export default CoachMetadataCard; 