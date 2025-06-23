"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AddObservationModalProps {
  open: boolean;
  onClose: () => void;
  player: any;
  onObservationAdded?: () => void;
}

export default function AddObservationModal({
  open,
  onClose,
  player,
  onObservationAdded,
}: AddObservationModalProps) {
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || !date) {
      setError("Observation and date required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      await supabase.from("observations").insert({
        player_id: player.id,
        content: content.trim(),
        observation_date: date,
      });
      setContent("");
      setDate("");
      onClose();
      onObservationAdded?.();
    } catch (err: any) {
      setError(err.message || "Failed to add observation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border border-zinc-700">
        <DialogHeader>
          <DialogTitle>Add Observation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
          <textarea
            placeholder="Enter observation details..."
            className="w-full rounded bg-zinc-800 p-2 text-white min-h-[80px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-500">{error}</div>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Add"}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 