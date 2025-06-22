"use client";
import { useState } from "react";
import AddObservationModal from "@/app/protected/test-players/AddObservationModal";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddObservationButton({ player }: { player: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleAddObservation = async (content: string) => {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    const { error } = await supabase.from("observations").insert({
      player_id: player.id,
      content: content,
      observation_date: new Date().toISOString(),
      coach_id: user.id,
    });
    if (!error) {
      setModalOpen(false);
      router.refresh();
    } else {
      console.error("Error adding observation:", error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className="bg-[#d8cc97] text-[#0f172a] text-sm font-semibold px-3 py-1.5 rounded hover:bg-[#e0d8a3] transition"
      >
        + Add Observation
      </button>
      <AddObservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddObservation}
        selectedPlayer={player}
      />
    </>
  );
} 