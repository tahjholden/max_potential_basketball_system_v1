"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import { format } from "date-fns";
import Image from "next/image";
import { Users, FileText, Target, BarChart3 } from "lucide-react";

import ThreePaneLayout from "@/components/ThreePaneLayout";
import EntityListPane from "@/components/EntityListPane";
import MiddlePane from "@/components/MiddlePane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import PageTitle from "@/components/PageTitle";
import EntityButton from '@/components/EntityButton';
import { ErrorBadge } from '@/components/StatusBadge';
import SectionLabel from "@/components/SectionLabel";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import SharedPlayerList from "@/components/SharedPlayerList";
import EmptyState from "@/components/ui/EmptyState";
import { NoTeamsEmptyState } from "@/components/ui/EmptyState";
import AddObservationModal from "@/app/protected/dashboard/AddObservationModal";
import { Card } from "@/components/ui/card";

// Type definitions - matching dashboard exactly
interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
  team_name?: string;
  team_id?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_id: string;
  archived: boolean;
}

interface Pdp {
  id: string;
  player_id: string;
  content: string | null;
  archived_at: string | null;
  start_date: string;
  created_at: string;
}

export default function ObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [allObservations, setAllObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [teams, setTeams] = useState<{ id: string | null; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [observationRange, setObservationRange] = useState('all');
  const [observationSearch, setObservationSearch] = useState('');
  const [showAllObservations, setShowAllObservations] = useState(false);
  const [addObservationOpen, setAddObservationOpen] = useState(false);
  const MAX_OBSERVATIONS = 10;

  const selectedPlayer = players.find((p) => p.id === playerId);

  console.log("Observations page state:", {
    playersCount: players.length,
    playerId,
    selectedPlayer,
    observationsCount: observations.length,
    allObservationsCount: allObservations.length
  });

  const fetchPdp = async () => {
    if (!playerId) return setCurrentPdp(null);
    const supabase = createClient();
    
    // Get current user's role and org for filtering
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: currentCoachData } = await supabase
      .from('coaches')
      .select('is_admin, is_superadmin, org_id')
      .eq('auth_uid', user.id)
      .single();
    
    const isSuperadmin = currentCoachData?.is_superadmin;
    const orgId = currentCoachData?.org_id;
    
    let pdpQuery = supabase
      .from("pdp")
      .select("id, content, start_date, created_at, player_id, archived_at")
      .eq("player_id", playerId)
      .is("archived_at", null);
    
    if (!isSuperadmin) {
      pdpQuery = pdpQuery.eq("org_id", orgId);
    }
    
    const { data } = await pdpQuery.maybeSingle();
    setCurrentPdp(data);
  };

  const fetchAllPdps = async () => {
    const supabase = createClient();
    const { data: pdpsData } = await supabase
      .from("pdp")
      .select("id, player_id, content, archived_at, start_date, created_at")
      .is("archived_at", null);
    setAllPdps((pdpsData || []).map((pdp: any) => ({
      ...pdp,
      created_at: pdp.created_at || ""
    })));
  };

  useEffect(() => {
    async function fetchPlayersAndAllObservations() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        // Fetch players with team information and observation counts (same as Players page)
        const { data: playersData, error: playersError } = await supabase
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
        if (playersError) {
          console.error("Error fetching players:", playersError);
          setError("Error fetching players");
          return;
        }
        // No need to fetch PDPs here, handled by fetchAllPdps
        // Get player IDs for filtering observations
        const playerIds = playersData?.map((p: any) => p.id) || [];
        // Fetch observations only for these players
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at, player_id")
          .in("player_id", playerIds)
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .range(0, 49);
        if (observationsError) {
          console.error("Error fetching observations:", observationsError);
          setError("Error fetching observations");
          return;
        }
        const counts = new Map<string, number>();
        observationsData?.forEach((obs: any) => {
          counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
        });
        const transformedPlayers = (playersData || []).map((p: any) => ({
          ...p,
          name: p.first_name && p.last_name ? `${p.first_name} ${p.last_name}`: p.name,
          observations: counts.get(p.id) || 0,
          joined: new Date(p.created_at).toLocaleDateString(),
          team_name: p.teams?.name || undefined,
        }));
        setPlayers(transformedPlayers);
        setAllObservations((observationsData || []).map((obs: any) => ({ ...obs, archived: false })));
      } catch (err) {
        console.error("Error in fetchPlayersAndAllObservations:", err);
        setError("Error fetching players");
      } finally {
        setLoading(false);
      }
    }
    fetchPlayersAndAllObservations();
    fetchAllPdps();
  }, []);

  useEffect(() => {
    async function fetchObs() {
      if (!playerId || !currentPdp) {
        setObservations([]);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at, player_id")
        .eq("player_id", playerId)
        .eq("pdp_id", currentPdp.id)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        console.error("Error fetching observations:", error);
      }
      console.log("Fetched observations:", data);
      setObservations((data || []).map((obs: any) => ({ ...obs, archived: false })));
    }
    fetchObs();
  }, [playerId, currentPdp]);

  useEffect(() => {
    fetchPdp();
  }, [playerId]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          return;
        }
        // Get coach record
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id, first_name, last_name, is_admin, is_superadmin, org_id')
          .eq('auth_uid', user.id)
          .single();
        if (coachError || !coachData) {
          return;
        }
        const isSuperadmin = !!coachData.is_superadmin;
        const orgId = coachData.org_id;
        let teamsQuery = supabase.from('teams').select('id, name, coach_id, org_id').order('name', { ascending: true });
        if (!isSuperadmin) {
          teamsQuery = teamsQuery.eq('org_id', orgId);
        }
        const { data: teamsData, error: teamsError } = await teamsQuery;
        if (teamsError) {
          return;
        }
        setTeams(teamsData || []);
        if (!isSuperadmin && teamsData && teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
      } catch (err) {
        // ignore errors for now
      }
    }
    fetchTeams();
  }, []);

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = createClient();
    await supabase.from("observations").delete().in("id", ids);
    // Refetch observations after deletion
    if (playerId && currentPdp) {
      const { data } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at, player_id")
        .eq("player_id", playerId)
        .eq("pdp_id", currentPdp.id)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(50);
      setObservations((data || []).map((obs: any) => ({ ...obs, archived: false })));
    }
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

  // Filter players by selected team (to match dashboard logic)
  const filteredPlayers = selectedTeamId
    ? players.filter((p) => p.team_id === selectedTeamId)
    : players;
  // Get playerIdsWithPDP for styling
  const playerIdsWithPDP = new Set(
    allPdps.filter((pdp) => !pdp.archived_at).map((pdp) => pdp.player_id)
  );

  // DEBUG LOGS
  console.log('DEBUG allPdps:', allPdps);
  console.log('DEBUG playerIdsWithPDP:', Array.from(playerIdsWithPDP));
  console.log('DEBUG players:', players);

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
  const filteredByRange = filterObservationsByRange(observations, observationRange);
  const filteredObservations = filterObservationsBySearch(filteredByRange, observationSearch);
  const sortedObservations = [...filteredObservations].sort((a, b) => a.content.localeCompare(b.content));
  const displayedObservations = showAllObservations ? sortedObservations : sortedObservations.slice(0, MAX_OBSERVATIONS);

  // AddObservationModal submit handler
  const handleAddObservation = async (content: string, observationDate: string) => {
    if (!selectedPlayer || !currentPdp) return;
    const supabase = createClient();
    // Try to get org_id from currentPdp, fallback to coach lookup if needed
    let orgId = (currentPdp as any)?.org_id;
    if (!orgId) {
      // Fallback: fetch coach org_id
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: coachData } = await supabase
          .from('coaches')
          .select('org_id')
          .eq('auth_uid', user.id)
          .single();
        orgId = coachData?.org_id;
      }
    }
    await supabase.from("observations").insert([
      {
        player_id: selectedPlayer.id,
        pdp_id: currentPdp.id,
        content,
        observation_date: observationDate,
        archived: false,
        org_id: orgId || null,
      },
    ]);
    setAddObservationOpen(false);
    // Refetch observations
    const { data } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, player_id")
      .eq("player_id", selectedPlayer.id)
      .eq("pdp_id", currentPdp.id)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .limit(50);
    setObservations((data || []).map((obs: any) => ({ ...obs, archived: false })));
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">Loading observations...</span>
          <Image
            src="/maxsM.png"
            alt="MP Shield"
            width={220}
            height={120}
            priority
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              maxWidth: "220px",
              maxHeight: "120px",
              display: "block",
              margin: "0 auto",
              filter: "drop-shadow(0 2px 12px #2226)",
              opacity: 0.75,
              transform: "scale(3)",
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mt-2 px-6 flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Left: Player list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Players</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              {filteredPlayers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Players Found"
                  description="Add your first player to get started."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                />
              ) : (
                <SharedPlayerList
                  players={filteredPlayers}
                  selectedPlayerId={playerId}
                  onSelectPlayer={setPlayerId}
                  teamOptions={teams.map(t => ({ id: t.id, name: t.name }))}
                  selectedTeamId={selectedTeamId}
                  onSelectTeam={setSelectedTeamId}
                  playerIdsWithPDP={playerIdsWithPDP}
                  showAddPlayer={false}
                />
              )}
            </Card>
          </div>
          {/* Center: Player Profile + Development Plan */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Player Profile</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              {selectedPlayer ? (
                <div>
                  <div className="text-lg font-bold text-[#C2B56B] mb-2">{selectedPlayer.name}</div>
                  <div className="text-sm text-zinc-400 font-medium mb-1">Joined: {selectedPlayer.joined}</div>
                  {selectedPlayer.team_name && (
                    <div className="text-sm text-zinc-400 font-medium mb-1">Team: {selectedPlayer.team_name}</div>
                  )}
                  <div className="flex gap-2 justify-end mt-4">
                    <button className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm">
                      Edit Player
                    </button>
                    <button className="text-red-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm">
                      Delete Player
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Select a Player to View Their Profile"
                  description="Pick a player from the list to see their details."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                />
              )}
            </Card>
            <SectionLabel>Development Plan</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              {selectedPlayer ? (
                currentPdp ? (
                  <div>
                    <div className="text-sm text-zinc-400 font-medium mb-1">
                      Started: {currentPdp.created_at ? format(new Date(currentPdp.created_at), "MMMM do, yyyy") : "—"}
                    </div>
                    <div className="text-base text-zinc-300 mb-2">{currentPdp.content || "No content available"}</div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm">
                        Edit Plan
                      </button>
                      <button className="text-red-400 font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm">
                        Archive Plan
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Target}
                    title="No Development Plan"
                    description="This player doesn't have an active development plan yet."
                    className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                    action={{ label: "Create Plan", onClick: () => {}, color: "gold" }}
                  />
                )
              ) : (
                <EmptyState
                  icon={Target}
                  title="Select a Player to View Their Development Plan"
                  description="Pick a player from the list to see their development plan."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                />
              )}
            </Card>
            <SectionLabel>Observations</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              {!selectedPlayer ? (
                <EmptyState
                  icon={FileText}
                  title="Select a Player to View Observations"
                  description="Pick a player from the list to see their observations."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                />
              ) : displayedObservations.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Observations Found"
                  description="There are no observations for this player yet."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                  action={{ label: "Add Observation", onClick: () => setAddObservationOpen(true), color: "gold" }}
                />
              ) : (
                <>
                  {/* Header: Add Observation button and Range selector */}
                  <div className="flex items-center gap-2 mb-2 justify-between">
                    <div className="flex items-center gap-2">
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
                    <button
                      className="bg-[#C2B56B] text-black font-bold rounded px-4 py-2 text-sm hover:bg-[#b3a04e] transition-colors"
                      onClick={() => setAddObservationOpen(true)}
                      disabled={!selectedPlayer || !currentPdp}
                    >
                      + Add Observation
                    </button>
                  </div>
                  {/* Scrollable observation list, responsive height */}
                  <div className="flex-1 min-h-0 mb-2">
                    <div className="flex flex-col gap-3 w-full">
                      {displayedObservations.map(obs => (
                        <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                          <div className="text-xs text-zinc-400 mb-1">{format(new Date(obs.observation_date), "MMMM do, yyyy")}</div>
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
                </>
              )}
              {/* Add Observation Modal - moved outside conditional block */}
              <AddObservationModal
                open={addObservationOpen}
                onClose={() => setAddObservationOpen(false)}
                onSubmit={handleAddObservation}
                playerId={selectedPlayer ? selectedPlayer.id : ""}
                pdpId={currentPdp ? currentPdp.id : ""}
              />
            </Card>
          </div>
          {/* Right: Insights or additional info */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Insights</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              {selectedPlayer ? (
                <div className="flex flex-col gap-4 w-full">
                  {/* Metrics Row with Card Boxes */}
                  <div className="flex flex-row gap-3 w-full justify-center">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-center flex-1 min-w-0 h-32 justify-between">
                      <div className="flex flex-col items-center w-full" style={{ minHeight: 38 }}>
                        <span className="text-zinc-400 text-xs mb-0.5 text-center w-full">Total Observations</span>
                        <span className="text-zinc-400 text-[11px] leading-tight text-center w-full">(This Week)</span>
                      </div>
                      <span className="text-2xl font-bold text-white mt-auto">{observations.filter(o => {
                        const obsDate = new Date(o.observation_date);
                        const now = new Date();
                        const weekAgo = new Date(now);
                        weekAgo.setDate(now.getDate() - 7);
                        return obsDate >= weekAgo;
                      }).length}</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col items-center flex-1 min-w-0 h-32 justify-between">
                      <div className="flex flex-col items-center w-full" style={{ minHeight: 38 }}>
                        <span className="text-zinc-400 text-xs mb-0.5 text-center w-full">Player Observations</span>
                        <span className="text-zinc-400 text-[11px] leading-tight text-center w-full invisible">(This Week)</span>
                      </div>
                      <span className="text-2xl font-bold text-white mt-auto">&nbsp;{observations.filter(o => o.player_id === selectedPlayer.id).length}</span>
                    </div>
                  </div>
                  {/* Coming Soon Features */}
                  <div className="flex flex-col items-center text-center w-full">
                    <ul className="mb-4 text-[#C2B56B] text-sm space-y-1 text-left w-full">
                      <li>• Player growth metrics</li>
                      <li>• Automated progress reports</li>
                      <li>• AI-powered feedback</li>
                      <li>• Tag trends & heatmaps</li>
                      <li>• Development plan tracking</li>
                    </ul>
                    <span className="text-white italic text-xs block mt-2 w-full">
                      These insights are coming soon. Stay tuned for advanced analytics!
                    </span>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="Select a Player to View Insights"
                  description="Pick a player from the list to see their analytics and insights."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}