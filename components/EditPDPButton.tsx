"use client";
import { useState } from "react";
import EditPDPModal from "@/components/EditPDPModal";

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
      <button
        onClick={() => setModalOpen(true)}
        className="bg-zinc-700 text-white hover:bg-zinc-600 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
      >
        Edit Plan
      </button>
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