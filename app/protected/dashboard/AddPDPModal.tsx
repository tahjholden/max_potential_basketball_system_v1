import React, { useState } from "react";

interface AddPDPModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pdpData: any) => void;
  players: any[];
  selectedPlayer: any;
  currentUser: any;
}

export default function AddPDPModal({ open, onClose, onSubmit, players, selectedPlayer, currentUser }: AddPDPModalProps) {
  const [playerId, setPlayerId] = useState(selectedPlayer?.id || (players[0]?.id ?? ""));
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl text-white max-w-md w-full border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg text-[#facc15] font-semibold">Add PDP</div>
          <button 
            className="px-3 py-1 rounded bg-[#facc15] text-black font-semibold hover:bg-yellow-400 transition-colors" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Player</label>
            <select
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-[#facc15] focus:outline-none transition-colors"
              value={playerId}
              onChange={e => setPlayerId(e.target.value)}
            >
              <option value="">Select a player</option>
              {players.map((player: any) => (
                <option key={player.id} value={player.id}>
                  {player.first_name && player.last_name 
                    ? `${player.first_name} ${player.last_name}` 
                    : player.name || `Player ${player.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-[#facc15] focus:outline-none transition-colors"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">PDP Content</label>
            <textarea
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-[#facc15] focus:outline-none transition-colors min-h-[100px] resize-none"
              placeholder="Enter PDP content"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-[#facc15] text-black rounded px-4 py-3 font-bold hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              onSubmit({
                player_id: playerId,
                content: content.trim(),
                start_date: startDate
              });
              setContent("");
            }}
            disabled={!content.trim() || !playerId}
          >
            Create PDP
          </button>
        </div>
      </div>
    </div>
  );
} 