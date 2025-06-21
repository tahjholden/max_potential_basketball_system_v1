"use client";
import { useState } from "react";
import EditPDPModal from "./EditPDPModal";
import { useRouter } from "next/navigation";

export default function EditPDPButton({ pdp, player }: { pdp: any, player: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handlePDPSuccess = () => {
    setModalOpen(false);
    router.refresh();
  }

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className="text-sm px-3 py-1.5 border border-gray-600 text-gray-200 hover:bg-gray-700 rounded transition w-full"
      >
        Edit PDP
      </button>
      <EditPDPModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentPdp={pdp}
        onSuccess={handlePDPSuccess}
        player={player}
      />
    </>
  );
} 