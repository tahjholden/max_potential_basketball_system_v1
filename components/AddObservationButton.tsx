"use client";
import { useState } from "react";
import AddPlayerObservationModal from "@/app/protected/players/AddPlayerObservationModal";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddObservationButton({ player, coachId }: { player: any, coachId: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleAddObservation = async (observationData: { player_id: string; content: string; observation_date: string }) => {
    const supabase = createClient();
    const { error } = await supabase.from("observations").insert({
      ...observationData,
      coach_id: coachId,
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
      <AddPlayerObservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddObservation}
        player={player}
      />
    </>
  );
} 