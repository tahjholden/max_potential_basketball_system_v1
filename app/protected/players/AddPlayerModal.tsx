"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddPlayerModal({ onPlayerAdded }: { onPlayerAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initialPDP, setInitialPDP] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    if (open) {
      const fetchTeams = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from("teams").select("id, name");
        if (error) {
          toast.error("Failed to fetch teams");
        } else {
          setTeams(data || []);
        }
      };
      fetchTeams();
    }
  }, [open]);

  const handleAdd = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const playerData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        team_id: selectedTeamId,
      };
      const { data: player, error } = await supabase.from("players").insert(playerData).select().single();
      if (error) {
        console.error("Error adding player:", error);
        toast.error(`Failed to add player: ${error.message}`);
        return;
      }
      if (initialPDP.trim() && player) {
        const { error: pdpError } = await supabase.from("pdp").insert({
          player_id: player.id,
          content: initialPDP.trim(),
        });
        if (pdpError) {
          toast.error(`Failed to create initial PDP: ${pdpError.message}`);
        }
      }
      toast.success("Player added successfully!");
      onPlayerAdded?.();
      handleClose();
    } catch (error) {
      console.error("Unexpected error adding player:", error);
      toast.error("An unexpected error occurred while adding the player.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFirstName("");
    setLastName("");
    setInitialPDP("");
    setSelectedTeamId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary h-10 border border-[#d8cc97] text-xs px-3 py-1.5 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition" type="button">
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white rounded-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gold-500" style={{ color: '#facc15' }}>
            Add New Player
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">
              First Name *
            </label>
            <Input
              id="first_name"
              placeholder="e.g., Michael"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">
              Last Name *
            </label>
            <Input
              id="last_name"
              placeholder="e.g., Jordan"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="team" className="block text-sm font-medium text-gray-300">
              Team *
            </label>
            <select
              id="team"
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              required
            >
              <option value="" disabled>Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="initial_pdp" className="block text-sm font-medium text-gray-300">
              Initial PDP (Optional)
            </label>
            <textarea
              id="initial_pdp"
              placeholder="Enter initial development plan for this player..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500 min-h-[100px] resize-y"
              value={initialPDP}
              onChange={e => setInitialPDP(e.target.value)}
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
            disabled={loading || !firstName.trim() || !lastName.trim() || !selectedTeamId}
            className="w-full sm:w-auto"
          >
            {loading ? "Adding Player..." : "Add Player"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 