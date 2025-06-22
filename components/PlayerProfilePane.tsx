"use client";

import React from "react";
import ManagePDPModal from "@/components/ManagePDPModal";
import EditPDPButton from "@/components/EditPDPButton";
import PaneTitle from "@/components/PaneTitle";

export default function PlayerProfilePane({
  player,
  pdp,
  onPdpUpdate,
  showControls = true,
}: {
  player: any;
  pdp: any;
  onPdpUpdate?: () => void;
  showControls?: boolean;
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
      <p className="text-xs text-zinc-500 border-b border-zinc-700 pb-2 mb-4">
        Joined: {player?.joined || "Unknown"}
      </p>

      <p className="text-white mt-1">{pdp?.content || "No active plan."}</p>
      {pdp?.start_date && (
        <p className="text-xs text-zinc-500 mt-2">Started: {pdp.start_date}</p>
      )}

      {showControls && (
        <div className="flex gap-2 mt-4">
          <EditPDPButton player={player} pdp={pdp} onUpdate={onPdpUpdate} />
          <ManagePDPModal playerId={player?.id} playerName={player?.name} />
        </div>
      )}
    </div>
  );
} 