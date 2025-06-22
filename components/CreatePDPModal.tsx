import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GoldButton } from "./ui/gold-button";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";

export default function CreatePDPModal({
  open,
  onClose,
  player,
  coachId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
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
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("pdp").insert({
        player_id: player.id,
        content,
        start_date: new Date().toISOString().slice(0, 10),
        coach_id: user.id,
        archived_at: null,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError(
            "This player already has an active PDP. Please refresh and try again."
          );
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

  if (!player) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New PDP for {player.name}</DialogTitle>
        </DialogHeader>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="New development goals..."
          className="w-full px-3 py-2 rounded bg-[#2a2a2a] border border-slate-600 text-white focus:outline-none focus:ring focus:border-gold"
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <GoldButton
            onClick={handleCreate}
            disabled={!content.trim() || loading}
          >
            {loading ? "Creating..." : "Create PDP"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 