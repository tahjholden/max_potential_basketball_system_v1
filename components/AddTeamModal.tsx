import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddTeamModal({ open, onClose, onTeamAdded }: { open: boolean; onClose: () => void; onTeamAdded?: () => void }) {
  const [teamName, setTeamName] = useState("");
  const [coachId, setCoachId] = useState("");
  const [loading, setLoading] = useState(false);

  // TODO: Fetch coaches for selection (optional, can be added later)

  const handleAddTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      // For now, just show a success message since team creation might require more logic
      toast.success("Team creation functionality coming soon!");
      setTeamName("");
      setCoachId("");
      onClose();
      onTeamAdded?.();
    } catch (error) {
      toast.error("Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border border-[#d8cc97]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#d8cc97] via-[#d8cc97] to-[#d8cc97] bg-clip-text text-transparent">
            Add Team
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="team_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Team Name *
            </label>
            <Input
              id="team_name"
              placeholder="e.g., U12 Gold"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          {/*
          <div>
            <label htmlFor="coach_id" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Coach (optional)
            </label>
            <Input
              id="coach_id"
              placeholder="Coach ID or Name"
              value={coachId}
              onChange={e => setCoachId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            />
          </div>
          */}
        </div>
        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#d8cc97]/30 text-[#d8cc97] hover:bg-[#d8cc97]/10"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTeam}
            disabled={loading || !teamName.trim()}
            className="flex-1 bg-[#d8cc97] text-black hover:bg-[#d8cc97]/80 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 