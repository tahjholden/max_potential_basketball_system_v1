"use client";

import { useState } from "react";
import DeleteObservationModal from "./DeleteObservationModal";

export default function ObservationCard({
  id,
  player_name,
  date,
  content,
  coach_name,
  onDelete,
}: {
  id: string;
  player_name: string;
  date: string;
  content: string;
  coach_name: string;
  onDelete: (id: string) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="relative bg-[#232323] p-4 rounded-md border border-[#323232]">
      <p className="text-sm text-white mb-2">{content}</p>
      <p className="text-xs text-gray-400">
        {new Date(date).toLocaleDateString()} — {coach_name}
      </p>

      <button
        className="absolute bottom-2 right-2 text-red-400 hover:text-red-200 text-xs"
        onClick={() => setShowDeleteModal(true)}
      >
        Delete
      </button>

      <DeleteObservationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDelete}
        observationId={id}
        contentPreview={content.slice(0, 80) + (content.length > 80 ? "..." : "")}
      />
    </div>
  );
} 