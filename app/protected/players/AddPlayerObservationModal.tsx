import React, { useState, useEffect } from "react";
import { GoldModal } from "@/components/ui/gold-modal";
import EmptyState from "@/components/ui/EmptyState";

interface AddPlayerObservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { player_id: string; content: string; observation_date: string }) => void;
  player: { id: string; name: string } | null;
  onSuccess?: () => void;
}

export default function AddPlayerObservationModal({ open, onClose, onSubmit, player, onSuccess }: AddPlayerObservationModalProps) {
  const [content, setContent] = useState("");
  const [observationDate, setObservationDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setContent("");
      setObservationDate(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const handleSubmit = () => {
    if (player && content) {
      onSubmit({
        player_id: player.id,
        content,
        observation_date: observationDate,
      });
      if (onSuccess) onSuccess();
    }
  };

  if (!player) {
    return (
      <GoldModal open={open} onOpenChange={onClose} title="Player Not Found">
        <EmptyState 
          variant="error" 
          title="Player Not Found" 
          description="The player to add an observation for could not be found."
          action={{
            label: "Close",
            onClick: onClose,
            color: "gray"
          }}
        />
      </GoldModal>
    );
  }

  return (
    <GoldModal open={open} onOpenChange={onClose} title={`Add Observation for ${player.name}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[#f5f5f7] mb-1">
            Observation
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="p-2 rounded w-full bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none"
            rows={4}
            placeholder="Add your observation notes here..."
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-[#f5f5f7] mb-1">
            Observation Date
          </label>
          <input
            id="date"
            type="date"
            value={observationDate}
            onChange={(e) => setObservationDate(e.target.value)}
            className="p-2 rounded w-full bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none"
          />
        </div>
      </div>
      <button
        className="px-4 py-2 mt-4 rounded bg-[#d8cc97] text-[#161616] font-semibold w-full hover:bg-[#d8cc97]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={!content.trim()}
      >
        Submit
      </button>
    </GoldModal>
  );
} 