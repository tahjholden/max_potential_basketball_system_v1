"use client";

import { useState, useEffect } from "react";
import EntityListPane from "@/components/EntityListPane";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import { createClient } from "@/lib/supabase/client";
import CreatePDPModal from "@/components/CreatePDPModal";
import EditPDPModal from "@/components/EditPDPModal";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import { ErrorBadge } from '@/components/StatusBadge';
import EntityMetadataCard from "@/components/EntityMetadataCard";
import EmptyCard from "@/components/EmptyCard";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
  team_id?: string;
  team_name?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  created_at: string;
  player_id: string;
  archived_at: string | null;
}

interface Team {
  id: string;
  name: string;
  coach_id: string;
}

export default function DashboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [playersWithoutPDP, setPlayersWithoutPDP] = useState<string[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const selectedPlayer = players.find((p) => p.id === playerId);

  // Fetch teams for the current coach
  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createClient();
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("User not authenticated.");
          return;
        }

        console.log('Current user:', user.email, 'User ID:', user.id);

        // Get coach record
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id, first_name, last_name, is_admin')
          .eq('auth_uid', user.id)
          .single();

        if (coachError || !coachData) {
          console.error('Coach record not found for user:', user.email, 'Error:', coachError);
          setError("Coach record not found.");
          return;
        }

        console.log('Coach data:', coachData);

        setIsAdmin(!!coachData.is_admin);

        // Follow coaches page logic: admins see all teams, regular coaches see only their teams
        if (coachData.is_admin) {
          // Admin: fetch all teams
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('id, name, coach_id')
            .order('name', { ascending: true });

          console.log('Admin teams query result:', { teamsData, teamsError });

          if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            setError(`Error fetching teams: ${teamsError.message}`);
            return;
          }

          setTeams(teamsData || []);
          // Don't auto-select any team for admins - let them choose "All Teams" by default
        } else {
          // Regular coach: fetch only their teams
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('id, name, coach_id')
            .eq('coach_id', coachData.id)
            .order('name', { ascending: true });

          console.log('Coach teams query result:', { teamsData, teamsError });

          if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            setError(`Error fetching teams: ${teamsError.message}`);
            return;
          }

          setTeams(teamsData || []);
          
          // Auto-select the first team if available for regular coaches
          if (teamsData && teamsData.length > 0) {
            setSelectedTeamId(teamsData[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching teams');
      }
    }

    fetchTeams();
  }, []);

  // Fetch players and PDPs for the selected team
  useEffect(() => {
    async function fetchPlayersAndPlans() {
      // Follow coaches page logic: admins can see all players, regular coaches need a selected team
      if (!selectedTeamId && !isAdmin) {
        setPlayers([]);
        setPlayersWithoutPDP([]);
        return;
      }

      try {
        setLoading(true);
        const supabase = createClient();

        // Get players - follow coaches page logic
        let playersQuery = supabase
          .from("players")
          .select(`
            id, 
            name, 
            first_name, 
            last_name, 
            created_at, 
            team_id,
            teams!inner(name)
          `)
          .order("last_name", { ascending: true });

        if (isAdmin) {
          // Admin: fetch all players (no team filter)
          // The team filtering will be done in the UI based on selectedTeamId
        } else {
          // Regular coach: fetch only players from their selected team
          playersQuery = playersQuery.eq("team_id", selectedTeamId);
        }

        const { data: playersData, error: playersError } = await playersQuery;
        
        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);

        // Get all PDPs (active and archived)
        const { data: allPdpsData } = await supabase
          .from("pdp")
          .select("id, player_id, content, start_date, created_at, archived_at")
          .order("created_at", { ascending: false });
        setAllPdps(allPdpsData || []);

        // Get all active PDPs (not archived)
        const { data: activePdps } = await supabase
          .from("pdp")
          .select("id, player_id")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .range(0, 49);

        // Mark players with no active PDP
        const activePdpPlayerIds = new Set((activePdps ?? []).map((pdp) => pdp.player_id));
        setPlayersWithoutPDP(
          (playersData ?? []).filter((p) => !activePdpPlayerIds.has(p.id)).map((p) => p.id)
        );

        // Fetch observation counts for each player
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at, player_id")
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .range(0, 49);

        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);

        // Count observations per player
        const observationCounts = new Map<string, number>();
        observationsData?.forEach(obs => {
          observationCounts.set(obs.player_id, (observationCounts.get(obs.player_id) || 0) + 1);
        });

        // Transform players data
        const transformedPlayers: Player[] = (playersData || []).map((player: any) => {
          const fullName = player.first_name && player.last_name 
            ? `${player.first_name} ${player.last_name}`
            : player.name || `${player.first_name || ''} ${player.last_name || ''}`.trim();
          
          return {
            id: player.id,
            name: fullName,
            first_name: player.first_name,
            last_name: player.last_name,
            observations: observationCounts.get(player.id) || 0,
            joined: new Date(player.created_at).toLocaleDateString(),
            team_id: player.team_id,
            team_name: player.teams?.name || undefined,
          };
        });

        setPlayers(transformedPlayers);
        // Don't override global player selection - let the global store handle it
        setError(null);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching players');
      } finally {
        setLoading(false);
      }
    }

    fetchPlayersAndPlans();
  }, [selectedTeamId, isAdmin]);

  // Fetch observations for selected player
  useEffect(() => {
    async function fetchObservations() {
      if (!playerId) {
        setObservations([]);
        return;
      }

      try {
        const supabase = createClient();
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at, player_id")
          .eq("player_id", playerId)
          .or("archived.is.null,archived.eq.false")
          .order("created_at", { ascending: false })
          .range(0, 49);

        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);
        setObservations(observationsData || []);
      } catch (err) {
        console.error('Error fetching observations:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching observations');
      }
    }

    fetchObservations();
  }, [playerId]);

  // Fetch current PDP for selected player
  useEffect(() => {
    async function fetchPdp() {
      if (!playerId) {
        setCurrentPdp(null);
        return;
      }

      try {
        const supabase = createClient();
        const { data: pdpData, error: pdpError } = await supabase
          .from("pdp")
          .select("id, content, start_date, created_at, player_id, archived_at")
          .eq("player_id", playerId)
          .is("archived_at", null)
          .maybeSingle();

        if (pdpError) throw new Error(`Error fetching PDP: ${pdpError.message}`);
        setCurrentPdp(pdpData);
      } catch (err) {
        console.error('Error fetching PDP:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching PDP');
      }
    }

    fetchPdp();
  }, [playerId]);

  const handleCreatePDP = async () => {
    // This will be handled by the CreatePDPModal component
    setCreateModalOpen(false);
    // Refresh the data
    window.location.reload();
  };

  const handleEditPDP = async () => {
    // This will be handled by the EditPDPModal component
    setEditModalOpen(false);
    // Refresh the data
    window.location.reload();
  };

  // Get players without active PDPs for styling
  const playerIdsWithPDP = new Set(
    allPdps
      .filter(pdp => !pdp.archived_at)
      .map(pdp => pdp.player_id)
  );

  // Custom render function for player items with PDP status
  const renderPlayerItem = (player: any, isSelected: boolean) => {
    const hasNoPlan = !playerIdsWithPDP.has(player.id);
    
    const baseClasses = "w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2";

    let classes = baseClasses;
    if (hasNoPlan) {
      classes += isSelected
        ? " bg-[#A22828] text-white border-[#A22828]"
        : " bg-zinc-900 text-[#A22828] border-[#A22828]";
    } else {
      classes += isSelected
        ? " bg-[#C2B56B] text-black border-[#C2B56B]"
        : " bg-zinc-900 text-[#C2B56B] border-[#C2B56B]";
    }

    return (
      <button
        key={player.id}
        onClick={() => setPlayerId(player.id)}
        className={classes}
      >
        {player.name}
      </button>
    );
  };

  // Team filter for player list
  const teamOptions = [
    { id: null, name: 'All Teams' },
    ...teams.map(t => ({ id: t.id, name: t.name }))
  ];
  const [playerSearch, setPlayerSearch] = useState("");
  // Filter players by selected team - if no team is selected (All Teams), show all players
  const filteredPlayers = selectedTeamId
    ? players.filter(p => p.team_id === selectedTeamId)
    : players;
  const displayedPlayers = filteredPlayers.filter(p =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950 flex items-center justify-center">
        <ErrorBadge className="p-4">
          {error}
        </ErrorBadge>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950" style={{ fontFamily: 'Satoshi-Regular, Satoshi, sans-serif' }}>
      <div className="mt-2 px-6">
        {/* Header Row */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0">
              <span className="text-lg font-bold text-white">Players</span>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-lg"
                style={{ lineHeight: '1.5', verticalAlign: 'baseline' }}
              >
                + Add Player
              </button>
            </div>
          </div>
          <div className="flex-[2] min-w-0">
            <span className="text-lg font-bold text-white mb-0">Player Profile</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-lg font-bold text-white mb-0">Observations</span>
          </div>
        </div>
        {/* Content Row */}
        <div className="flex gap-6 mt-0" style={{ height: '600px' }}>
          {/* Left: Player list */}
          <div className="flex-1 min-w-0">
            <EntityListPane
              title=""
              items={displayedPlayers}
              selectedId={playerId || undefined}
              onSelect={id => setPlayerId(id)}
              actions={undefined}
              searchPlaceholder="Search players..."
              renderItem={renderPlayerItem}
              showSearch={false}
              headerActions={
                <select
                  value={selectedTeamId || ''}
                  onChange={e => setSelectedTeamId(e.target.value || null)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm ml-2"
                  style={{ minWidth: 120 }}
                >
                  {teamOptions.map(opt => (
                    <option key={opt.id || 'all'} value={opt.id || ''}>{opt.name}</option>
                  ))}
                </select>
              }
              footer={
                <input
                  type="text"
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
                />
              }
            />
          </div>
          {/* Center: Player Profile + Development Plan (wider column) */}
          <div className="flex-[2] min-w-0">
            <div className="flex flex-col gap-4 mt-0">
              {selectedPlayer ? (
                <>
                  <EntityMetadataCard
                    title=""
                    fields={[
                      { label: "Name", value: selectedPlayer.name, highlight: true },
                      { label: "Joined", value: selectedPlayer.joined },
                      ...(selectedPlayer.team_name ? [{ label: "Team", value: <span className="text-[#C2B56B]">{selectedPlayer.team_name}</span> }] : [])
                    ]}
                    actions={null}
                    cardClassName="mt-0"
                  />
                  <DevelopmentPlanCard
                    player={selectedPlayer}
                    pdp={currentPdp}
                    onPdpUpdate={() => {}}
                    showActions={true}
                  />
                </>
              ) : (
                <EmptyCard title="Welcome to Dashboard" />
              )}
            </div>
          </div>
          {/* Right: Observations Card */}
          <div className="flex-1 min-w-0">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mt-0">
              {observations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                  <span>No observations found.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {observations.map(obs => (
                    <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                      <div className="text-xs text-zinc-400 mb-1">{obs.observation_date}</div>
                      <div className="text-base text-zinc-100">{obs.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modals */}
        <CreatePDPModal
          open={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          player={selectedPlayer ? { id: selectedPlayer.id, name: selectedPlayer.name } : null}
          onCreated={handleCreatePDP}
        />
        <EditPDPModal
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          player={selectedPlayer ? { id: selectedPlayer.id, name: selectedPlayer.name } : null}
          currentPdp={currentPdp}
          onSuccess={handleEditPDP}
        />
      </div>
    </div>
  );
} 