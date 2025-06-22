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
  currentPdp: { id: string; content: string | null; start_date: string } | null;
  onSuccess: () => void;
}) {
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && currentPdp?.content) {
      setNewContent(currentPdp.content);
    } else if (open) {
      setNewContent("");
    }
    setError(null);
  }, [open, currentPdp]);

  const handleSave = async () => {
    if (!newContent.trim() || !currentPdp) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdp")
        .update({
          content: newContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentPdp.id)
        .select()
        .maybeSingle();

      if (error || !data) {
        setError("Update failed. The plan may have been archived or deleted.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!player || !currentPdp) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit PDP for {player.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400 mb-1 font-semibold">Current Plan</p>
            <p className="text-sm text-zinc-500 bg-zinc-800 rounded p-3 min-h-[40px]">
              {currentPdp.content || "No content."}
            </p>
          </div>

          <div>
            <label htmlFor="newPDP" className="text-sm text-zinc-300 block mb-1">Edit Plan</label>
            <textarea
              id="newPDP"
              rows={5}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 rounded text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <GoldButton onClick={handleSave} disabled={!newContent.trim() || loading}>
            {loading ? "Saving..." : "Save Changes"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 