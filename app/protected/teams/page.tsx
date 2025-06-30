"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import EntityMetadataCard from '@/components/EntityMetadataCard';
import EmptyCard from '@/components/EmptyCard';
import SectionLabel from '@/components/SectionLabel';
import ComingSoonCard from '@/components/ComingSoonCard';
import { useSearchParams } from 'next/navigation';
import { useCurrentCoach } from '@/hooks/useCurrentCoach';
import { useSelectedPlayer } from '@/stores/useSelectedPlayer';
import Link from "next/link";

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

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateTeamModal({ open, onClose, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not authenticated.");
        return;
      }
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('auth_uid', user.id)
        .single();
      if (coachError || !coachData) {
        setError("Coach record not found.");
        return;
      }
      const { error: insertError } = await supabase.from("teams").insert({
        name: name.trim(),
        coach_id: coachData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (insertError) {
        setError(`Failed to create team: ${insertError.message}`);
      } else {
        setName('');
        onCreated();
        onClose();
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Team</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white focus:outline-none focus:ring focus:border-gold"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <GoldButton onClick={handleCreate} disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create Team"}
            </GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
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
  const { playerId } = useSelectedPlayer();
  const [teamSearch, setTeamSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);
  const MAX_TEAMS = 5;
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const filteredTeams = sortedTeams.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()));
  const displayedTeams = showAllTeams ? filteredTeams : filteredTeams.slice(0, MAX_TEAMS);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: teamData } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
      setTeams(teamData || []);
      const { data: coachData } = await supabase.from("coaches").select("*");
      setCoaches(coachData || []);
      const { data: playerData } = await supabase.from("players").select("*");
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

  const openCreateModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleEdit = () => {};
  const handleDelete = () => {};

  const getTeamMetadataFields = () => {
    if (!selectedTeam) return [];
    return [
      { label: "Name", value: selectedTeam.name, highlight: true },
      { label: "Coach", value: teamCoach ? `${teamCoach.first_name} ${teamCoach.last_name}` : "No coach assigned" },
      { label: "Players", value: `${teamPlayers.length} player${teamPlayers.length !== 1 ? 's' : ''}` },
      { label: "Created", value: new Date(selectedTeam.created_at).toLocaleDateString() },
    ];
  };
  const getTeamActions = () => (
    <div className="flex gap-1">
      <GoldButton onClick={handleEdit}>Edit Team</GoldButton>
      <Button variant="destructive" onClick={handleDelete}>Delete Team</Button>
    </div>
  );

  // --- CANONICAL DASHBOARD LAYOUT STARTS HERE ---
  return (
    <div className="flex-1 min-h-0 flex gap-6">
      {/* Left: Teams list */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <SectionLabel>Teams</SectionLabel>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 h-96 flex flex-col">
          {/* Scrollable team list, responsive height */}
          <div className="flex-1 min-h-0 overflow-y-auto mb-2">
            {displayedTeams.length === 0 ? (
              <div className="text-zinc-500 italic text-center py-8">No teams yet. Create one!</div>
            ) : (
              displayedTeams.map((team) => (
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
              ))
            )}
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
        </div>
      </div>
      {/* Center: Team Profile + Roster */}
      <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
        <SectionLabel>Team Profile</SectionLabel>
        {selectedTeam ? (
          <EntityMetadataCard
            fields={getTeamMetadataFields()}
            actions={getTeamActions()}
            cardClassName="mt-0"
          />
        ) : (
          <EmptyCard title="Select a Team to View Their Profile" titleClassName="font-bold text-center" />
        )}
        <SectionLabel>Roster</SectionLabel>
        {selectedTeam ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
            {teamPlayers.length === 0 ? (
              <div className="text-zinc-500 italic">No players on this team.</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {teamPlayers.map(player => {
                  const isSelected = playerId === player.id;
                  let classes = "w-full flex items-center justify-center px-4 py-2 rounded font-medium border border-[#C2B56B] bg-zinc-900 transition-colors";
                  if (isSelected) {
                    classes += " bg-[#C2B56B] text-black";
                  } else {
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
            )}
          </div>
        ) : (
          <EmptyCard title="Select a Team to View Their Roster" titleClassName="font-bold text-center" />
        )}
      </div>
      {/* Right: Planned Features */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
        <SectionLabel>Planned Features</SectionLabel>
        <EntityMetadataCard
          fields={[{
            label: "",
            value: (
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
            ),
            highlight: true
          }]}
          cardClassName="w-full h-full flex flex-col justify-start"
        />
      </div>
      <CreateTeamModal
        open={modalOpen}
        onClose={closeModal}
        onCreated={() => {
          const fetchData = async () => {
            const supabase = createClient();
            const { data: teamData } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
            setTeams(teamData || []);
          };
          fetchData();
        }}
      />
    </div>
  );
} 