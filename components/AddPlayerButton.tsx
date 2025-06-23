"use client";
import { useState } from "react";
import AddPlayerModal from "@/app/protected/dashboard/AddPlayerModal";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddPlayerButton({ onPlayerAdded }: { onPlayerAdded: () => void }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (playerData: any) => {
    const supabase = createClient();
    const { data: newPlayer, error } = await supabase
      .from("players")
      .insert({
        first_name: playerData.first_name,
        last_name: playerData.last_name,
        name: `${playerData.first_name} ${playerData.last_name}`,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add player.");
    } else if (newPlayer && playerData.pdpContent) {
      await supabase.from("pdp").insert({
        player_id: newPlayer.id,
        content: playerData.pdpContent,
      });
    }
    
    toast.success("Player added successfully!");
    onPlayerAdded();
    setModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="border border-[#d8cc97] text-xs px-3 py-1.5 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"
      >
        Add Player
      </button>
      <AddPlayerModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
} 