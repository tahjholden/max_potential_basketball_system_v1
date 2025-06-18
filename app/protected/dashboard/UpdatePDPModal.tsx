import React, { useState } from "react";

interface UpdatePDPModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (player: any, pdpData: any) => void;
  player: any;
  currentUser: any;
  players: any[];
}

export default function UpdatePDPModal({ open, onClose, onSubmit, player, currentUser, players }: UpdatePDPModalProps) {
  const [playerId, setPlayerId] = useState(player?.id || (players[0]?.id ?? ""));
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Update PDP</div>
          <button className="ml-4 px-3 py-1 rounded bg-oldgold text-black font-semibold" onClick={onClose}>Close</button>
        </div>
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium">Player</label>
          <select
            className="p-2 rounded w-full text-black"
            value={playerId}
            onChange={e => setPlayerId(e.target.value)}
          >
            <option value="">Select a player</option>
            {players.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.first_name && p.last_name 
                  ? `${p.first_name} ${p.last_name}` 
                  : p.name || `Player ${p.id}`}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            className="p-2 rounded w-full text-black"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <label className="block text-sm font-medium">PDP Content</label>
          <textarea
            className="p-2 rounded w-full text-black"
            placeholder="PDP content"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
          />
        </div>
        <button
          className="px-4 py-2 rounded bg-oldgold text-black font-semibold w-full"
          onClick={() => {
            const selectedPlayer = players.find(p => p.id === playerId);
            onSubmit(selectedPlayer, { content: content.trim(), start_date: startDate });
            setContent("");
          }}
          disabled={!content.trim() || !playerId}
        >
          Submit
        </button>
      </div>
    </div>
  );
} 