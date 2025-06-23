"use client";
import { useState } from "react";
import AddObservationModal from "@/app/protected/test-players/AddObservationModal";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function AddObservationButton({ player }: { player: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleAddObservation = async (content: string) => {
    const supabase = createClient();
    const now = new Date().toISOString();
    
    // Get the current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated.");
      toast.error("Authentication error. Please try again.");
      return;
    }

    // Look up (or create) the coach record
    let coachId: string;
    let { data: coachRow } = await supabase
      .from('coaches')
      .select('id')
      .eq('auth_uid', user.id)
      .maybeSingle();

    if (!coachRow) {
      // Auto-create coach record if missing
      const { data: newCoach, error: createCoachError } = await supabase
        .from('coaches')
        .insert({
          auth_uid: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          email: user.email || '',
          is_admin: false,
          active: true,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (createCoachError) {
        console.error("Error creating coach record:", createCoachError);
        toast.error("Failed to create coach record. Please try again.");
        return;
      }
      coachId = newCoach.id;
    } else {
      coachId = coachRow.id;
    }

    // Get the active PDP for the player (not archived)
    const { data: activePdp, error: pdpError } = await supabase
      .from("pdp")
      .select("id")
      .eq("player_id", player.id)
      .is("archived_at", null) // PDPs still use archived_at for now
      .single();

    if (pdpError && pdpError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is okay.
      console.error("Error fetching active PDP:", pdpError);
      toast.error("Could not fetch the active development plan.");
      return;
    }

    if (!activePdp) {
      toast.error("Cannot add observation: No active development plan found for this player.");
      return;
    }

    const { error } = await supabase.from("observations").insert({
      player_id: player.id,
      content: content,
      observation_date: now,
      coach_id: coachId, // Always set coach_id for RLS compliance
      pdp_id: activePdp?.id,
      archived: false, // New observations are always active
    });
    if (!error) {
      setModalOpen(false);
      router.refresh();
    } else {
      console.error("Error adding observation:", error);
      toast.error(`Failed to add observation: ${error.message}`);
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