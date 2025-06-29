"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { createClient } from "@/lib/supabase/client";
import { useCoach, useCoachId } from "@/hooks/useCoach";
import toast from "react-hot-toast";

export default function AddPlayerModal({ open, onClose, onPlayerAdded }: { open: boolean; onClose: () => void; onPlayerAdded?: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initialPDP, setInitialPDP] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [noTeams, setNoTeams] = useState(false);

  // Use the coach context instead of user.user_metadata
  const { coach, loading: coachLoading, error: coachError } = useCoach();
  const coachId = useCoachId();

  useEffect(() => {
    if (open && coachId) {
      const fetchTeams = async () => {
        const supabase = createClient();
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('coach_id', coachId);
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          toast.error("Failed to fetch teams");
          return;
        }
        if (!teamsData || teamsData.length === 0) {
          setNoTeams(true);
          setTeams([]);
          setSelectedTeamId("");
        } else {
          setNoTeams(false);
          setTeams(teamsData);
          setSelectedTeamId(teamsData[0].id);
        }
      };
      fetchTeams();
    }
    if (!open) {
      setFirstName("");
      setLastName("");
      setInitialPDP("");
      setSelectedTeamId("");
    }
  }, [open, coachId]);

  const handleAdd = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!coachId) {
      toast.error("Coach information not available");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      let teamId = selectedTeamId;
      // If no teams, auto-create one
      if (noTeams) {
        const teamName = coach ? `${coach.first_name} ${coach.last_name}'s Team` : "Default Team";
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert({ name: teamName, coach_id: coachId })
          .select()
          .single();
        if (teamError || !newTeam) {
          toast.error("Failed to create default team");
          setLoading(false);
          return;
        }
        teamId = newTeam.id;
      }
      const playerData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        team_id: teamId,
      };
      const { data: player, error } = await supabase
        .from("players")
        .insert(playerData)
        .select()
        .single();
      if (error) {
        console.error("Error adding player:", error);
        toast.error(`Failed to add player: ${error.message}`);
        return;
      }
      if (initialPDP.trim() && player) {
        const { error: pdpError } = await supabase
          .from("pdp")
          .insert({
            player_id: player.id,
            content: initialPDP.trim(),
          });
        if (pdpError) {
          toast.error(`Failed to create initial PDP: ${pdpError.message}`);
        }
      }
      toast.success("Player added successfully!");
      onPlayerAdded?.();
      onClose();
    } catch (error) {
      console.error("Unexpected error adding player:", error);
      toast.error("An unexpected error occurred while adding the player.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if coach data is still loading
  if (coachLoading) {
    return null;
  }
  // Show error state if coach data failed to load
  if (coachError) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border border-[#d8cc97]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#d8cc97] via-[#d8cc97] to-[#d8cc97] bg-clip-text text-transparent drop-shadow-sm">
            Add Player
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              First Name *
            </label>
            <Input
              id="first_name"
              placeholder="e.g., Michael"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Last Name *
            </label>
            <Input
              id="last_name"
              placeholder="e.g., Jordan"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          {noTeams ? (
            <div className="text-xs text-[#d8cc97] bg-[#23221c] rounded px-3 py-2 mb-2 border border-[#d8cc97]/30">
              No teams found. A default team will be created for this player.
            </div>
          ) : (
            <div>
              <label htmlFor="team_select" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
                Team
              </label>
              <select
                id="team_select"
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97]"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="initial_pdp" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Initial PDP (optional)
            </label>
            <Input
              id="initial_pdp"
              placeholder="e.g., Focus on shooting technique"
              value={initialPDP}
              onChange={e => setInitialPDP(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
            disabled={loading}
          >
            Cancel
          </Button>
          <GoldButton
            onClick={handleAdd}
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="px-6"
          >
            {loading ? "Adding..." : "Add Player"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 