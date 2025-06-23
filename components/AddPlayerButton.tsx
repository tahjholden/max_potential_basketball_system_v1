"use client";
import { useState } from "react";
import AddPlayerModal from "@/app/protected/players/AddPlayerModal";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddPlayerButton({ onPlayerAdded }: { onPlayerAdded: () => void }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (playerData: any) => {
    try {
      const supabase = createClient();
      
      // Insert the player (do NOT insert 'name', it's a generated column)
      const { data: newPlayer, error: playerError } = await supabase
        .from("players")
        .insert({
          first_name: playerData.first_name,
          last_name: playerData.last_name,
        })
        .select()
        .single();

      if (playerError) {
        console.error("Error adding player:", playerError);
        toast.error(`Failed to add player: ${playerError.message}`);
        return;
      }

      // If PDP content is provided, create a PDP
      if (newPlayer && playerData.pdpContent) {
        const { error: pdpError } = await supabase.from("pdp").insert({
          player_id: newPlayer.id,
          content: playerData.pdpContent,
        });

        if (pdpError) {
          console.error("Error adding PDP:", pdpError);
          toast.error(`Player added but failed to create PDP: ${pdpError.message}`);
          // Still call onPlayerAdded since the player was created successfully
          onPlayerAdded();
          setModalOpen(false);
          return;
        }
      }
      
      toast.success("Player added successfully!");
      onPlayerAdded();
      setModalOpen(false);
    } catch (error) {
      console.error("Unexpected error adding player:", error);
      toast.error("An unexpected error occurred while adding the player.");
    }
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