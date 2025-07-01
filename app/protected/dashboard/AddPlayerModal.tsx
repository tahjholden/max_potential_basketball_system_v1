import React, { useState } from "react";
import { GoldModal } from "@/components/ui/gold-modal";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function AddPlayerModal({ open, onClose, onSubmit }: AddPlayerModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    }
  };

  return (
    <GoldModal open={open} onOpenChange={onClose} title="Add Player">
      <div className="mb-4 space-y-2">
        <input
          className="p-2 rounded w-full bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none"
          placeholder="Player Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <button
        className="px-4 py-2 rounded bg-[#d8cc97] text-[#161616] font-semibold w-full mt-2 hover:bg-[#d8cc97]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={!name.trim()}
      >
        Submit
      </button>
    </GoldModal>
  );
} 