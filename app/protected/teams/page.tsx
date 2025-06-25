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
import StatusBadge from '@/components/StatusBadge';

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

  return (
    <div className="flex h-full w-full">
      {/* Left Pane: Team List */}
      <EntityListPane
        title="Teams"
        items={teams}
        selectedId={selectedTeam?.id}
        onSelect={id => setSelectedTeam(teams.find(t => t.id === id) || null)}
        actions={
          <EntityButton color="gold" onClick={openCreateModal}>
            Create Team
          </EntityButton>
        }
        searchPlaceholder="Search teams..."
      />
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

      {/* Center Pane: Team Details */}
      <div className="flex-1 p-4">
        {selectedTeam ? (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-gold-500">
                  {selectedTeam.name}
                </h2>
                <div className="flex gap-1">
                  <EntityButton color="gold" onClick={handleEdit}>
                    Edit Team
                  </EntityButton>
                  <EntityButton color="danger" onClick={handleDelete}>
                    Delete Team
                  </EntityButton>
                </div>
              </div>
              <div className="mb-2 text-gold-300">Created: {selectedTeam.created_at && format(new Date(selectedTeam.created_at), "PP")}</div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-bold text-gold-400">Coach:</div>
                  <StatusBadge
                    variant={teamCoach ? "active" : "inactive"}
                    size="sm"
                    showIcon
                  >
                    {teamCoach ? "Assigned" : "Unassigned"}
                  </StatusBadge>
                </div>
                {teamCoach ? (
                  <div className="flex items-center px-2 py-1 bg-[#C2B56B] text-black font-bold rounded text-sm">
                    <span className="w-7 h-7 bg-black/20 flex items-center justify-center rounded-full text-black font-bold mr-2">
                      {initials(teamCoach.first_name + " " + teamCoach.last_name)}
                    </span>
                    {teamCoach.first_name} {teamCoach.last_name}
                  </div>
                ) : (
                  <span className="text-zinc-500 italic">No coach assigned.</span>
                )}
              </div>
              <div>
                <div className="font-bold text-gold-400 mb-1">Players:</div>
                {teamPlayers.length === 0 ? (
                  <div className="text-zinc-500 italic">No players on this team.</div>
                ) : (
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {teamPlayers.map(player => (
                      <li key={player.id} className="text-gold-200">{player.first_name} {player.last_name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gold-300">Select a team to view details.</div>
        )}
      </div>

      {/* Right Pane: Team Info/Meta */}
      <div className="w-1/3 min-w-[280px] bg-zinc-900 border-l border-zinc-800 p-4 flex flex-col">
        {selectedTeam ? (
          <div>
            <h3 className="text-lg font-bold text-gold-400 mb-2">Team Info</h3>
            <div className="space-y-2 text-zinc-400">
              <div><span className="text-gold-400 font-medium">Team ID:</span> {selectedTeam.id}</div>
              <div><span className="text-gold-400 font-medium">Last Updated:</span> {selectedTeam.updated_at && format(new Date(selectedTeam.updated_at), "PP")}</div>
              <div><span className="text-gold-400 font-medium">Player Count:</span> {teamPlayers.length}</div>
            </div>
            {/* Placeholder for notes or upcoming features */}
            <div className="mt-8 text-zinc-600 italic">Team notes or meta coming soon…</div>
          </div>
        ) : (
          <div className="text-zinc-600 italic">Select a team to see details.</div>
        )}
      </div>
    </div>
  );
} 