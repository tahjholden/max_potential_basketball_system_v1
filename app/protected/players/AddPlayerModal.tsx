"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { GoldOutlineButton } from "@/components/ui/gold-outline-button";
import { OutlineButton } from "@/components/ui/gold-outline-button";
import { createClient } from "@/lib/supabase/client";
import { useCoach, useCoachId } from "@/hooks/useCoach";
import toast from "react-hot-toast";
import { getUserRole } from "@/lib/role-utils";
import type { Organization } from "@/types/entities";
import { LoadingEmptyState } from "@/components/ui/EmptyState";
import EmptyState from "@/components/ui/EmptyState";

export default function AddPlayerModal({ open, onClose, onPlayerAdded }: { open: boolean; onClose: () => void; onPlayerAdded?: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initialPDP, setInitialPDP] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [noTeams, setNoTeams] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const { coach, loading: coachLoading, error: coachError } = useCoach();
  const coachId = useCoachId();
  const userRole = getUserRole(coach);
  const isSuperadmin = userRole === "superadmin";

  // Timeout fallback for coach loading
  useEffect(() => {
    if (coachLoading) {
      const timeout = setTimeout(() => {
        console.warn("Coach loading timeout - consider showing error state");
      }, 10000); // 10 second timeout
      return () => clearTimeout(timeout);
    }
  }, [coachLoading]);

  // Fetch orgs for superadmin
  useEffect(() => {
    if (open && isSuperadmin) {
      setLoadingOrgs(true);
      createClient()
        .from("orgs")
        .select("id, name, created_at")
        .order("name")
        .then(({ data, error }) => {
          setLoadingOrgs(false);
          if (error) {
            toast.error("Failed to fetch organizations");
            setOrganizations([]);
            return;
          }
          setOrganizations(data || []);
          if (data && data.length > 0) {
            setSelectedOrgId(data[0].id);
          }
        });
    }
    if (!open) {
      setSelectedOrgId("");
    }
  }, [open, isSuperadmin]);

  // Fetch teams for selected org (superadmin) or coach (regular)
  useEffect(() => {
    if (open && ((isSuperadmin && selectedOrgId) || (!isSuperadmin && coachId))) {
      const fetchTeams = async () => {
        const supabase = createClient();
        let query = supabase.from("teams").select("id, name");
        if (isSuperadmin) {
          query = query.eq("org_id", selectedOrgId);
        } else {
          query = query.eq("coach_id", coachId);
        }
        const { data: teamsData, error: teamsError } = await query;
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          toast.error("Failed to fetch teams");
          setTeams([]);
          setNoTeams(true);
          setSelectedTeamId("");
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
      setTeams([]);
      setSelectedTeamId("");
    }
  }, [open, isSuperadmin, selectedOrgId, coachId]);

  const handleAdd = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!isSuperadmin && !coachId) {
      toast.error("Coach information not available");
      return;
    }
    if (isSuperadmin && !selectedOrgId) {
      toast.error("Please select an organization");
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
          .insert({ name: teamName, coach_id: coachId, org_id: isSuperadmin ? selectedOrgId : coach?.org_id })
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
        org_id: isSuperadmin ? selectedOrgId : coach?.org_id,
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

  if (coachLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#181818] border border-[#C2B56B]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
          <LoadingEmptyState message="Loading coach information..." />
        </DialogContent>
      </Dialog>
    );
  }
  
  if (coachError) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#181818] border border-[#C2B56B]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
          <EmptyState 
            variant="error" 
            title="Error loading coach" 
            description={coachError}
            action={{
              label: "Retry",
              onClick: () => window.location.reload(),
              color: "gold"
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border border-[#C2B56B]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#C2B56B] via-[#C2B56B] to-[#C2B56B] bg-clip-text text-transparent drop-shadow-sm">
            Add Player
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="first_name" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
              First Name *
            </label>
            <Input
              id="first_name"
              placeholder="e.g., Michael"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
              Last Name *
            </label>
            <Input
              id="last_name"
              placeholder="e.g., Jordan"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
              required
            />
          </div>
          <div className="flex gap-2">
            {isSuperadmin && (
              <div className="flex-1">
                <label htmlFor="org_select" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
                  Organization
                </label>
                <select
                  id="org_select"
                  value={selectedOrgId}
                  onChange={e => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B]"
                  disabled={loadingOrgs}
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex-1">
              {noTeams ? (
                <div className="text-xs text-[#C2B56B] bg-[#23221c] rounded px-3 py-2 mb-2 border border-[#C2B56B]/30">
                  No teams found. A default team will be created for this player.
                </div>
              ) : (
                <div>
                  <label htmlFor="team_select" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
                    Team
                  </label>
                  <select
                    id="team_select"
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B]"
                  >
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="initial_pdp" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
              Initial PDP (optional)
            </label>
            <Input
              id="initial_pdp"
              placeholder="e.g., Focus on shooting technique"
              value={initialPDP}
              onChange={e => setInitialPDP(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-3 pt-6">
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
            onClick={handleAdd}
            disabled={loading || !firstName.trim() || !lastName.trim() || (isSuperadmin && !selectedOrgId)}
            className="flex-1 px-6 py-2"
          >
            {loading ? "Adding..." : "Add Player"}
          </OutlineButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 