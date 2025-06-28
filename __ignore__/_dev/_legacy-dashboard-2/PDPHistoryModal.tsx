import React from "react";

interface PDPHistoryModalProps {
  open: boolean;
  onClose: () => void;
  player: any;
  pdps: any[];
}

export default function PDPHistoryModal({ open, onClose, player, pdps }: PDPHistoryModalProps) {
  if (!open) return null;
  const sortedPdps = [...pdps].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">PDP History for {player ? `${player.first_name} ${player.last_name}` : "Player"}</div>
          <button className="ml-4 px-3 py-1 rounded bg-oldgold text-black font-semibold" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-2">
          {sortedPdps.length === 0 ? (
            <div className="text-zinc-400">No PDPs found.</div>
          ) : (
            sortedPdps.map((pdp) => (
              <div key={pdp.id} className="bg-zinc-900 rounded p-3">
                <div className="font-semibold text-oldgold mb-1">{pdp.content}</div>
                <div className="text-xs text-zinc-500">{pdp.start_date} - {pdp.end_date || "Active"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 