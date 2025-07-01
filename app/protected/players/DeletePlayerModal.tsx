import { StyledModal } from "@/components/ui/StyledModal";
import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";

export default function DeletePlayerModal({
  open,
  onClose,
  onConfirm,
  player,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  player: { id: string; name: string } | null;
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const isConfirmed = confirmationText === player?.name;

  useEffect(() => {
    // Reset confirmation text when the modal is opened for a new player
    if (open) {
      setConfirmationText("");
    }
  }, [open]);

  if (!player) {
    return (
      <StyledModal
        open={open}
        onOpenChange={onClose}
        title="Player Not Found"
        variant="danger"
      >
        <EmptyState 
          variant="error" 
          title="Player Not Found" 
          description="The player to delete could not be found."
          action={{
            label: "Close",
            onClick: onClose,
            color: "gray"
          }}
        />
      </StyledModal>
    );
  }

  return (
    <StyledModal
      open={open}
      onOpenChange={onClose}
      title={`Delete Player`}
      variant="danger"
    >
      <p className="text-sm text-red-200 mb-3">
        This will permanently delete <strong>{player.name}</strong>, along with all associated PDPs and observations. This action cannot be undone.
      </p>

      <p className="text-sm text-slate-300 mt-4 mb-2">
        To confirm, please type "<strong>{player.name}</strong>" in the box below:
      </p>

      <input
        type="text"
        value={confirmationText}
        onChange={(e) => setConfirmationText(e.target.value)}
        className="w-full p-2 rounded bg-[#2d1c1c] border border-red-500 text-red-100 placeholder-red-200 focus:ring-red-400 focus:border-red-400"
        placeholder={`Type player's name to confirm`}
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="px-3 py-1 border border-slate-500 text-sm rounded text-slate-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(player.id)}
          disabled={!isConfirmed}
          className="bg-red-600 text-white px-4 py-2 text-sm rounded font-semibold hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          Confirm Delete
        </button>
      </div>
    </StyledModal>
  );
} 