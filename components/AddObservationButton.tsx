"use client";
import AddObservationModal from "@/app/protected/players/AddObservationModal";

export default function AddObservationButton({ 
  player, 
  onObservationAdded 
}: { 
  player: any; 
  onObservationAdded?: () => void;
}) {
  return (
    <AddObservationModal 
      player={player} 
      onObservationAdded={onObservationAdded} 
    />
  );
} 