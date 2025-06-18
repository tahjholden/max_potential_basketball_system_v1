import React from "react";

interface AddPDPModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pdpData: any) => void;
  players: any[];
  selectedPlayer: any;
  currentUser: any;
}

export default function AddPDPModal({ open, onClose, onSubmit, players, selectedPlayer, currentUser }: AddPDPModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Add PDP</div>
          <button className="ml-4 px-3 py-1 rounded bg-oldgold text-black font-semibold" onClick={onClose}>Close</button>
        </div>
        <div className="mb-4">[PDP form placeholder]</div>
        <button className="px-4 py-2 rounded bg-oldgold text-black font-semibold" onClick={() => onSubmit({})}>Submit</button>
      </div>
    </div>
  );
} 