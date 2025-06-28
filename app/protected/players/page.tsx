"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import EntityListPane from "@/components/EntityListPane";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import BulkDeleteObservationsPane from "@/components/BulkDeleteObservationsPane";
import PDPArchivePane from "@/components/PDPArchivePane";
import EmptyCard from "@/components/EmptyCard";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import EntityButton from '@/components/EntityButton';
import { NoPlayersEmptyState, NoArchivedPDPsEmptyState } from '@/components/ui/EmptyState';
import { ErrorBadge } from '@/components/StatusBadge';

// Type Definitions
interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  created_at: string;
  joined: string;
  team_id?: string;
  team_name?: string;
}

interface Pdp {
  id: string;
  content: string | null;
  created_at: string;
  start_date: string;
  player_id: string;
  archived_at: string | null;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  archived: boolean;
}

interface ArchivedPdp {
  id: string;
  dateRange: string;
  summary: string;
  observations: Observation[];
  created_at: string;
  start_date: string;
  archived_at: string;
}

interface PlayerListPdp {
  id: string;
  player_id: string;
  content: string | null;
  archived_at: string | null;
}

interface Team {
  id: string;
  name: string;
  coach_id: string;
}

export default function TestPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPdps, setAllPdps] = useState<PlayerListPdp[]>([]);
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [archivedPdps, setArchivedPdps] = useState<ArchivedPdp[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const selectedPlayer = players.find((p) => p.id === playerId);

  // Fetch teams for the current coach (copied from dashboard)
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

  const fetchPlayerData = useCallback(async () => {
    if (!playerId) {
      setCurrentPdp(null);
      setObservations([]);
      setArchivedPdps([]);
      return;
    }
    
    const supabase = createClient();

    // Fetch current PDP
    const { data: pdpData } = await supabase
      .from("pdp")
      .select("id, content, created_at, start_date, player_id, archived_at")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .maybeSingle();
    setCurrentPdp(pdpData);

    // Fetch recent observations for the player (matching dashboard behavior)
    const { data: observationsData, error: observationsError } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, player_id")
      .eq("player_id", playerId)
      .or("archived.is.null,archived.eq.false")
      .order("created_at", { ascending: false })
      .range(0, 49);
    setObservations((observationsData || []).map(obs => ({ ...obs, archived: false })));

    // Fetch archived PDPs
    const { data: archivedData } = await supabase
      .from("pdp")
      .select("id, content, created_at, start_date, archived_at")
      .eq("player_id", playerId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: sortOrder === "asc" });

    // Fetch all archived observations for this player
    const { data: archivedObsData } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, pdp_id, archived")
      .eq("player_id", playerId)
      .eq("archived", true);

    if(archivedData) {
      const processedArchived = archivedData.map(pdp => {
        const startDate = format(new Date(pdp.start_date), "MMM d, yyyy");
        const endDate = pdp.archived_at ? format(new Date(pdp.archived_at), "MMM d, yyyy") : "Present";
        // Attach observations for this PDP
        const pdpObservations = (archivedObsData || []).filter(obs => obs.pdp_id === pdp.id && obs.archived === true);
        return {
          id: pdp.id,
          dateRange: `${startDate} - ${endDate}`,
          summary: pdp.content || "No content available",
          observations: pdpObservations,
          created_at: pdp.created_at,
          start_date: pdp.start_date,
          archived_at: pdp.archived_at,
        };
      });
      setArchivedPdps(processedArchived);
    } else {
      setArchivedPdps([]);
    }
  }, [playerId, sortOrder]);

  const fetchAllData = useCallback(async () => {
    // Follow coaches page logic: admins can see all players, regular coaches need a selected team
    if (!selectedTeamId && !isAdmin) {
      setPlayers([]);
      setAllPdps([]);
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
        .select("id, player_id, content, archived_at")
        .order("created_at", { ascending: false });
      setAllPdps(allPdpsData || []);

      const { data: observationsData } = await supabase.from("observations").select("player_id");
      const counts = new Map();
      observationsData?.forEach(obs => {
        counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
      });
      
      const transformedPlayers = (playersData || []).map((player: any) => ({
        ...player,
        name: player.first_name && player.last_name ? `${player.first_name} ${player.last_name}`: player.name,
        observations: counts.get(player.id) || 0,
        joined: new Date(player.created_at).toLocaleDateString(),
        team_name: player.teams?.name || undefined,
      }));
      setPlayers(transformedPlayers);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching players');
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, isAdmin]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  const handleEdit = () => {
    // Implementation for editing player
    console.log('Edit player:', selectedPlayer?.id);
  };

  const handleDelete = () => {
    // Implementation for deleting player
    console.log('Delete player:', selectedPlayer?.id);
  };

  // Get players without active PDPs for styling
  const playerIdsWithPDP = new Set(
    allPdps
      .filter(pdp => !pdp.archived_at)
      .map(pdp => pdp.player_id)
  );

  // Custom render function for player items with PDP status (copied from dashboard)
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

  // Team filter for player list (copied from dashboard)
  const teamOptions = [
    { id: null, name: 'All Teams' },
    ...teams.map(t => ({ id: t.id, name: t.name }))
  ];

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
        <span className="text-zinc-400">Loading players...</span>
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
            <span className="text-lg font-bold text-white mb-0">Archived PDPs</span>
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
              {players.length === 0 ? (
                <NoPlayersEmptyState 
                  onAddPlayer={() => {
                    console.log('Add player');
                    fetchAllData();
                  }}
                />
              ) : selectedPlayer ? (
                <>
                  <EntityMetadataCard
                    title=""
                    fields={[
                      {
                        label: "Name",
                        value: selectedPlayer.name,
                        highlight: true
                      },
                      {
                        label: "Joined",
                        value: format(new Date(selectedPlayer.joined), "MMMM do, yyyy")
                      },
                      ...(selectedPlayer.team_name ? [{
                        label: "Team",
                        value: (
                          <Link 
                            href={`/protected/teams?playerId=${selectedPlayer.id}`}
                            className="text-[#C2B56B] hover:text-[#C2B56B]/80 underline transition-colors"
                          >
                            {selectedPlayer.team_name}
                          </Link>
                        )
                      }] : [])
                    ]}
                    actions={null}
                    cardClassName="mt-0"
                  />
                  <EntityMetadataCard
                    title="Development Plan"
                    fields={[
                      { label: "Started", value: currentPdp?.created_at ? format(new Date(currentPdp.created_at), "MMMM do, yyyy") : "—" },
                      { label: "Plan", value: currentPdp?.content || "No active plan." }
                    ]}
                    actions={null}
                    cardClassName="mt-0"
                  />
                  <BulkDeleteObservationsPane
                    observations={observations}
                    showCheckboxes={false}
                  />
                  <div className="flex gap-1">
                    <EntityButton color="gold" onClick={handleEdit}>
                      Edit Player
                    </EntityButton>
                    <EntityButton color="danger" onClick={handleDelete}>
                      Delete Player
                    </EntityButton>
                  </div>
                </>
              ) : (
                <EmptyCard title="Welcome to Players" titleClassName="font-bold text-center" />
              )}
            </div>
          </div>
          {/* Right: Archived PDPs */}
          <div className="flex-1 min-w-0">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mt-0">
              {players.length === 0 ? (
                <NoArchivedPDPsEmptyState />
              ) : (
                <PDPArchivePane
                  pdps={archivedPdps}
                  onSortOrderChange={setSortOrder}
                  sortOrder={sortOrder}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 