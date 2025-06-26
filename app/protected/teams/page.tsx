"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import DeleteButton from '@/components/DeleteButton';
import { toast } from 'sonner';
import { format } from "date-fns";
import EntityListPane from '@/components/EntityListPane';
import EntityButton from '@/components/EntityButton';
import { useSearchParams } from 'next/navigation';
import { useCurrentCoach } from '@/hooks/useCurrentCoach';
import ThreePaneLayout from "@/components/ThreePaneLayout";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import PageTitle from "@/components/PageTitle";
import EmptyCard from "@/components/EmptyCard";
import Link from "next/link";
import { useSelectedPlayer } from '@/stores/useSelectedPlayer';
import ComingSoonCard from '@/components/ComingSoonCard';
import { Card, CardContent } from '@/components/ui/card';
import PaneTitle from '@/components/PaneTitle';

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
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not authenticated.");
        return;
      }

      // Get coach record
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (coachError || !coachData) {
        setError("Coach record not found.");
        return;
      }

      // Create the team
      const { error: insertError } = await supabase.from("teams").insert({
        name: name.trim(),
        coach_id: coachData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        setError(`Failed to create team: ${insertError.message}`);
      } else {
        toast.success(`Team "${name.trim()}" created successfully`);
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

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <GoldButton
              onClick={handleCreate}
              disabled={!name.trim() || loading}
            >
              {loading ? "Creating..." : "Create Team"}
            </GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamsThreePane() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [teamCoach, setTeamCoach] = useState<Coach | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const { coach: currentCoach } = useCurrentCoach();
  const { playerId } = useSelectedPlayer();

  // Fetch teams, coaches, players on mount
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

  // Update teamPlayers and teamCoach when selected team changes
  useEffect(() => {
    if (!selectedTeam) {
      setTeamPlayers([]);
      setTeamCoach(null);
      return;
    }
    const fetchTeamDetails = async () => {
      const supabase = createClient();
      // Get team players
      const { data: teamPlayerList } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", selectedTeam.id);
      setTeamPlayers(teamPlayerList || []);
      // Get team coach (one-to-many relationship)
      const { data: coachData } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", selectedTeam.coach_id)
        .single();
      setTeamCoach(coachData || null);
    };
    fetchTeamDetails();
  }, [selectedTeam]);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  // Example create/edit/delete handlers
  const openCreateModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleEdit = () => {
    // Open edit modal, not implemented here for brevity
    alert("Edit team modal (not implemented)");
  };
  const handleDelete = () => {
    if (window.confirm("Delete this team? This cannot be undone.")) {
      // Call delete API (not implemented)
      alert("Delete team logic here.");
    }
  };

  // Helper: get initials for avatar
  const initials = (name: string) => (name || "")
    .split(" ")
    .map((n: string) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  // Logic to default select a team based on the coach's teams and context
  useEffect(() => {
    if (!currentCoach || teams.length === 0 || selectedTeam) return;

    // Get all teams for the current coach
    const coachTeams = teams.filter(team => team.coach_id === currentCoach.id);
    
    if (coachTeams.length === 1) {
      // If coach has only one team, select it
      setSelectedTeam(coachTeams[0]);
    } else if (coachTeams.length > 1) {
      // If coach has multiple teams, check if coming from players page
      const playerId = searchParams.get('playerId');
      if (playerId) {
        // Find the player's team
        const fetchPlayerTeam = async () => {
          const supabase = createClient();
          const { data: playerData } = await supabase
            .from('players')
            .select('team_id')
            .eq('id', playerId)
            .single();
          
          if (playerData?.team_id) {
            const playerTeam = coachTeams.find(team => team.id === playerData.team_id);
            if (playerTeam) {
              setSelectedTeam(playerTeam);
            }
          }
        };
        fetchPlayerTeam();
      }
    }
  }, [currentCoach, teams, selectedTeam, searchParams]);

  // Render team item for EntityListPane
  const renderTeamItem = (item: any, selected: boolean) => {
    const team = item as Team;
    return (
      <button
        onClick={() => setSelectedTeam(team)}
        className={
          `w-full flex items-center justify-center text-center px-4 py-2 rounded font-bold border-2 transition-colors duration-100 ` +
          (selected
            ? "bg-[#C2B56B] text-black border-[#C2B56B]"
            : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
        }
      >
        {team.name}
      </button>
    );
  };

  // Team metadata fields for EntityMetadataCard
  const getTeamMetadataFields = () => {
    if (!selectedTeam) return [];
    
    return [
      {
        label: "Name",
        value: selectedTeam.name,
        highlight: true
      },
      {
        label: "Coach",
        value: teamCoach ? `${teamCoach.first_name} ${teamCoach.last_name}` : "No coach assigned"
      },
      {
        label: "Players",
        value: `${teamPlayers.length} player${teamPlayers.length !== 1 ? 's' : ''}`
      },
      {
        label: "Created",
        value: format(new Date(selectedTeam.created_at), "MMMM do, yyyy")
      }
    ];
  };

  // Team actions for EntityMetadataCard
  const getTeamActions = () => (
    <div className="flex gap-1">
      <EntityButton color="gold" onClick={handleEdit}>
        Edit Team
      </EntityButton>
      <EntityButton color="danger" onClick={handleDelete}>
        Delete Team
      </EntityButton>
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-zinc-950" style={{ fontFamily: 'Satoshi-Regular, Satoshi, sans-serif' }}>
      <div className="mt-2 px-6">
        <div className="flex gap-6">
          {/* Header row */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0">
              <span className="text-lg font-bold text-white">Teams</span>
              <button
                onClick={openCreateModal}
                className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-lg"
                style={{ lineHeight: '1.5', verticalAlign: 'baseline' }}
              >
                + Create Team
              </button>
            </div>
          </div>
          <div className="flex-[2] min-w-0">
            <span className="text-lg font-bold text-white mb-0">Team Profile</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-lg font-bold text-white mb-0">Coming Soon</span>
          </div>
        </div>

        {/* Content row */}
        <div className="flex gap-6 mt-0">
          {/* Left: Teams list */}
          <div className="flex-1 min-w-0">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3">
              {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map((team, idx, arr) => (
                <button
                  key={team.id}
                  className={
                    "w-full flex items-center justify-center rounded font-bold border-2 transition-colors px-4 py-2 " +
                    (idx !== arr.length - 1 ? "mb-2 " : "") +
                    (team.id === selectedTeam?.id
                      ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                      : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
                  }
                  onClick={() => setSelectedTeam(team)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Center: Team Profile + Roster (wider column) */}
          <div className="flex-[2] min-w-0">
            <div className="flex flex-col gap-4 mt-0">
              {selectedTeam ? (
                <>
                  <EntityMetadataCard
                    title=""
                    fields={getTeamMetadataFields()}
                    actions={getTeamActions()}
                    cardClassName="mt-0"
                  />
                  {/* Roster header overlapping the card border */}
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-base text-white -mb-2 z-10 px-2 bg-zinc-950 w-fit">Roster</span>
                    <Card className="bg-zinc-900 border border-zinc-700 mt-0">
                      <CardContent className="p-4">
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
                                <button
                                  key={player.id}
                                  onClick={() => window.location.href = `/protected/players?id=${player.id}`}
                                  className={classes}
                                >
                                  {player.first_name} {player.last_name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 h-full">
                  <EmptyCard title="Team Profile" />
                  <EmptyCard title="Roster" />
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Coming Soon */}
          <div className="flex-1 min-w-0">
            <div className="mt-0">
              <ComingSoonCard
                features={[
                  { label: "Practice & game schedule", description: "(calendar integration)" },
                  { label: "Team attendance & participation heatmap" },
                  { label: "Announcements & team messaging" }
                ]}
                note="These features are on our roadmap and will be launching soon for all teams!"
              />
            </div>
          </div>
        </div>
        <CreateTeamModal
          open={modalOpen}
          onClose={closeModal}
          onCreated={() => {
            // Refresh teams list
            const fetchData = async () => {
              const supabase = createClient();
              const { data: teamData } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
              setTeams(teamData || []);
            };
            fetchData();
          }}
        />
      </div>
    </div>
  );
} 