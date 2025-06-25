"use client";

import { useState } from "react";
import { Edit, Shield, User, Mail, Calendar, Building2 } from "lucide-react";
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

interface CoachDetailPaneProps {
  coach: Coach | null;
  onCoachUpdate: () => void;
}

export default function CoachDetailPane({ coach, onCoachUpdate }: CoachDetailPaneProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!coach) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-400 mb-2">
            Select a Coach
          </h3>
          <p className="text-sm text-zinc-500">
            Choose a coach from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
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
        </div>
        <div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
          <Mail className="w-5 h-5 text-gold" />
          <div>
            <div className="text-sm text-zinc-400">Email</div>
            <div className="text-white">{coach.email}</div>
          </div>
        </div>

        {/* Team */}
        {coach.team_name && (
          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
            <Building2 className="w-5 h-5 text-gold" />
            <div>
              <div className="text-sm text-zinc-400">Team</div>
              <div className="text-white">{coach.team_name}</div>
            </div>
          </div>
        )}

        {/* Role */}
        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
          <Shield className="w-5 h-5 text-gold" />
          <div>
            <div className="text-sm text-zinc-400">Role</div>
            <div className="text-white">
              {coach.is_admin ? "Administrator" : "Coach"}
            </div>
          </div>
        </div>

        {/* Joined Date */}
        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
          <Calendar className="w-5 h-5 text-gold" />
          <div>
            <div className="text-sm text-zinc-400">Joined</div>
            <div className="text-white">{formatDate(coach.created_at)}</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
          <div className="w-5 h-5 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${coach.active ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div>
            <div className="text-sm text-zinc-400">Status</div>
            <div className="text-white">
              {coach.active ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
        {coach.is_admin && (
          <button
            onClick={() => {
              // TODO: Implement admin actions
              console.log("Admin actions for:", coach.id);
            }}
            className="w-full border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"
          >
            Admin Actions
          </button>
        )}
        
        <button
          onClick={() => {
            // TODO: Implement deactivate/reactivate
            console.log("Toggle active status for:", coach.id);
          }}
          className="w-full border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"
        >
          {coach.active ? "Deactivate Coach" : "Activate Coach"}
        </button>
      </div>
    </div>
  );
} 