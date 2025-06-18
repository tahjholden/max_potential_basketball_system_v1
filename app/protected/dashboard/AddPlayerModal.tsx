import React, { useState } from "react";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playerData: any) => void;
}

export default function AddPlayerModal({ open, onClose, onSubmit }: AddPlayerModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [pdpContent, setPdpContent] = useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Add Player</div>
          <button className="ml-4 px-3 py-1 rounded bg-oldgold text-black font-semibold" onClick={onClose}>Close</button>
        </div>
        <div className="mb-4 space-y-2">
          <input
            className="p-2 rounded w-full text-black"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <input
            className="p-2 rounded w-full text-black"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
          <input
            className="p-2 rounded w-full text-black"
            placeholder="Position (optional)"
            value={position}
            onChange={e => setPosition(e.target.value)}
          />
          <textarea
            className="p-2 rounded w-full text-black"
            placeholder="Initial PDP content (optional)"
            value={pdpContent}
            onChange={e => setPdpContent(e.target.value)}
            rows={3}
          />
        </div>
        <button
          className="px-4 py-2 rounded bg-oldgold text-black font-semibold w-full mt-2"
          onClick={() => {
            onSubmit({
              first_name: firstName,
              last_name: lastName,
              position,
              pdpContent: pdpContent.trim()
            });
            setFirstName("");
            setLastName("");
            setPosition("");
            setPdpContent("");
          }}
          disabled={!firstName.trim() || !lastName.trim()}
        >
          Submit
        </button>
      </div>
    </div>
  );
} 