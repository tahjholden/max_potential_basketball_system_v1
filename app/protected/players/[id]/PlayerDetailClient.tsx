"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCoachName } from "@/lib/utils";
import { getUserRole } from "@/lib/role-utils";
import { useCoach } from "@/hooks/useCoach";

// Import Modals
import EditPDPModal from "@/components/EditPDPModal";
import CreatePDPModal from "@/components/CreatePDPModal";
import DeleteObservationModal from "../DeleteObservationModal";
import AddPlayerObservationModal from "../AddPlayerObservationModal";

// Import the new layout
import PlayerDetailLayout from "@/components/PlayerDetailLayout";

export default function PlayerDetailClient({ player, currentPDP, recentObservations, coach }: any) {
  const supabase = createClient();
  const router = useRouter();
  const { coach: currentCoach } = useCoach();
  const userRole = getUserRole(currentCoach);
  const isSuperadmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";

  // Modal states
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAddObsModalOpen, setAddObsModalOpen] = useState(false);
  const [obsToDelete, setObsToDelete] = useState<any | null>(null);
  
  const refreshData = () => router.refresh();

  // Handlers
  const handleArchivePDP = async () => {
    if (!currentPDP) return;
    const { error } = await supabase
      .from("pdp")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", currentPDP.id);

    if (error) {
      console.error("Failed to archive PDP:", error);
    } else {
      setCreateModalOpen(true); // Open create modal for replacement
      refreshData();
    }
  };

  const handleDeleteObservation = async (id: string) => {
    if (!id) return;
    const { error } = await supabase.from("observations").delete().eq("id", id);
    if (error) {
      console.error("❌ Failed to delete observation:", error);
    } else {
      setObsToDelete(null);
      refreshData();
    }
  };

  const observationsWithCoach = recentObservations.map((obs: any) => ({
    ...obs,
    date: obs.observation_date,
    coach: getCoachName(obs.coaches),
  }));

  const handleAddObservation = async (data: { player_id: string; content: string; observation_date: string }) => {
    if (!currentCoach?.org_id) {
      console.error("Organization information not available");
      return;
    }

    const { error } = await supabase.from('observations').insert({
      ...data,
      coach_id: coach?.id,
      org_id: currentCoach.org_id,
    });
    if (error) {
      console.error('Failed to add observation:', error);
    } else {
      setAddObsModalOpen(false);
      refreshData();
    }
  };

  return (
    <>
      <div className="bg-[#161616] min-h-screen">
        <PlayerDetailLayout
          player={player}
          pdp={currentPDP}
          observations={observationsWithCoach}
          onEditPDP={() => setEditModalOpen(true)}
          onArchivePDP={handleArchivePDP}
          onAddObservation={() => setAddObsModalOpen(true)}
          onDeleteObservation={(id) => setObsToDelete(recentObservations.find((obs: any) => obs.id === id))}
        />
      </div>

      {/* Render Modals */}
      {currentPDP && (
        <EditPDPModal
          currentPdp={currentPDP}
          player={player}
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={refreshData}
        />
      )}

      <CreatePDPModal
        player={player}
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refreshData}
        coachId={coach?.id}
      />
      
      <AddPlayerObservationModal
        player={player}
        open={isAddObsModalOpen}
        onClose={() => setAddObsModalOpen(false)}
        onSubmit={handleAddObservation}
      />

      {obsToDelete && (
          <DeleteObservationModal
              open={!!obsToDelete}
              onClose={() => setObsToDelete(null)}
              onConfirm={() => handleDeleteObservation(obsToDelete.id)}
              observationId={obsToDelete.id}
              contentPreview={obsToDelete.content}
          />
      )}
    </>
  );
} 