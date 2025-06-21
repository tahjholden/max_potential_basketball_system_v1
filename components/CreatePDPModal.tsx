import { useState, useEffect } from "react";
import { StyledModal } from "@/components/ui/StyledModal";

export default function CreatePDPModal({
  open,
  onClose,
  player,
  currentPdp,
  coachId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
  currentPdp: { id: string } | null;
  coachId: string;
  onCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setContent("");
      setError(null);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!content.trim() || !player) return;

    setLoading(true);
    setError(null);
    
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      if (currentPdp) {
        const { error: archiveError } = await supabase
          .from("pdp")
          .update({ archived_at: new Date().toISOString() })
          .eq("id", currentPdp.id);

        if (archiveError) {
          console.error("Archive error:", archiveError);
          setError("Failed to archive the existing PDP. Please try again.");
          setLoading(false);
          return;
        }
      }
      
      const { error: insertError } = await supabase.from("pdp").insert({
        player_id: player.id,
        content,
        start_date: new Date().toISOString().slice(0, 10),
        coach_id: coachId,
        archived_at: null
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError("This player already has an active PDP. Please refresh and try again.");
        } else {
          setError("Failed to create the new PDP.");
          console.error("PDP creation error:", insertError);
        }
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("PDP creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if player is null
  if (!player) {
    return null;
  }

  return (
    <StyledModal
      open={open}
      onOpenChange={onClose}
      title={`Create New PDP for ${player.name}`}
    >
      <p className="text-sm text-slate-300 mb-2">Enter new PDP content:</p>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder="New development goals..."
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
          onClick={handleCreate}
          disabled={!content.trim() || loading}
          className="bg-[#d8cc97] text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create PDP"}
        </button>
      </div>
    </StyledModal>
  );
} 