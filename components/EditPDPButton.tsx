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
        className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"
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