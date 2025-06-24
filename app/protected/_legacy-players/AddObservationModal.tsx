import React, { useState } from "react";

interface AddObservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  selectedPlayer: { name: string };
}

export default function AddObservationModal({
  open,
  onClose,
  onSubmit,
  selectedPlayer,
}: AddObservationModalProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await onSubmit(content);
    setLoading(false);
    setContent("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Add Observation for {selectedPlayer.name}</h2>
          <button className="text-zinc-400 hover:text-white" onClick={onClose}>
            &times;
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter observation details..."
          rows={5}
          className="w-full p-2 bg-zinc-700 rounded border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 rounded bg-zinc-600 hover:bg-zinc-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-gold text-black font-semibold"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
} 