"use client";

import React from "react";
import { format } from "date-fns";
import { GoldButton } from "./ui/gold-button";
import { Button } from "./ui/button";
import ManagePDPModal from "@/components/ManagePDPModal";
import CreatePDPModal from "./CreatePDPModal";
import EditPDPModal from "@/components/EditPDPModal";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
}

export default function PlayerProfilePane({
  player,
  pdp,
}: {
  player: any;
  pdp: any;
}) {
  if (!player) {
    return (
      <div className="w-[50%] flex-1 bg-zinc-900 p-4 rounded-lg overflow-y-auto">
        <div className="text-center text-zinc-500 mt-8">
          <p>Select a player to view details</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full lg:flex-1 lg:max-w-[700px] bg-zinc-900 p-5 rounded-xl shadow-inner overflow-y-auto">
      <h2 className="text-sm font-semibold text-zinc-400 mb-4">Player Profile: {player.name}</h2>
      
      <p className="text-xs text-zinc-500 border-b border-zinc-700 pb-2 mb-4">
        Joined: {player.joined}
      </p>

      <div className="bg-zinc-800 rounded p-4 shadow-inner mb-6">
        <p className="text-sm text-zinc-400 font-semibold">Current Plan</p>
        <p className="text-white mt-1">{pdp.content || "No active plan."}</p>
        <p className="text-xs text-zinc-500 mt-2">Started: {pdp.start_date}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button className="px-3 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-600">
          Edit Plan
        </button>
        <ManagePDPModal playerId={player.id} playerName={player.name} />
      </div>
    </main>
  );
} 