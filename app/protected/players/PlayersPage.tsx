"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function PlayersPage({
  players,
  fetchFreshData,
}: {
  players: any[];
  fetchFreshData: () => void;
}) {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const filteredPlayers = players.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeletePlayer = async (id: string) => {
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete player");
      console.error(error);
    } else {
      toast.success("Player deleted");
      setSelectedPlayer(null);
      await fetchFreshData();
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">MP Player Development</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-slate-200">Players</h2>
            <button className="bg-[#d8cc97] text-black px-3 py-1 rounded font-semibold text-sm hover:bg-yellow-300">
              + Add Player
            </button>
          </div>

          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-slate-700 text-white"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ul className="max-h-[70vh] space-y-1 mt-2">
            {filteredPlayers.map((p) => (
              <li
                key={p.id}
                onClick={() => setSelectedPlayer(p)}
                className={`cursor-pointer px-3 py-2 rounded ${
                  selectedPlayer?.id === p.id
                    ? "bg-[#d8cc97] text-black font-semibold"
                    : "hover:bg-slate-800 text-white"
                }`}
              >
                {p.name}
                <span className="block text-xs text-slate-400">
                  {p.observations ?? 0} obs • {p.pdp ? "PDP Active" : "Missing PDP"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Pane */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPlayer ? (
            <div className="bg-[#1e1e1e] border border-slate-700 rounded p-4">
              <h2 className="text-lg font-bold text-white mb-2">{selectedPlayer.name}</h2>

              {selectedPlayer.pdp ? (
                <>
                  <p className="italic text-slate-300 mb-2">{selectedPlayer.pdp.content}</p>
                  <p className="text-xs text-slate-500">
                    Started: {new Date(selectedPlayer.pdp.start_date).toLocaleDateString()}
                  </p>
                  <div className="mt-4 space-y-2">
                    <button className="btn-outline w-full">Edit PDP</button>
                    <button className="btn-danger w-full">Archive & Replace</button>
                  </div>
                </>
              ) : (
                <p className="text-yellow-400 italic mb-2">No active PDP.</p>
              )}

              <div className="mt-4">
                <button
                  onClick={() => handleDeletePlayer(selectedPlayer.id)}
                  className="text-sm text-red-400 underline hover:text-red-200"
                >
                  Delete Player
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic">Select a player to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
} 