"use client";
import { useState } from "react";
import AddPlayerModal from "@/app/protected/players/AddPlayerModal";

export default function AddPlayerButton({ onPlayerAdded }: { onPlayerAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#C2B56B] text-black px-4 py-2 rounded hover:bg-[#B8A95A] transition-colors"
      >
        Add Player
      </button>
      <AddPlayerModal 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
        onPlayerAdded={onPlayerAdded} 
      />
    </>
  );
} 