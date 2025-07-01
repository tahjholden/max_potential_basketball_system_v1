import React, { useState, useEffect } from "react";
import { GoldModal } from "@/components/ui/gold-modal";

interface AddObservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  playerId: string;
  pdpId: string;
}

export default function AddObservationModal({ open, onClose, onSubmit, playerId, pdpId }: AddObservationModalProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      setContent("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  return (
    <GoldModal open={open} onOpenChange={onClose} title="Add Observation">
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