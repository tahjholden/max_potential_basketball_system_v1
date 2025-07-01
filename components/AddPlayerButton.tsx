"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const AddPlayerModal = dynamic(() => import("@/app/protected/players/AddPlayerModal"), { ssr: false });

export default function AddPlayerButton({ onPlayerAdded }: { onPlayerAdded: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-gold text-gold font-bold rounded-lg px-4 py-2 shadow hover:bg-gold/10 transition-colors"
      >
        + Add Player
      </button>
      <AddPlayerModal
        open={open}
        onClose={() => setOpen(false)}
        onPlayerAdded={onPlayerAdded}
      />
    </>
  );
} 