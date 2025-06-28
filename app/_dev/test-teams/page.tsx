"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import EmptyCard from "@/components/EmptyCard";
import PaneTitle from "@/components/PaneTitle";
import { Badge as ErrorBadge } from "@/components/ui/badge";

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

export default function TestTeamsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showAllObservations, setShowAllObservations] = useState(false);
  const [observationRange, setObservationRange] = useState("week");
  const [observationSearch, setObservationSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");

  const { playerId, setPlayerId } = useSelectedPlayer();
  const selectedPlayer = players.find((p: Player) => p.id === playerId);

  const MAX_PLAYERS = 10;
  const MAX_OBSERVATIONS = 5;

  // Filter observations by range
  function filterObservationsByRange(observations: Observation[], range: string): Observation[] {
    if (range === "all") return observations;
    
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return observations.filter(obs => {
      const obsDate = new Date(obs.observation_date);
      if (range === "week") return obsDate >= startOfWeek;
      if (range === "month") return obsDate >= startOfMonth;
      return true;
    });
  }

  // Filter observations by search
  function filterObservationsBySearch(observations: Observation[], keyword: string): Observation[] {
    if (!keyword.trim()) return observations;
    return observations.filter(obs => 
      obs.content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Fetch teams and coach info
  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('User not authenticated:', userError);
          setError("User not authenticated.");
          return;
        }

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
      }
    }

    fetchObservations();
  }, [playerId]);

  // Fetch PDP for selected player
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
      }
    }

    fetchPdp();
  }, [playerId]);

  const handleCreatePDP = async () => {
    // Implementation for creating PDP
    console.log("Create PDP clicked");
  };

  const handleEditPDP = async () => {
    // Implementation for editing PDP
    console.log("Edit PDP clicked");
  };

  const renderPlayerItem = (player: any, isSelected: boolean) => {
    return (
      <button
        key={player.id}
        onClick={() => setPlayerId(player.id)}
        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
          isSelected
            ? "bg-[#C2B56B] text-black font-medium"
            : "text-zinc-300 hover:bg-zinc-800"
        }`}
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
  
  // Filter players by selected team - if no team is selected (All Teams), show all players
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  const filteredPlayers = selectedTeamId
    ? sortedPlayers.filter(p => p.team_id === selectedTeamId)
    : sortedPlayers;
  const displayedPlayers = showAllPlayers ? filteredPlayers : filteredPlayers.slice(0, MAX_PLAYERS);

  // Filter and display observations
  const filteredObservations = filterObservationsByRange(observations, observationRange);
  const searchedObservations = filterObservationsBySearch(filteredObservations, observationSearch);
  const displayedObservations = showAllObservations ? searchedObservations : searchedObservations.slice(0, MAX_OBSERVATIONS);

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <span className="text-zinc-400">Loading test teams...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <ErrorBadge className="p-4">{error}</ErrorBadge>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ fontFamily: 'Satoshi-Regular, Satoshi, sans-serif' }}>
      <div className="mt-2 px-6 flex-1 min-h-0 flex flex-col">
        {/* Canonical main content row: three columns, scrollable */}
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Left: Teams list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Teams</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Header: Team select and Add Team */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                >
                  + Create Team
                </button>
              </div>
              {/* Scrollable team list, responsive height */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-2">
                {teams.length === 0 ? (
                  <div className="text-zinc-500 italic text-center py-8">No teams yet. Create one!</div>
                ) : (
                  [...teams].sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
                    <button
                      key={team.id}
                      className={
                        "w-full flex items-center justify-center rounded font-bold border-2 transition-colors px-4 py-2 mb-2 " +
                        (team.id === selectedTeamId
                          ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                          : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
                      }
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      {team.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Center: Team Profile + Roster (wider column) */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Team Profile</SectionLabel>
            {selectedTeamId ? (
              <EntityMetadataCard
                fields={[] /* Your team metadata fields here */}
                actions={null}
                cardClassName="mt-0"
              />
            ) : (
              <EmptyCard title="Select a Team to View Their Profile" titleClassName="font-bold text-center" />
            )}

            <SectionLabel>Roster</SectionLabel>
            {selectedTeamId ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
                {/* Render roster here */}
                {/* Example: <div>Player list for selected team</div> */}
              </div>
            ) : (
              <EmptyCard title="Select a Team to View Their Roster" titleClassName="font-bold text-center" />
            )}
          </div>
          {/* Right: Coming Soon */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Coming Soon</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Your Coming Soon content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 