"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddObservationModal({
  player,
  onObservationAdded,
}: {
  player: any;
  onObservationAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!content.trim()) {
      toast.error("Observation content is required");
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      
      // Get the current user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User not authenticated.");
        toast.error("Authentication error. Please try again.");
        return;
      }

      // Look up (or create) the coach record
      let coachId: string;
      let { data: coachRow } = await supabase
        .from('coaches')
        .select('id')
        .eq('auth_uid', user.id)
        .maybeSingle();

      if (!coachRow) {
        // Auto-create coach record if missing
        const { data: newCoach, error: createCoachError } = await supabase
          .from('coaches')
          .insert({
            auth_uid: user.id,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            email: user.email || '',
            is_admin: false,
            active: true,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();
        
        if (createCoachError) {
          console.error("Error creating coach record:", createCoachError);
          toast.error("Failed to create coach record. Please try again.");
          return;
        }
        coachId = newCoach.id;
      } else {
        coachId = coachRow.id;
      }

      // Get the active PDP for the player (not archived)
      const { data: activePdp, error: pdpError } = await supabase
        .from("pdp")
        .select("id")
        .eq("player_id", player.id)
        .is("archived_at", null) // PDPs still use archived_at for now
        .single();

      if (pdpError && pdpError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is okay.
        console.error("Error fetching active PDP:", pdpError);
        toast.error("Could not fetch the active development plan.");
        return;
      }

      if (!activePdp) {
        toast.error("Cannot add observation: No active development plan found for this player.");
        return;
      }

      const { error } = await supabase.from("observations").insert({
        player_id: player.id,
        content: content.trim(),
        observation_date: now,
        coach_id: coachId, // Always set coach_id for RLS compliance
        pdp_id: activePdp?.id,
        archived: false, // New observations are always active
      });
      
      if (error) {
        console.error("Error adding observation:", error);
        toast.error(`Failed to add observation: ${error.message}`);
        return;
      }
      
      toast.success("Observation added successfully!");
      setContent("");
      setOpen(false);
      router.refresh();
      onObservationAdded?.();
    } catch (error) {
      console.error("Unexpected error adding observation:", error);
      toast.error("An unexpected error occurred while adding the observation.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GoldButton>Add Observation</GoldButton>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white rounded-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gold-500" style={{ color: '#facc15' }}>
            Add Observation for {player?.name || player?.first_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="observation_content" className="block text-sm font-medium text-gray-300">
              Observation Details *
            </label>
            <textarea
              id="observation_content"
              placeholder="Enter observation details..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500 min-h-[120px] resize-y"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
        </div>
        
        <DialogFooter className="pt-4 sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <GoldButton
            onClick={handleAdd}
            disabled={loading || !content.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? "Adding..." : "Add Observation"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 