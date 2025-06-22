"use client";

import React from "react";
import PaneTitle from "@/components/PaneTitle";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined?: string;
}

export default function PlayerMetadataPane({
  player,
}: {
  player: Player | null;
}) {
  if (!player) {
    return (
      <div className="bg-zinc-900 p-4 rounded-md shadow-sm flex items-center justify-center h-full">
        <p className="text-zinc-500">Select a player to view their profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <PaneTitle>Player Profile</PaneTitle>
      
      <div className="space-y-2">
        <div>
          <p className="text-white font-medium">{player.name}</p>
          <p className="text-xs text-zinc-500">Joined: {player.joined || "Unknown"}</p>
        </div>
      </div>
    </div>
  );
} 