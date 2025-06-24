"use client";
import { useState } from "react";
// import AddPDPModal from "../../dashboard/AddPDPModal";

export default function PlayerDetailActions({ player, currentUser }: { player: any, currentUser: any }) {
  // const [modalOpen, setModalOpen] = useState(false);

  // const handleAddPDP = async (pdpData: any) => {
  //   try {
  //     const res = await fetch("/api/pdp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...pdpData,
  //         player_id: player.id,
  //         created_by: currentUser?.id
  //       })
  //     });
  //     if (!res.ok) throw new Error("Failed to add PDP");
  //     window.location.reload();
  //   } catch (err) {
  //     alert("Failed to add PDP. Please try again.");
  //   }
  // };

  return (
    <>
      {/*
      <button
        onClick={() => setModalOpen(true)}
        className="bg-slate-700 text-white px-4 py-2 rounded font-bold hover:bg-slate-600 transition-colors border border-slate-600"
      >
        + Add PDP
      </button>
      <AddPDPModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddPDP}
        players={[player]}
        selectedPlayer={player}
        currentUser={currentUser}
      />
      */}
    </>
  );
} 