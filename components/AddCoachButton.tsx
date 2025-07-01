"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const AddCoachModal = dynamic(() => import("@/components/AddCoachModal"), { ssr: false });

interface AddCoachButtonProps {
  onCoachAdded?: () => void;
  className?: string;
}

export default function AddCoachButton({ onCoachAdded, className = "" }: AddCoachButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`border border-gold text-gold font-bold rounded-lg px-4 py-2 shadow hover:bg-gold/10 transition-colors ${className}`}
      >
        Add Coach
      </button>
      <AddCoachModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onCoachAdded={onCoachAdded}
      />
    </>
  );
} 