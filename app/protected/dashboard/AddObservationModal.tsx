import React, { useState, useEffect } from "react";
import { GoldModal } from "@/components/ui/gold-modal";

interface AddObservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string, observationDate: string) => void;
  playerId: string;
  pdpId: string;
}

export default function AddObservationModal({ open, onClose, onSubmit, playerId, pdpId }: AddObservationModalProps) {
  const [content, setContent] = useState("");
  const [observationDate, setObservationDate] = useState("");

  useEffect(() => {
    if (open) {
      setContent("");
      setObservationDate(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const handleSubmit = () => {
    if (content.trim() && observationDate) {
      onSubmit(content.trim(), observationDate);
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
        <div>
          <label htmlFor="observation-date" className="block text-sm font-medium text-[#f5f5f7] mb-1">
            Observation Date
          </label>
          <input
            id="observation-date"
            type="date"
            value={observationDate}
            onChange={e => setObservationDate(e.target.value)}
            className="p-2 rounded w-full bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>
      <button
        className="px-4 py-2 mt-4 rounded bg-[#d8cc97] text-[#161616] font-semibold w-full hover:bg-[#d8cc97]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={!content.trim() || !observationDate}
      >
        Submit
      </button>
    </GoldModal>
  );
} 