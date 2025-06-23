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
      const now = new Date().toISOString();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not authenticated.");
        setLoading(false);
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
          setError(`Failed to create coach record: ${createCoachError.message}`);
          setLoading(false);
          return;
        }
        coachId = newCoach.id;
      } else {
        coachId = coachRow.id;
      }

      // Create the new PDP with coach_id
      const { error: insertError } = await supabase.from("pdp").insert({
        player_id: player.id,
        coach_id: coachId, // Always set coach_id
        content: content.trim(),
        start_date: now,
        created_at: now,
        updated_at: now,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError(
            "This player already has an active PDP. Please refresh and try again."
          );
        } else {
          setError(`Failed to create the new PDP: ${insertError.message}`);
          console.error("PDP creation error:", insertError);
        }
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
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