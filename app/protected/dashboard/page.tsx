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
import SectionLabel from "@/components/SectionLabel";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import PaneTitle from '@/components/PaneTitle';

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
  const [showAllObservations, setShowAllObservations] = useState(false);
  const [observationRange, setObservationRange] = useState('all');
  const [observationSearch, setObservationSearch] = useState('');
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const MAX_PLAYERS = 10;

  const selectedPlayer = players.find((p) => p.id === playerId);

  // Helper to filter observations by range
  function filterObservationsByRange(observations: Observation[], range: string): Observation[] {
    if (range === 'all') return observations;
    const now = new Date();
    if (range === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return observations.filter((obs: Observation) => new Date(obs.observation_date) >= weekAgo);
    }
    if (range === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return observations.filter((obs: Observation) => new Date(obs.observation_date) >= monthAgo);
    }
    return observations;
  }
  // Helper to filter by search keyword
  function filterObservationsBySearch(observations: Observation[], keyword: string): Observation[] {
    if (!keyword.trim()) return observations;
    const lower = keyword.toLowerCase();
    return observations.filter(obs =>
      obs.content.toLowerCase().includes(lower) ||
      obs.observation_date.toLowerCase().includes(lower)
    );
  }
  const filteredByRange = filterObservationsByRange(observations, observationRange);
  const filteredObservations = filterObservationsBySearch(filteredByRange, observationSearch);
  const MAX_OBSERVATIONS = 5;
  // Sort observations alphabetically by content (or by date if you prefer)
  const sortedObservations = [...filteredObservations].sort((a, b) => a.content.localeCompare(b.content));
  const displayedObservations = showAllObservations ? sortedObservations : sortedObservations.slice(0, MAX_OBSERVATIONS);

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

        // Sort players alphabetically by name
        const sortedPlayers = [...transformedPlayers].sort((a, b) => a.name.localeCompare(b.name));
        setPlayers(sortedPlayers);
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
    
    const baseClasses = "w-[calc(100%-0.5rem)] text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2";

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
        className={classes + " text-center"}
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
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  const filteredPlayers = selectedTeamId
    ? sortedPlayers.filter(p => p.team_id === selectedTeamId)
    : sortedPlayers;
  const displayedPlayers = showAllPlayers ? filteredPlayers : filteredPlayers.slice(0, MAX_PLAYERS);

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
        {/* Canonical main content row: three columns, scrollable */}
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Left: Player list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Players</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Header: Team select and Add Player */}
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedTeamId || ''}
                  onChange={e => setSelectedTeamId(e.target.value || null)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm"
                  style={{ minWidth: 120 }}
                >
                  {teamOptions.map(opt => (
                    <option key={opt.id || 'all'} value={opt.id || ''}>{opt.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                >
                  + Add Player
                </button>
              </div>
              {/* Scrollable player list, responsive height */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-2">
                {displayedPlayers.map(player => renderPlayerItem(player, playerId === player.id))}
                {filteredPlayers.length > MAX_PLAYERS && (
                  <div
                    className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                    onClick={() => setShowAllPlayers(!showAllPlayers)}
                    title={showAllPlayers ? "Show less" : "Show more"}
                  >
                    <div className="flex-1 border-t border-zinc-700"></div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showAllPlayers ? 'rotate-180' : ''}`} />
                    <div className="flex-1 border-t border-zinc-700"></div>
                  </div>
                )}
              </div>
              {/* Search bar at the bottom - only show when chevron is needed */}
              {filteredPlayers.length > MAX_PLAYERS && (
                <input
                  type="text"
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
                />
              )}
            </div>
          </div>
          {/* Center: Player Profile + Development Plan (wider column) */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Player Profile</SectionLabel>
            {selectedPlayer ? (
              <EntityMetadataCard
                fields={[
                  { label: "Name", value: selectedPlayer.name, highlight: true },
                  { label: "Joined", value: format(new Date(selectedPlayer.joined), "MMMM do, yyyy") },
                  ...(selectedPlayer.team_name ? [{ label: "Team", value: <span className="text-[#C2B56B]">{selectedPlayer.team_name}</span> }] : [])
                ]}
                actions={null}
                cardClassName="mt-0"
              />
            ) : (
              <EmptyCard title="Select a Player to View Their Profile" titleClassName="font-bold text-center" />
            )}

            <SectionLabel>Development Plan</SectionLabel>
            {selectedPlayer ? (
              <EntityMetadataCard
                fields={[
                  { label: "Started", value: currentPdp?.created_at ? format(new Date(currentPdp.created_at), "MMMM do, yyyy") : "—" },
                  { label: "Plan", value: currentPdp?.content || "No active plan." }
                ]}
                actions={null}
                cardClassName="mt-0"
              />
            ) : (
              <EmptyCard title="Select a Player to View Their Development Plan" titleClassName="font-bold text-center" />
            )}
          </div>
          {/* Right: Observations Card */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <SectionLabel>Observations</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex flex-col">
              {/* Header: Range selector */}
              {selectedPlayer ? (
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={observationRange}
                    onChange={e => setObservationRange(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm"
                    style={{ minWidth: 120 }}
                  >
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                    <option value="all">All</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-center mb-2 w-full">
                  <PaneTitle className="w-full text-center">Select a Player to View Observations</PaneTitle>
                </div>
              )}
              {/* Observation list, see more chevron for overflow */}
              <div className="flex flex-col gap-3 w-full mb-2" style={{overflow: 'visible'}}>
                {!selectedPlayer || sortedObservations.length === 0 ? (
                  <div className="flex items-center justify-center w-full overflow-x-hidden h-full">
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '220px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      <Image
                        src={require('@/public/maxsM.png')}
                        alt="MP Shield"
                        priority
                        style={{
                          objectFit: 'contain',
                          width: '100%',
                          height: '100%',
                          filter: 'drop-shadow(0 2px 12px #2226)',
                          opacity: 0.75,
                          transform: 'scale(3)',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {(showAllObservations || sortedObservations.length <= 5
                      ? sortedObservations
                      : sortedObservations.slice(0, 5)
                    ).map(obs => (
                      <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                        <div className="text-xs text-zinc-400 mb-1">{format(new Date(obs.observation_date), "MMMM do, yyyy")}</div>
                        <div className="text-base text-zinc-100">{obs.content}</div>
                      </div>
                    ))}
                    {sortedObservations.length > 5 && (
                      <div
                        className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                        onClick={() => setShowAllObservations(!showAllObservations)}
                        title={showAllObservations ? "Show less" : "Show more"}
                      >
                        <div className="flex-1 border-t border-zinc-700"></div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showAllObservations ? 'rotate-180' : ''}`} />
                        <div className="flex-1 border-t border-zinc-700"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
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