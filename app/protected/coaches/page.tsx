"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import PageTitle from "@/components/PageTitle";
import EmptyCard from "@/components/EmptyCard";
import CoachListPane from "@/components/CoachListPane";
import CoachProfilePane from "@/components/CoachProfilePane";
import CoachObservationsPane from "@/components/CoachObservationsPane";
import EntityListPane from "@/components/EntityListPane";
import EntityButton from '@/components/EntityButton';
import DashboardPlayerListPane from '@/components/DashboardPlayerListPane';
import PlayerListShared from "@/components/PlayerListShared";
import SectionLabel from "@/components/SectionLabel";

// Type Definitions
interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_name?: string;
  player_id?: string;
}

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  created_at: string;
  joined: string;
  team_name?: string;
  team_id?: string;
}

interface Pdp {
  id: string;
  player_id: string;
  content: string | null;
  archived_at: string | null;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const hasSetDefaultCoach = useRef(false);
  const [observationRange, setObservationRange] = useState('all');
  const [observationSearch, setObservationSearch] = useState('');
  const [showAllObservations, setShowAllObservations] = useState(false);
  const MAX_OBSERVATIONS = 5;
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const MAX_PLAYERS = 10;
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedPlayerForObservations, setSelectedPlayerForObservations] = useState<string | null>(null);
  const [coachSearch, setCoachSearch] = useState("");
  const [showAllCoaches, setShowAllCoaches] = useState(false);
  const MAX_COACHES = 5;

  // Get current user's coach ID and set as default
  const getCurrentUserCoachId = useCallback(async () => {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("User not authenticated");
      return null;
    }

    // Get coach record for current user
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('auth_uid', user.id)
      .single();

    if (coachError || !coachData) {
      console.error("Coach record not found");
      return null;
    }

    return coachData.id;
  }, []);

  const fetchCoachData = useCallback(async () => {
    if (!selectedCoachId) {
      setSelectedCoach(null);
      setObservations([]);
      setPlayers([]);
      setTeams([]);
      return;
    }

    const supabase = createClient();

    // Find the selected coach
    const selectedCoachData = coaches.find(c => c.id === selectedCoachId);
    if (!selectedCoachData) return;
    setSelectedCoach(selectedCoachData);

    if (selectedCoachData.is_admin) {
      // Admin: fetch all teams
      const { data: allTeams } = await supabase
        .from("teams")
        .select("id, name");
      setTeams(allTeams || []);

      // Admin: fetch all players
      const { data: playersData } = await supabase
        .from("players")
        .select(`
          id,
          name,
          first_name,
          last_name,
          created_at,
          team_id
        `)
        .order("last_name", { ascending: true });

      // Get observation counts for all players
      const { data: observationsData } = await supabase
        .from("observations")
        .select("player_id")
        .or("archived.is.null,archived.eq.false")
        .range(0, 49);

      const counts = new Map();
      observationsData?.forEach((obs: any) => {
        counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
      });

      const transformedPlayers = (playersData || []).map((player: any) => ({
        ...player,
        name: player.first_name && player.last_name ? `${player.first_name} ${player.last_name}`: player.name,
        observations: counts.get(player.id) || 0,
        joined: new Date(player.created_at).toLocaleDateString(),
        team_name: allTeams?.find(t => t.id === player.team_id)?.name || undefined,
      }));
      setPlayers(transformedPlayers);

      // Admin: fetch 10 most recent observations for all players
      if (transformedPlayers.length > 0) {
        const playerIds = transformedPlayers.map(p => p.id);
        const { data: recentObsData } = await supabase
          .from("observations")
          .select(`
            id,
            content,
            observation_date,
            created_at,
            player_id
          `)
          .in("player_id", playerIds)
          .or("archived.is.null,archived.eq.false")
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentObsData) {
          // Fetch player information for these observations
          const obsPlayerIds = recentObsData.map((obs: any) => obs.player_id).filter(Boolean);
          if (obsPlayerIds.length > 0) {
            const { data: obsPlayersData } = await supabase
              .from("players")
              .select("id, name, first_name, last_name")
              .in("id", obsPlayerIds);

            const playerMap = new Map();
            obsPlayersData?.forEach((player: any) => {
              playerMap.set(player.id, player);
            });

            const transformedObservations = recentObsData.map((obs: any) => {
              const player = playerMap.get(obs.player_id);
              return {
                ...obs,
                player_name: player?.first_name && player?.last_name 
                  ? `${player.first_name} ${player.last_name}` 
                  : player?.name || 'Unknown Player'
              };
            });
            setObservations(transformedObservations);
          } else {
            setObservations([]);
          }
        } else {
          setObservations([]);
        }
      } else {
        setObservations([]);
      }
      return;
    }

    // Get the team for this coach (teams have coach_id)
    const { data: teamData } = await supabase
      .from("teams")
      .select("id, name")
      .eq("coach_id", selectedCoachId)
      .maybeSingle();

    const coachTeamId = teamData?.id;
    const coachTeamName = teamData?.name;
    setTeams(teamData ? [teamData] : []);

    // Fetch recent observations for players on this coach's team
    if (coachTeamId) {
      // First get all players on this team
      const { data: teamPlayers } = await supabase
        .from("players")
        .select("id")
        .eq("team_id", coachTeamId);

      if (teamPlayers && teamPlayers.length > 0) {
        const playerIds = teamPlayers.map((p: any) => p.id);
        // Only query observations if playerIds is not empty
        if (playerIds.length > 0) {
          // Then get observations for those players
          const { data: recentObsData } = await supabase
            .from("observations")
            .select(`
              id, 
              content, 
              observation_date, 
              created_at,
              player_id
            `)
            .in("player_id", playerIds)
            .or("archived.is.null,archived.eq.false")
            .order("created_at", { ascending: false })
            .limit(10);

          if (recentObsData) {
            // Fetch player information separately
            const { data: playersData } = await supabase
              .from("players")
              .select("id, name, first_name, last_name")
              .in("id", playerIds);

            const playerMap = new Map();
            playersData?.forEach((player: any) => {
              playerMap.set(player.id, player);
            });

            const transformedObservations = recentObsData.map((obs: any) => {
              const player = playerMap.get(obs.player_id);
              return {
                ...obs,
                player_name: player?.first_name && player?.last_name 
                  ? `${player.first_name} ${player.last_name}` 
                  : player?.name || 'Unknown Player'
              };
            });
            setObservations(transformedObservations);
          } else {
            setObservations([]);
          }
        } else {
          setObservations([]);
        }
      } else {
        setObservations([]);
      }

      // Fetch players coached by this coach (players have team_id)
      const { data: playersData } = await supabase
        .from("players")
        .select(`
          id, 
          name, 
          first_name, 
          last_name, 
          created_at,
          team_id
        `)
        .eq("team_id", coachTeamId)
        .order("last_name", { ascending: true });

      if (playersData) {
        // Get observation counts for all players
        const { data: observationsData } = await supabase
          .from("observations")
          .select("player_id")
          .or("archived.is.null,archived.eq.false")
          .range(0, 49);
        
        const counts = new Map();
        observationsData?.forEach((obs: any) => {
          counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
        });

        const transformedPlayers = playersData.map((player: any) => ({
          ...player,
          name: player.first_name && player.last_name ? `${player.first_name} ${player.last_name}`: player.name,
          observations: counts.get(player.id) || 0,
          joined: new Date(player.created_at).toLocaleDateString(),
          team_name: coachTeamName || undefined,
        }));
        setPlayers(transformedPlayers);
      }
    } else {
      setObservations([]);
      setPlayers([]);
    }
  }, [selectedCoachId, coaches]);

  const fetchAllData = useCallback(async () => {
    const supabase = createClient();
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
      const { data: coachData } = await supabase
        .from('coaches')
        .select('is_admin')
        .eq('auth_uid', user.id)
        .single();
      isAdmin = coachData?.is_admin;
    }
    // Fetch coaches
    let coachesQuery = supabase
      .from("coaches")
      .select(`
        id,
        first_name,
        last_name,
        email,
        is_admin,
        active,
        created_at
      `)
      .order("last_name", { ascending: true });
    if (!isAdmin) {
      coachesQuery = coachesQuery.eq("active", true);
    }
    const { data: coachesData, error: coachesError } = await coachesQuery;
    if (coachesError) {
      console.error("Error fetching coaches:", coachesError);
      setCoaches([]);
      return;
    }

    // Fetch team information separately (teams have coach_id)
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name, coach_id");

    // Create a map of coach_id to team_name
    const coachTeamMap = new Map();
    teamsData?.forEach((t: any) => {
      if (t.coach_id) {
        coachTeamMap.set(t.coach_id, t.name);
      }
    });

    const transformedCoaches = (coachesData || []).map((coach: any) => ({
      ...coach,
      team_name: coachTeamMap.get(coach.id) || undefined,
    }));
    setCoaches(transformedCoaches);

    // Fetch all active PDPs for the PlayerListPane
    const { data: pdpsData } = await supabase
      .from("pdp")
      .select("id, player_id, content, archived_at")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(20);
    
    setAllPdps(pdpsData || []);

    // Set default selected coach to current user (only once)
    if (!hasSetDefaultCoach.current) {
      const currentCoachId = await getCurrentUserCoachId();
      if (currentCoachId && !selectedCoachId) {
        setSelectedCoachId(currentCoachId);
        hasSetDefaultCoach.current = true;
      }
    }
  }, [getCurrentUserCoachId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchCoachData();
  }, [fetchCoachData]);

  const handleCoachSelect = (coachId: string) => {
    setSelectedCoachId(coachId);
  };

  const openCreateModal = () => {
    // Implementation of openCreateModal function
  };

  const handleEdit = () => {
    // Implementation of handleEdit function
  };

  const handleDelete = () => {
    // Implementation of handleDelete function
  };

  // Get playerIdsWithPDP for styling (all active PDPs, not filtered by team/coach)
  const playerIdsWithPDP = new Set(
    allPdps.filter((pdp) => !pdp.archived_at).map((pdp) => pdp.player_id)
  );

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
  function filterObservationsBySearch(observations: Observation[], keyword: string): Observation[] {
    if (!keyword.trim()) return observations;
    const lower = keyword.toLowerCase();
    return observations.filter(obs =>
      obs.content.toLowerCase().includes(lower) ||
      obs.observation_date.toLowerCase().includes(lower)
    );
  }
  const filteredObservations = filterObservationsBySearch(
    filterObservationsByRange(
      selectedPlayerForObservations
        ? observations.filter(obs => obs.player_id === selectedPlayerForObservations)
        : observations,
      observationRange
    ),
    observationSearch
  );
  const sortedObservations = [...filteredObservations].sort((a, b) => a.content.localeCompare(b.content));
  const displayedObservations = showAllObservations ? sortedObservations : sortedObservations.slice(0, MAX_OBSERVATIONS);

  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  const filteredPlayers = (selectedTeamId
    ? sortedPlayers.filter(p => p.team_id === selectedTeamId)
    : sortedPlayers
  ).filter(p =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase())
  );
  const displayedPlayers = showAllPlayers ? filteredPlayers : filteredPlayers.slice(0, MAX_PLAYERS);

  const sortedCoaches = [...coaches].sort((a, b) => (a.last_name + a.first_name).localeCompare(b.last_name + b.first_name));
  const filteredCoaches = sortedCoaches.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(coachSearch.toLowerCase()));
  const displayedCoaches = showAllCoaches ? filteredCoaches : filteredCoaches.slice(0, MAX_COACHES);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mt-2 px-6 flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Left: Coaches list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <SectionLabel>Coaches</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 h-96 flex flex-col">
              {/* Scrollable coach list, responsive height */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-2">
                {displayedCoaches.length === 0 ? (
                  <div className="text-zinc-500 italic text-center py-8">No coaches yet. Create one!</div>
                ) : (
                  displayedCoaches.map(coach => (
                    <button
                      key={coach.id}
                      className={
                        "w-full flex items-center justify-center rounded font-bold border-2 transition-colors px-4 py-2 mb-2 " +
                        (selectedCoachId === coach.id
                          ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                          : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B] hover:bg-[#C2B56B]/10")
                      }
                      onClick={() => handleCoachSelect(coach.id)}
                    >
                      {coach.first_name} {coach.last_name}
                    </button>
                  ))
                )}
                {filteredCoaches.length > MAX_COACHES && (
                  <div
                    className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                    onClick={() => setShowAllCoaches(!showAllCoaches)}
                    title={showAllCoaches ? "Show less" : "Show more"}
                  >
                    <div className="flex-1 border-t border-zinc-700"></div>
                    <svg className={`w-5 h-5 transition-transform ${showAllCoaches ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    <div className="flex-1 border-t border-zinc-700"></div>
                  </div>
                )}
              </div>
              {/* Search bar at the bottom - only show when chevron is needed */}
              {filteredCoaches.length > MAX_COACHES && (
                <input
                  type="text"
                  placeholder="Search coaches..."
                  value={coachSearch}
                  onChange={e => setCoachSearch(e.target.value)}
                  className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
                />
              )}
            </div>
          </div>
          {/* Center: Coach Profile and Observations */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
            {coaches.length === 0 ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Coaches Found</h3>
                  <p className="text-zinc-400 mb-4">There are no coaches in your team yet. Add your first coach to get started.</p>
                  <div className="flex gap-1">
                    <EntityButton color="gold" onClick={openCreateModal}>
                      Add Coach
                    </EntityButton>
                  </div>
                </div>
              </div>
            ) : selectedCoach ? (
              <>
                <SectionLabel>Coach Profile</SectionLabel>
                <CoachProfilePane coach={selectedCoach} />
                <SectionLabel>Observations</SectionLabel>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
                  {/* Header: Range selector */}
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
                  {/* Scrollable observation list, responsive height */}
                  <div className="flex-1 min-h-0 overflow-y-auto mb-2">
                    {observations.length === 0 ? (
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
                          <img
                            src={require('@/public/maxsM.png')}
                            alt="MP Shield"
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
                      <div className="flex flex-col gap-3 w-full">
                        {displayedObservations.map(obs => (
                          <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                            <div className="text-xs text-zinc-400 mb-1">{obs.player_name ? `${obs.player_name} — ` : ''}{obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : ''}</div>
                            <div className="text-base text-zinc-100">{obs.content}</div>
                          </div>
                        ))}
                        {filteredObservations.length > MAX_OBSERVATIONS && (
                          <div
                            className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                            onClick={() => setShowAllObservations(!showAllObservations)}
                            title={showAllObservations ? "Show less" : "Show more"}
                          >
                            <div className="flex-1 border-t border-zinc-700"></div>
                            <svg className={`w-5 h-5 transition-transform ${showAllObservations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            <div className="flex-1 border-t border-zinc-700"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Search bar at the bottom - only show when chevron is needed */}
                  {filteredObservations.length > MAX_OBSERVATIONS && (
                    <input
                      type="text"
                      placeholder="Search observations..."
                      value={observationSearch}
                      onChange={e => setObservationSearch(e.target.value)}
                      className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <EmptyCard title="Coach Profile" />
                <EmptyCard title="Observations" />
              </div>
            )}
          </div>
          {/* Right: Players list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Players</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Team filter dropdown */}
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedTeamId || ''}
                  onChange={e => setSelectedTeamId(e.target.value || "")}
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm"
                  style={{ minWidth: 120 }}
                >
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              {/* Scrollable player list, responsive height */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-2">
                {displayedPlayers.map(player => (
                  <button
                    key={player.id}
                    className={`w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2 text-center
                      ${selectedPlayerForObservations === player.id
                        ? 'bg-[#C2B56B] text-black border-[#C2B56B]'
                        : 'bg-zinc-900 text-[#C2B56B] border-[#C2B56B]'}
                    `}
                    onClick={() => setSelectedPlayerForObservations(selectedPlayerForObservations === player.id ? null : player.id)}
                  >
                    {player.name}
                  </button>
                ))}
                {filteredPlayers.length > MAX_PLAYERS && (
                  <div
                    className="flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-[#C2B56B] select-none py-1"
                    onClick={() => setShowAllPlayers(!showAllPlayers)}
                    title={showAllPlayers ? "Show less" : "Show more"}
                  >
                    <div className="flex-1 border-t border-zinc-700"></div>
                    <svg className={`w-5 h-5 transition-transform ${showAllPlayers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
        </div>
      </div>
    </div>
  );
} 