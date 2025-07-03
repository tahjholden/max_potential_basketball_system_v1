"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import EntityMetadataCard from '@/components/EntityMetadataCard';
import SectionLabel from '@/components/SectionLabel';
import ComingSoonCard from '@/components/ComingSoonCard';
import { useSearchParams } from 'next/navigation';
import { useCurrentCoach } from '@/hooks/useCurrentCoach';
import { useSelectedPlayer } from '@/stores/useSelectedPlayer';
import Link from "next/link";
import type { Organization } from '@/types/entities';
import EmptyState from "@/components/ui/EmptyState";
import AddTeamModal from "@/components/AddTeamModal";
import { Card } from "@/components/ui/card";
import { Users, Shield } from "lucide-react";
import EntityButton from '@/components/EntityButton';
import { toast } from "sonner";
import DeleteButton from "@/components/DeleteButton";
import { Modal } from "@/components/ui/UniversalModal";
import { Input } from "@/components/ui/input";

interface Team {
  id: string;
  name: string;
  coach_id: string;
  created_at: string;
  updated_at: string;
  player_count?: number;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  team_id: string;
}

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [teamCoach, setTeamCoach] = useState<Coach | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const { coach: currentCoach } = useCurrentCoach();
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [teamSearch, setTeamSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);
  const MAX_TEAMS = 5;
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const filteredTeams = sortedTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));
  const displayedTeams = showAllTeams ? filteredTeams : filteredTeams.slice(0, MAX_TEAMS);
  const [playerPDPs, setPlayerPDPs] = useState<Record<string, boolean>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [teamBeingEdited, setTeamBeingEdited] = useState<Team | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Get current user's role and org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: currentCoachData } = await supabase
        .from('coaches')
        .select('is_admin, is_superadmin, org_id')
        .eq('auth_uid', user.id)
        .single();
      
      const isSuperadmin = currentCoachData?.is_superadmin;
      const isAdmin = currentCoachData?.is_admin;
      const orgId = currentCoachData?.org_id;
      
      // Fetch teams with role-based filtering
      let teamsQuery = supabase.from("teams").select("*").order("created_at", { ascending: false });
      if (!isSuperadmin) {
        teamsQuery = teamsQuery.eq("org_id", orgId);
      }
      const { data: teamData } = await teamsQuery;
      setTeams(teamData || []);
      
      // Fetch coaches with role-based filtering
      let coachesQuery = supabase.from("coaches").select("*");
      if (!isSuperadmin) {
        coachesQuery = coachesQuery.eq("org_id", orgId);
      }
      if (!isAdmin && !isSuperadmin) {
        coachesQuery = coachesQuery.eq("active", true);
      }
      const { data: coachesData } = await coachesQuery;
      setCoaches(coachesData || []);
      
      // Fetch players with role-based filtering
      let playersQuery = supabase.from("players").select("*");
      if (!isSuperadmin) {
        playersQuery = playersQuery.eq("org_id", orgId);
      }
      const { data: playerData } = await playersQuery;
      setPlayers(playerData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setTeamPlayers([]);
      setTeamCoach(null);
      return;
    }
    const fetchTeamDetails = async () => {
      const supabase = createClient();
      const { data: teamPlayerList } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", selectedTeam.id);
      setTeamPlayers(teamPlayerList || []);
      const { data: coachData } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", selectedTeam.coach_id)
        .single();
      setTeamCoach(coachData || null);
    };
    fetchTeamDetails();
  }, [selectedTeam]);

  useEffect(() => {
    if (teams.length === 0) return;
    const teamId = searchParams.get('teamId');
    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeam(team);
        return;
      }
    }
    if (!selectedTeam && currentCoach) {
      const coachTeams = teams.filter(team => team.coach_id === currentCoach.id);
      if (coachTeams.length > 0) {
        setSelectedTeam(coachTeams[0]);
      }
    }
    if (playerId && !selectedTeam) {
      const fetchPlayerTeam = async () => {
        const supabase = createClient();
        const { data: playerData } = await supabase
          .from("players")
          .select("team_id")
          .eq("id", playerId)
          .single();
        if (playerData?.team_id) {
          const playerTeam = teams.find(team => team.id === playerData.team_id);
          if (playerTeam) {
            setSelectedTeam(playerTeam);
          }
        }
      };
      fetchPlayerTeam();
    }
  }, [currentCoach, teams, selectedTeam, searchParams, playerId]);

  // Reset selected player on team or page change
  useEffect(() => {
    setPlayerId("");
  }, [selectedTeam]);

  // Fetch PDPs for team players
  useEffect(() => {
    async function fetchPlayerPDPs() {
      if (!selectedTeam || teamPlayers.length === 0) {
        setPlayerPDPs({});
        return;
      }
      const supabase = createClient();
      const playerIds = teamPlayers.map(p => p.id);
      const { data: pdps } = await supabase
        .from('pdp')
        .select('player_id, archived_at')
        .in('player_id', playerIds)
        .is('archived_at', null);
      // Map player_id to true if they have an active PDP
      const pdpMap: Record<string, boolean> = {};
      playerIds.forEach(id => {
        pdpMap[id] = !!(pdps && pdps.find(p => p.player_id === id));
      });
      setPlayerPDPs(pdpMap);
    }
    fetchPlayerPDPs();
  }, [selectedTeam, teamPlayers]);

  const openCreateModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleEdit = () => {
    setTeamBeingEdited(selectedTeam);
    setEditModalOpen(true);
  };
  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };
  async function deleteTeam() {
    if (!selectedTeam) return;
    setDeleteLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("teams").delete().eq("id", selectedTeam.id);
    setDeleteLoading(false);
    setDeleteConfirmOpen(false);
    if (error) {
      toast.error("Failed to delete team");
      return;
    }
    toast.success("Team deleted");
    setSelectedTeam(null);
    // Refetch teams
    const { data: teamData } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
    setTeams(teamData || []);
  }

  // --- CANONICAL DASHBOARD LAYOUT STARTS HERE ---
  return (
    <div className="flex-1 min-h-0 flex gap-6">
      {/* Left: Teams list */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <SectionLabel>Teams</SectionLabel>
        <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
          {displayedTeams.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No Teams Found"
              description="Add your first team to get started."
              className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
              action={{ label: "Add Team", onClick: openCreateModal, color: "gold" }}
            />
          ) : (
            <>
              {/* Scrollable team list, responsive height */}
              <div className="flex-1 min-h-0 mb-2">
                {displayedTeams.map((team) => (
                  <button
                    key={team.id}
                    className={
                      "w-full flex items-center justify-center rounded font-bold border-2 transition-colors px-4 py-2 mb-2 " +
                      (team.id === selectedTeam?.id
                        ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                        : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
                    }
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team.name}
                  </button>
                ))}
                {filteredTeams.length > MAX_TEAMS && (
                  <div
                    className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                    onClick={() => setShowAllTeams(!showAllTeams)}
                    title={showAllTeams ? "Show less" : "Show more"}
                  >
                    <div className="flex-1 border-t border-zinc-700"></div>
                    <svg className={`w-5 h-5 transition-transform ${showAllTeams ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    <div className="flex-1 border-t border-zinc-700"></div>
                  </div>
                )}
              </div>
              {/* Search bar at the bottom - only show when chevron is needed */}
              {filteredTeams.length > MAX_TEAMS && (
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={teamSearch}
                  onChange={e => setTeamSearch(e.target.value)}
                  className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
                />
              )}
            </>
          )}
        </Card>
      </div>
      {/* Center: Team Profile + Roster */}
      <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
        <SectionLabel>Team Profile</SectionLabel>
        <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
          {selectedTeam ? (
            <div>
              <div className="text-lg font-bold text-[#C2B56B] mb-2">{selectedTeam.name}</div>
              <div className="text-sm text-zinc-400 font-medium mb-1">
                Coach: {teamCoach ? `${teamCoach.first_name} ${teamCoach.last_name}` : "No coach assigned"}
              </div>
              <div className="text-sm text-zinc-400 font-medium mb-1">
                Players: {teamPlayers.length} player{teamPlayers.length !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-zinc-400 font-medium mb-1">
                Created: {selectedTeam.created_at ? format(new Date(selectedTeam.created_at), "MMMM do, yyyy") : "—"}
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={handleEdit}
                  className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm mr-4"
                >
                  Edit Team
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                >
                  Delete Team
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Shield}
              title="Select a Team to View Their Profile"
              description="Pick a team from the list to see their details."
              className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
            />
          )}
        </Card>
        <SectionLabel>Roster</SectionLabel>
        <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
          {selectedTeam ? (
            teamPlayers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Players on This Team"
                description="Add players to this team to see them in the roster."
                className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {teamPlayers.map(player => {
                  const isSelected = playerId === player.id;
                  const hasPDP = playerPDPs[player.id];
                  let classes = "w-full flex items-center justify-center px-4 py-2 rounded font-medium border transition-colors ";
                  if (!hasPDP) {
                    classes += "bg-zinc-900 text-white border-[#A22828] hover:bg-[#A22828]/10 ";
                  } else {
                    classes += "border-[#C2B56B] bg-zinc-900 ";
                  }
                  if (isSelected) {
                    classes += " bg-[#C2B56B] text-black";
                  } else if (hasPDP) {
                    classes += " text-zinc-300 hover:bg-[#C2B56B]/10";
                  }
                  return (
                    <Link
                      key={player.id}
                      href={`/protected/players?id=${player.id}&teamId=${player.team_id}`}
                      className={classes}
                    >
                      {player.first_name} {player.last_name}
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            <EmptyState
              icon={Users}
              title="Select a Team to View Their Roster"
              description="Pick a team from the list to see their players."
              className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
            />
          )}
        </Card>
      </div>
      {/* Right: Planned Features */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
        <SectionLabel>Planned Features</SectionLabel>
        <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
          <div className="pt-2 w-full">
            <ul className="mb-4 text-zinc-400 text-sm list-disc pl-5" style={{maxWidth: 260}}>
              <li><span className="font-semibold text-[#C2B56B]">Practice & game schedule</span></li>
              <li><span className="font-semibold text-[#C2B56B]">Team attendance & participation heatmap</span></li>
              <li><span className="font-semibold text-[#C2B56B]">Announcements & team messaging</span></li>
            </ul>
            <span className="text-white italic text-xs block mt-2">
              These features are on our roadmap and will be launching soon for all teams!
            </span>
          </div>
        </Card>
      </div>
      <AddTeamModal
        open={modalOpen}
        onClose={closeModal}
        onTeamAdded={() => {
          const fetchData = async () => {
            const supabase = createClient();
            const { data: teamData } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
            setTeams(teamData || []);
          };
          fetchData();
        }}
      />
      {editModalOpen && teamBeingEdited && (
        <EditTeamModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          team={teamBeingEdited}
          onSuccess={async () => {
            setEditModalOpen(false);
            // Refetch teams
            const supabase = createClient();
            const { data: teamData } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
            setTeams(teamData || []);
          }}
        />
      )}
      <DeleteButton
        onConfirm={deleteTeam}
        entity="Team"
        description={`This will permanently delete ${selectedTeam?.name} and remove all linked data.`}
        iconOnly={false}
        label="Delete Team"
        confirmText={selectedTeam?.name}
        triggerClassName="hidden" // Hide the default trigger, use our button
      />
      {deleteConfirmOpen && (
        <Modal.Delete
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Team"
          description={`Are you sure you want to delete ${selectedTeam?.name}? This action cannot be undone.`}
          onConfirm={deleteTeam}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

interface EditTeamModalProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  onSuccess: () => void;
}

function EditTeamModal({ open, onClose, team, onSuccess }: EditTeamModalProps) {
  const [teamName, setTeamName] = useState(team.name);
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("teams").update({ name: teamName.trim(), updated_at: new Date().toISOString() }).eq("id", team.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update team");
      return;
    }
    toast.success("Team updated successfully!");
    onSuccess();
    onClose();
  };
  return (
    <Modal.Edit
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title="Edit Team"
      description="Update the team information below."
      onSubmit={handleSave}
      submitText={loading ? "Saving..." : "Save Changes"}
      loading={loading}
      disabled={!teamName.trim()}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="edit_team_name" className="block text-xs text-[#C2B56B] tracking-wider mb-1 font-semibold">
            Team Name*
          </label>
          <Input
            id="edit_team_name"
            placeholder="e.g., U12 Gold"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
            required
          />
        </div>
      </div>
    </Modal.Edit>
  );
} 