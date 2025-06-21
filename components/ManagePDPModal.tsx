"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ManagePDPModal({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function archiveAndCreateNewPDP() {
    const now = new Date().toISOString();
    setLoading(true);
    const supabase = createClient();

    // 1. Fetch active PDP
    const { data: currentPDP, error: fetchError } = await supabase
      .from("pdp")
      .select("*")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .single();

    if (fetchError || !currentPDP) {
      toast.error("No active PDP found.");
      setLoading(false);
      return;
    }

    // 2. Archive it
    await supabase
      .from("pdp")
      .update({
        archived_at: now,
        end_date: now,
        updated_at: now,
      })
      .eq("id", currentPDP.id);

    // 3. Link observations to archived PDP
    await supabase
      .from("observations")
      .update({ pdp_id: currentPDP.id })
      .eq("player_id", playerId)
      .gte("observation_date", currentPDP.start_date)
      .lte("observation_date", now)
      .is("archived_at", null);

    // 4. Create new PDP
    const { data: newPDP, error: insertError } = await supabase
      .from("pdp")
      .insert({
        player_id: playerId,
        start_date: now,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    setLoading(false);
    setOpen(false);

    if (insertError || !newPDP) {
      toast.error("Failed to create new PDP.");
    } else {
      toast.success("New PDP created for " + playerName);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-yellow-400 underline text-sm">Manage PDP</button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Manage PDP for <span className="text-yellow-300">{playerName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-zinc-300">
          Archive the current PDP and start fresh? Observations since the start
          of the current plan will be linked to it.
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={archiveAndCreateNewPDP} disabled={loading}>
            {loading ? "Working..." : "Archive & Create New"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 