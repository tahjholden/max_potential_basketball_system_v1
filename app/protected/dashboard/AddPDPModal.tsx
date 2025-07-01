import React, { useState } from "react";
import { GoldModal } from "@/components/ui/gold-modal";

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

  return (
    <GoldModal open={open} onOpenChange={onClose} title="Add PDP">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Player</label>
          <select
            className="w-full p-3 rounded bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none transition-colors"
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
          <label className="block text-sm font-medium text-[#f5f5f7] mb-2">Start Date</label>
          <input
            className="w-full p-3 rounded bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none transition-colors"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#f5f5f7] mb-2">PDP Content</label>
          <textarea
            className="w-full p-3 rounded bg-[#323232] text-[#f5f5f7] border border-[#323232] focus:border-[#d8cc97] focus:outline-none transition-colors min-h-[100px] resize-none"
            placeholder="Enter PDP content"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-[#d8cc97] text-[#161616] rounded px-4 py-3 font-bold hover:bg-[#d8cc97]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
    </GoldModal>
  );
} 