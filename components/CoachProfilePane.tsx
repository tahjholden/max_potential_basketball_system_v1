"use client";

import { useState } from "react";
import { GoldButton } from "@/components/ui/gold-button";
import { Button } from "@/components/ui/button";

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

interface CoachProfilePaneProps {
  coach: Coach;
  observations: Observation[];
}

export default function CoachProfilePane({ coach, observations }: CoachProfilePaneProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {coach.first_name} {coach.last_name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {coach.is_admin && (
              <span className="px-2 py-1 text-xs font-bold bg-gold text-black rounded">
                ADMIN
              </span>
            )}
            {!coach.active && (
              <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded">
                INACTIVE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Upper Left - Role */}
        <div className="p-3 bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-400">Role</div>
          <div className="text-white">
            {coach.is_admin ? "Administrator" : "Coach"}
          </div>
        </div>

        {/* Upper Right - Team */}
        <div className="p-3 bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-400">Team</div>
          <div className="text-white">{coach.team_name || "No team assigned"}</div>
        </div>

        {/* Lower Left - Phone Number */}
        <div className="p-3 bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-400">Phone Number</div>
          <div className="text-white">Not available</div>
        </div>

        {/* Lower Right - Email */}
        <div className="p-3 bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-400">Email</div>
          <div className="text-white">{coach.email}</div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{observations.length}</div>
          <div className="text-sm text-zinc-400">Recent Observations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">
            {coach.active ? "Active" : "Inactive"}
          </div>
          <div className="text-sm text-zinc-400">Status</div>
        </div>
      </div>
    </div>
  );
} 