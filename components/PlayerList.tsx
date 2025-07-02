"use client";
import { useState, useEffect } from "react";
import { Search, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCoach } from "@/hooks/useCoach";
import { getUserRole } from "@/lib/role-utils";
import { Modal } from "@/components/ui/UniversalModal";
import UniversalButton from "@/components/ui/UniversalButton";
import type { Organization } from "@/types/entities";

interface PlayerListProps {
  players: any[];
  selected: any | null;
  onSelect: (player: any) => void;
}

export default function PlayerList({ players, selected, onSelect }: PlayerListProps) {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [noTeams, setNoTeams] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const { coach, loading: coachLoading, error: coachError } = useCoach();
  const userRole = getUserRole(coach);
  const isSuperadmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";
  const canSelectOrg = isSuperadmin; // Only superadmin can select org, admin uses their own org

  // Fetch orgs for superadmin
  useEffect(() => {
    if (isAddModalOpen && canSelectOrg) {
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
    if (!isAddModalOpen) {
      setSelectedOrgId("");
    }
  }, [isAddModalOpen, canSelectOrg]);

  // Fetch teams for selected org (superadmin) or coach/admin (regular)
  useEffect(() => {
    if (isAddModalOpen && ((canSelectOrg && selectedOrgId) || (!canSelectOrg && coach?.id))) {
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
    if (!isAddModalOpen) {
      setTeams([]);
      setSelectedTeamId("");
      setNoTeams(false);
    }
  }, [isAddModalOpen, canSelectOrg, selectedOrgId, coach?.id, coach?.org_id]);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
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
    
    const supabase = createClient();
    
    // Ensure proper org_id separation
    const orgId = canSelectOrg ? selectedOrgId : coach?.org_id;
    if (!orgId) {
      toast.error("Organization information not available");
      return;
    }

    const playerData = {
      name: newPlayerName.trim(),
      team_id: selectedTeamId,
      org_id: orgId,
    };
    
    const { error } = await supabase
      .from("players")
      .insert([playerData]);
    
    if (error) {
      toast.error("Failed to add player");
    } else {
      toast.success("Player added successfully");
      setNewPlayerName("");
      setSelectedTeamId("");
      setIsAddModalOpen(false);
      // Refresh the page to get updated data
      window.location.reload();
    }
  };

  const isFormValid = newPlayerName.trim() && 
    (!canSelectOrg || selectedOrgId) &&
    selectedTeamId;

  return (
    <div className="bg-[#232323] rounded-lg p-4 border border-[#323232] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#d8cc97]">Players</h2>
        <UniversalButton.Primary
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusCircle size={14} className="mr-1" />
          Add
        </UniversalButton.Primary>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search players..."
          className="w-full bg-[#18191A] border border-[#323232] rounded-md pl-9 pr-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#d8cc97] focus:outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul className="flex-1 overflow-y-auto space-y-1 -mr-2 pr-2">
        {filteredPlayers.map((player) => (
          <li
            key={player.id}
            onClick={() => onSelect(player)}
            className={`cursor-pointer p-3 rounded-lg transition-colors ${
              selected?.id === player.id
                ? "bg-[#d8cc97] text-black font-semibold"
                : "hover:bg-[#323232] text-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm">{player.name}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Add Player Modal */}
      <Modal.Add
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Player"
        description="Enter the player's information below."
        onSubmit={handleAddPlayer}
        submitText="Add Player"
        loading={coachLoading}
        disabled={!isFormValid}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="player_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Player Name *
            </label>
            <input
              id="player_name"
              type="text"
              placeholder="Player name"
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#d8cc97] focus:outline-none"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              required
            />
          </div>
          
          {canSelectOrg && (
            <div>
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
          
          <div>
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
      </Modal.Add>
    </div>
  );
} 