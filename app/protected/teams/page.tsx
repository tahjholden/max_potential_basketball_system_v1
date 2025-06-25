"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import DeleteButton from '@/components/DeleteButton';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  coach_id: string;
  created_at: string;
  updated_at: string;
  player_count?: number;
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

interface EditTeamModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  team: Team | null;
}

function EditTeamModal({ open, onClose, onUpdated, team }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setName(team.name);
    }
  }, [team]);

  const handleUpdate = async () => {
    if (!name.trim() || !team) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from("teams")
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', team.id);

      if (updateError) {
        setError(`Failed to update team: ${updateError.message}`);
      } else {
        toast.success(`Team updated to "${name.trim()}"`);
        onUpdated();
        onClose();
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !team) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Edit Team</h2>
        
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
              onClick={handleUpdate}
              disabled={!name.trim() || loading}
            >
              {loading ? "Updating..." : "Update Team"}
            </GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage({ coachId }: { coachId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
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

      // Get teams for this coach with player counts
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          coach_id,
          created_at,
          updated_at,
          players(id)
        `)
        .eq('coach_id', coachData.id);

      if (teamsError) {
        // If teams access is denied, try a simpler query without joins
        console.warn('Teams access denied with joins, trying simple query:', teamsError.message);
        
        const { data: simpleTeamsData, error: simpleTeamsError } = await supabase
          .from('teams')
          .select('id, name, coach_id, created_at, updated_at')
          .eq('coach_id', coachData.id);

        if (simpleTeamsError) {
          console.warn('Simple teams query also failed:', simpleTeamsError.message);
          setError("Unable to access teams. Please check your permissions or create teams manually.");
          return;
        }

        // Transform data without player counts
        const transformedTeams: Team[] = (simpleTeamsData || []).map((team: any) => ({
          id: team.id,
          name: team.name,
          coach_id: team.coach_id,
          created_at: team.created_at,
          updated_at: team.updated_at,
          player_count: 0, // Default to 0 since we can't get the count
        }));

        setTeams(transformedTeams);
        setError(null);
        return;
      }

      // Transform data to include player counts
      const transformedTeams: Team[] = (teamsData || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        coach_id: team.coach_id,
        created_at: team.created_at,
        updated_at: team.updated_at,
        player_count: team.players?.length || 0,
      }));

      setTeams(transformedTeams);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      const supabase = createClient();
      
      // Check if team has players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', teamId);

      if (playersError) {
        toast.error(`Error checking team players: ${playersError.message}`);
        return;
      }

      if (players && players.length > 0) {
        toast.error(`Cannot delete team "${teamName}" - it has ${players.length} player(s). Please reassign or delete players first.`);
        return;
      }

      // Delete the team
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (deleteError) {
        toast.error(`Failed to delete team: ${deleteError.message}`);
      } else {
        toast.success(`Team "${teamName}" deleted successfully`);
        fetchTeams();
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Teams</h1>
        <div className="flex items-center justify-center h-full text-zinc-500">
          Loading teams...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Teams</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading teams: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Teams</h1>
        <GoldButton onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </GoldButton>
      </div>

      {teams.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No teams found</h3>
          <p className="text-zinc-500 mb-4">
            Create your first team to start organizing players.
          </p>
          <GoldButton onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Team
          </GoldButton>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                  <p className="text-sm text-zinc-500">
                    {team.player_count} player{team.player_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTeam(team)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DeleteButton
                    onConfirm={() => handleDeleteTeam(team.id, team.name)}
                    entity="Team"
                    description={`This will permanently delete the team "${team.name}". This action cannot be undone.`}
                    iconOnly={true}
                    label="Delete Team"
                    confirmText={team.name}
                  />
                </div>
              </div>
              
              <div className="text-xs text-zinc-600">
                Created: {new Date(team.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTeamModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchTeams}
      />

      <EditTeamModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdated={fetchTeams}
        team={selectedTeam}
      />
    </div>
  );
} 