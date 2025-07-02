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
  const [position, setPosition] = useState("");
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
  }, [open, canSelectOrg]);

  // Fetch teams for selected org (superadmin) or coach/admin (regular)
  useEffect(() => {
    if (open && ((canSelectOrg && selectedOrgId) || (!canSelectOrg && coach?.id))) {
      const fetchTeams = async () => {
        const supabase = createClient();
        let query = supabase.from("teams").select("id, name");
        
        if (canSelectOrg) {
          query = query.eq("org_id", selectedOrgId);
        } else {
          query = query.eq("coach_id", coach?.id).eq("org_id", coach?.org_id);
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
  }, [open, canSelectOrg, selectedOrgId, coach?.id, coach?.org_id]);

  const handleAddPlayer = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (!canSelectOrg && !coach?.id) {
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
        position: position.trim() || null,
        team_id: selectedTeamId,
        org_id: orgId,
      };
      
      const { error } = await supabase
        .from("players")
        .insert(playerData);
        
      if (error) throw error;
      
      toast.success("Player added successfully!");
      setFirstName("");
      setLastName("");
      setPosition("");
      setSelectedTeamId("");
      onClose();
      onPlayerAdded?.();
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player");
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
      onSubmit={handleAddPlayer}
      submitText={loading ? "Adding..." : "Add Player"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="player_first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            First Name *
          </label>
          <Input
            id="player_first_name"
            placeholder="e.g., John"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="player_last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Last Name *
          </label>
          <Input
            id="player_last_name"
            placeholder="e.g., Smith"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div className="flex gap-2">
          {canSelectOrg && (
            <div className="flex-1">
              <label htmlFor="org_select" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
                Organization
              </label>
              <select
                id="org_select"
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97]"
                disabled={loadingOrgs}
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1">
            <label htmlFor="team_select" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Team *
            </label>
            <select
              id="team_select"
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97]"
              required
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="player_position" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Position
          </label>
          <Input
            id="player_position"
            placeholder="e.g., Forward"
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
          />
        </div>
      </div>
    </Modal.Add>
  );
} 