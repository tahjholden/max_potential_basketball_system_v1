"use client";

import { useState } from "react";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import ManagePDPModal from "@/components/ManagePDPModal";
import DeletePlayerButton from "@/components/DeletePlayerButton";

const mockPlayers = [
  { id: "1", name: "aaa fff", observations: 0, joined: "6/19/2025" },
  { id: "2", name: "Andrew Hemschoot", observations: 3, joined: "6/18/2025" },
  { id: "3", name: "Ben Swersky", observations: 4, joined: "6/17/2025" },
  { id: "4", name: "Cole Holden", observations: 4, joined: "6/17/2025" },
];

export default function PlayersPage() {
  const [selected, setSelected] = useState<string | null>(mockPlayers[0]?.id ?? null);
  const selectedPlayer = mockPlayers.find((p) => p.id === selected);

  return (
    <div className="h-[calc(100vh-5rem)] p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">MP Player Development</h1>
      <ThreePaneLayout
        leftPane={
          <>
            <h2 className="text-lg font-semibold mb-2">Players ({mockPlayers.length})</h2>
            <input
              placeholder="Search players..."
              className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700"
            />
            <div className="flex flex-col space-y-1">
              {mockPlayers.map((p) => (
                <div key={p.id} className="relative group">
                  <button
                    onClick={() => setSelected(p.id)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selected === p.id ? "bg-yellow-800 text-black" : "bg-zinc-800 text-white"
                    }`}
                  >
                    {p.name}
                    <div className="text-xs opacity-70">{p.observations} observations</div>
                  </button>
                  <div className="absolute right-2 top-2 hidden group-hover:block">
                    <DeletePlayerButton playerId={p.id} playerName={p.name} />
                  </div>
                </div>
              ))}
            </div>
          </>
        }
        mainPane={
          selectedPlayer ? (
            <>
              <h2 className="text-xl font-semibold mb-2">{selectedPlayer.name}</h2>
              <p className="text-sm text-zinc-400 mb-2">Joined: {selectedPlayer.joined}</p>

              <div className="bg-zinc-800 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-semibold mb-1">Personal Development Plan</h3>
                <p className="mb-1">Better this week.</p>
                <p className="text-xs text-zinc-500">Started: {selectedPlayer.joined}</p>
                <div className="mt-2">
                  <ManagePDPModal playerId={selectedPlayer.id} playerName={selectedPlayer.name} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1">Recent Observations ({selectedPlayer.observations})</h3>
                <p className="text-zinc-500 text-sm">No observations found.</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Select a player to view their PDP.
            </div>
          )
        }
        rightPane={
          selectedPlayer ? (
            <>
              <h3 className="text-md font-semibold mb-2">Context Viewer</h3>
              <select className="mb-3 w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white">
                <option>Archived PDPs</option>
              </select>
              <div className="bg-zinc-800 p-3 rounded text-sm">
                <p className="text-yellow-400 font-semibold mb-1">Plan from {selectedPlayer.joined}</p>
                <p className="text-zinc-400">{selectedPlayer.joined} → Present</p>
                <p className="mt-1">ashghlaslugh</p>
              </div>
            </>
          ) : null
        }
      />
    </div>
  );
} 