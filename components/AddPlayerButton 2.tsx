"use client";
import AddPlayerModal from "@/app/protected/players/AddPlayerModal";

export default function AddPlayerButton({ onPlayerAdded }: { onPlayerAdded: () => void }) {
  return (
    <AddPlayerModal onPlayerAdded={onPlayerAdded} />
  );
} 