"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useCoach, useCoachId } from "@/hooks/useCoach";
import { toast } from "sonner";
import { getUserRole } from "@/lib/role-utils";
import { Modal } from "@/components/ui/UniversalModal";
import { LoadingEmptyState } from "@/components/ui/EmptyState";
import EmptyState from "@/components/ui/EmptyState";
import { NoTeamsEmptyState } from "@/components/ui/EmptyState";
import type { Organization } from "@/types/entities";

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
  const isAdmin = userRole === "admin";
  const canSelectOrg = isSuperadmin; // Only superadmin can select org, admin uses their own org

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
    if (open && canSelectOrg) {
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

  // Fetch teams for selected org (superadmin) or coach/admin (regular)
  useEffect(() => {
    if (open && ((canSelectOrg && selectedOrgId) || (!canSelectOrg && coachId))) {
      const fetchTeams = async () => {
        const supabase = createClient();
        let query = supabase.from("teams").select("id, name");
        
        if (canSelectOrg) {
          query = query.eq("org_id", selectedOrgId);
        } else {
          query = query.eq("coach_id", coachId).eq("org_id", coach?.org_id);
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
      setNoTeams(false);
    }
      }, [open, canSelectOrg, selectedOrgId, coachId, coach?.org_id]);

  const handleAdd = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!canSelectOrg && !coachId) {
      toast.error("Coach information not available");
      return;
    }
    if (canSelectOrg && !selectedOrgId) {
      toast.error("Please select an organization");
      return;
    }
    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Ensure proper org_id separation
      const orgId = canSelectOrg ? selectedOrgId : coach?.org_id;
      if (!orgId) {
        toast.error("Organization information not available");
        setLoading(false);
        return;
      }

      const playerData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        team_id: selectedTeamId,
        org_id: orgId,
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
      
      // Create initial PDP if provided
      if (initialPDP.trim() && player) {
        const { error: pdpError } = await supabase
          .from("pdps")
          .insert({
            player_id: player.id,
            content: initialPDP.trim(),
            org_id: orgId,
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

  const isFormValid = firstName.trim() && 
    lastName.trim() && 
    (!canSelectOrg || selectedOrgId) &&
    selectedTeamId;

  if (coachLoading) {
    return (
      <Modal.Info
        open={open}
        onOpenChange={(open) => !open && onClose()}
        title="Loading"
        description="Loading coach information..."
      >
        <LoadingEmptyState message="Loading coach information..." />
      </Modal.Info>
    );
  }
  
  if (coachError) {
    return (
      <Modal.Info
        open={open}
        onOpenChange={(open) => !open && onClose()}
        title="Error loading coach"
        description={coachError}
      >
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
      </Modal.Info>
    );
  }

  // Show no teams state if no teams exist
  if (noTeams) {
    return (
      <Modal.Info
        open={open}
        onOpenChange={(open) => !open && onClose()}
        title="No Teams Available"
        description="You need to create a team before adding players."
      >
        <NoTeamsEmptyState onAddTeam={() => onClose()} />
      </Modal.Info>
    );
  }

  return (
    <Modal.Add
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title="Add Player"
      description="Enter the player's information below."
      onSubmit={handleAdd}
      submitText={loading ? "Adding..." : "Add Player"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-4">
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
          {canSelectOrg && (
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
                <option value="">Select an organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1">
            <div>
              <label htmlFor="team_select" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
                Team *
              </label>
              <select
                id="team_select"
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B]"
                required
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
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
    </Modal.Add>
  );
} 