"use client";
import { useState } from "react";
import { Search, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface PlayerListProps {
  players: any[];
  selected: any | null;
  onSelect: (player: any) => void;
}

export default function PlayerList({ players, selected, onSelect }: PlayerListProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const supabase = createClient();

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    const { error } = await supabase
      .from("players")
      .insert([{ name: newPlayerName.trim() }]);
    
    if (error) {
      toast.error("Failed to add player");
    } else {
      toast.success("Player added successfully");
      setNewPlayerName("");
      setIsAddModalOpen(false);
      // Refresh the page to get updated data
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#232323] rounded-lg p-4 border border-[#323232] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#d8cc97]">Players</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 bg-[#d8cc97] text-[#161616] px-2 py-1 rounded text-sm font-semibold hover:bg-[#d8cc97]/80 transition-colors"
        >
          <PlusCircle size={14} /> Add
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search players..."
          className="w-full bg-[#18191A] border border-[#323232] rounded-md pl-9 pr-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#d8cc97] focus:outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul className="flex-1 overflow-y-auto space-y-1 -mr-2 pr-2">
        {filteredPlayers.map((player) => (
          <li
            key={player.id}
            onClick={() => onSelect(player)}
            className={`cursor-pointer p-3 rounded-lg transition-colors ${
              selected?.id === player.id
                ? "bg-[#d8cc97] text-black font-semibold"
                : "hover:bg-[#323232] text-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm">{player.name}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Add Player Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#d8cc97] mb-4">Add New Player</h3>
            <input
              type="text"
              placeholder="Player name"
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#d8cc97] focus:outline-none mb-4"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddPlayer}
                className="flex-1 bg-[#d8cc97] text-[#161616] px-4 py-2 rounded font-semibold hover:bg-[#d8cc97]/80 transition-colors"
              >
                Add Player
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewPlayerName("");
                }}
                className="flex-1 bg-[#323232] text-white px-4 py-2 rounded font-semibold hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 