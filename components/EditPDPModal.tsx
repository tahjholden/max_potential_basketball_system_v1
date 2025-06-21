import { useState, useEffect } from "react";
import { StyledModal } from "@/components/ui/StyledModal";
import { createClient } from "@/lib/supabase/client";

export default function EditPDPModal({
  open,
  onClose,
  player,
  currentPdp,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
  currentPdp: { id: string; content: string; start_date: string } | null;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && currentPdp?.content) {
      setContent(currentPdp.content);
      setError(null);
    } else if (open) {
      setContent("");
      setError(null);
    }
  }, [open, currentPdp]);

  const handleSave = async () => {
    if (!content.trim() || !currentPdp) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdp")
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentPdp.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("PDP update failed:", error);
        setError("Update failed. Please try again.");
        return;
      }

      if (!data) {
        setError("No row was updated. It may have been archived or does not exist.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!player || !currentPdp) {
    return null;
  }

  return (
    <StyledModal
      open={open}
      onOpenChange={onClose}
      title={`Edit PDP for ${player.name}`}
    >
      <p className="text-sm text-slate-300 mb-2">
        Edit the existing PDP content below. This will update the current development plan.
      </p>

      <div className="mb-3 p-2 bg-[#1a1a1a] rounded border border-slate-600">
        <p className="text-xs text-slate-400 mb-1">
          Current PDP (Started {new Date(currentPdp.start_date).toLocaleDateString()}):
        </p>
        <p className="text-xs text-slate-300 italic">{currentPdp.content}</p>
      </div>

      <label className="block text-sm font-medium text-slate-300 mb-2">
        Updated PDP Content:
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder="Enter updated PDP content..."
        className="w-full px-3 py-2 rounded bg-[#2a2a2a] border border-slate-600 text-white focus:outline-none focus:ring focus:border-[#d8cc97]"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-3 py-1 border border-slate-500 text-sm rounded text-slate-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim() || loading}
          className="bg-[#d8cc97] text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </StyledModal>
  );
} 