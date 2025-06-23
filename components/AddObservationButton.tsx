"use client";
import { useState } from "react";
import AddObservationModal from "@/app/protected/players/AddObservationModal";

// Variant: "button" or "menu-item"
interface AddObservationButtonProps {
  player: any;
  onObservationAdded?: () => void;
  className?: string;
  variant?: "button" | "menu-item";
}

export default function AddObservationButton({
  player,
  onObservationAdded,
  className = "",
  variant = "button",
}: AddObservationButtonProps) {
  const [open, setOpen] = useState(false);

  const triggerProps = {
    onClick: () => setOpen(true),
    disabled: false, // Adjust if needed
    className:
      variant === "menu-item"
        ? `w-full px-3 py-2 text-sm text-left hover:bg-[#323232] rounded transition-colors ${className}`
        : `border border-[#d8cc97] text-xs px-3 py-1.5 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition ${className}`,
  };

  return (
    <>
      <button type="button" {...triggerProps}>
        {variant === "menu-item" ? "Add Observation" : "Add Observation"}
      </button>
      <AddObservationModal
        open={open}
        onClose={() => setOpen(false)}
        player={player}
        onObservationAdded={() => {
          setOpen(false);
          onObservationAdded?.();
        }}
      />
    </>
  );
} 