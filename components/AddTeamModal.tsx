import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OutlineButton } from "@/components/ui/gold-outline-button";
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
      <DialogContent className="bg-[#181818] border border-[#C2B56B]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#C2B56B] via-[#C2B56B] to-[#C2B56B] bg-clip-text text-transparent">
            Add Team
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="team_name" className="block text-xs text-[#C2B56B] tracking-wider mb-1 font-semibold">
              Team Name*
            </label>
            <Input
              id="team_name"
              placeholder="e.g., U12 Gold"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
              required
            />
          </div>
          {/*
          <div>
            <label htmlFor="coach_id" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
              Coach (optional)
            </label>
            <Input
              id="coach_id"
              placeholder="Coach ID or Name"
              value={coachId}
              onChange={e => setCoachId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
            />
          </div>
          */}
        </div>
        <DialogFooter className="flex gap-3 pt-4">
          <OutlineButton
            type="button"
            color="zinc"
            onClick={onClose}
            className="flex-1 px-6 py-2"
            disabled={loading}
          >
            Cancel
          </OutlineButton>
          <OutlineButton
            color="gold"
            onClick={handleAddTeam}
            disabled={loading || !teamName.trim()}
            className="flex-1 px-6 py-2"
          >
            {loading ? "Adding..." : "Add Team"}
          </OutlineButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 