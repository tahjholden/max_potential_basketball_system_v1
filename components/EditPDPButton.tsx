"use client";
import { useState } from "react";
import EditPDPModal from "@/components/EditPDPModal";
import EntityButton from "./EntityButton";

interface Player {
  id: string;
  name: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
}

export default function EditPDPButton({ 
  player, 
  pdp, 
  onUpdate 
}: {
  player: Player;
  pdp: Pdp | null;
  onUpdate?: () => void;
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  // Don't render the button if there's no PDP to edit
  if (!pdp) {
    return null;
  }

  return (
    <>
      <EntityButton
        color="gold"
        onClick={() => setModalOpen(true)}
      >
        Edit Plan
      </EntityButton>
      <EditPDPModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        player={player}
        currentPdp={pdp}
        onSuccess={() => {
          setModalOpen(false);
          if (onUpdate) onUpdate();
        }}
      />
    </>
  );
} 