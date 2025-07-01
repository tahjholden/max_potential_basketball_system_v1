import React from "react";
import { GoldModal } from "@/components/ui/gold-modal";

interface PDPHistoryModalProps {
  open: boolean;
  onClose: () => void;
  player: any;
  pdps: any[];
}

export default function PDPHistoryModal({ open, onClose, player, pdps }: PDPHistoryModalProps) {
  const sortedPdps = [...pdps].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  return (
    <GoldModal open={open} onOpenChange={onClose} title={`PDP History for ${player ? `${player.first_name} ${player.last_name}` : "Player"}`}>
      <div className="space-y-2">
        {sortedPdps.length === 0 ? (
          <div className="text-[#b0b0b0]">No PDPs found.</div>
        ) : (
          sortedPdps.map((pdp) => (
            <div key={pdp.id} className="bg-[#323232] rounded p-3 border border-[#323232]">
              <div className="font-semibold text-[#d8cc97] mb-1">{pdp.content}</div>
              <div className="text-xs text-[#b0b0b0]">{pdp.start_date} - {pdp.end_date || "Active"}</div>
            </div>
          ))
        )}
      </div>
    </GoldModal>
  );
} 