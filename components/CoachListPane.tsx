"use client";

import React, { useState, useEffect, useMemo } from "react";
import PaneTitle from "@/components/PaneTitle";
import AddCoachButton from "./AddCoachButton";

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
  is_superadmin: boolean;
}

interface CoachListPaneProps {
  coaches: Coach[];
  onSelect?: (coachId: string) => void;
  selectedCoachId?: string | null;
  onCoachAdded?: () => void;
}

export default function CoachListPane({ 
  coaches, 
  onSelect, 
  selectedCoachId,
  onCoachAdded
}: CoachListPaneProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);

  // Sort coaches by name
  const sortedCoaches = useMemo(() => {
    return coaches.sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [coaches]);

  useEffect(() => {
    const filtered = sortedCoaches.filter(coach => {
      const fullName = `${coach.first_name} ${coach.last_name}`.toLowerCase();
      const email = coach.email.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || 
             email.includes(searchTerm.toLowerCase());
    });
    setFilteredCoaches(filtered);
  }, [sortedCoaches, searchTerm]);

  const handleCoachSelect = (id: string) => {
    if (onSelect) onSelect(id);
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <PaneTitle>Coaches</PaneTitle>
        {onCoachAdded && <AddCoachButton onCoachAdded={onCoachAdded} />}
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search coaches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
        />
      </div>

      <div className="space-y-2 max-h-96 pr-3">
        {filteredCoaches.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-4">
            {searchTerm ? "No coaches found." : "No coaches available."}
          </div>
        ) : (
          filteredCoaches.map((coach) => {
            const isSelected = selectedCoachId === coach.id;
            const isSuperadmin = coach.is_superadmin;
            const isAdmin = coach.is_admin;

            let classes = "w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2";

            if (isSuperadmin) {
              classes += isSelected
                ? " bg-purple-600 text-white border-purple-400"
                : " bg-zinc-900 text-purple-300 border-purple-400";
            } else if (isAdmin) {
              classes += isSelected
                ? " bg-gold text-black border-gold"
                : " bg-zinc-900 text-gold border-gold";
            } else {
              classes += isSelected
                ? " bg-[#C2B56B] text-black border-[#C2B56B]"
                : " bg-zinc-900 text-[#C2B56B] border-[#C2B56B]";
            }

            return (
              <button
                key={coach.id}
                onClick={() => handleCoachSelect(coach.id)}
                className={classes}
              >
                <div className="flex items-center justify-between">
                  <span>{coach.first_name} {coach.last_name}</span>
                  {isSuperadmin && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">SUPERADMIN</span>
                  )}
                  {!isSuperadmin && isAdmin && (
                    <span className="text-xs bg-gold text-black px-2 py-1 rounded">ADMIN</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
} 