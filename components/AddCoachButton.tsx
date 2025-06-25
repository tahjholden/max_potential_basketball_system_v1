"use client";

import { useState } from "react";

interface AddCoachButtonProps {
  onCoachAdded?: () => void;
  className?: string;
}

export default function AddCoachButton({ onCoachAdded, className = "" }: AddCoachButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddCoach = () => {
    // TODO: Implement add coach modal
    console.log("Add coach functionality coming soon");
    setIsOpen(false);
    onCoachAdded?.();
  };

  return (
    <button
      onClick={handleAddCoach}
      className={`border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition ${className}`}
    >
      Add Coach
    </button>
  );
} 