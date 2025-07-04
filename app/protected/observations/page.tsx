"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import { format } from "date-fns";
import { formatDate } from "@/lib/ui-utils";
import Image from "next/image";
import { Users, FileText, Target, BarChart3 } from "lucide-react";
import { toast } from "react-hot-toast";

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

// Import modals for player and PDP management
import EditPlayerModal from "@/components/EditPlayerModal";
import DeletePlayerModal from "@/app/protected/players/DeletePlayerModal";
import EditPDPModal from "@/components/EditPDPModal";
import ArchivePDPModal from "@/components/ArchivePDPModal";

// Import UniversalModal
import { Modal } from "@/components/ui/UniversalModal";

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
  coach_id?: string;
  created_by?: string;
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

import { useCoach } from "@/hooks/useCoach";

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
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [editObservationModalOpen, setEditObservationModalOpen] = useState(false);
  const [observationBeingEdited, setObservationBeingEdited] = useState<Observation | null>(null);
  const [editObservationContent, setEditObservationContent] = useState('');
  
  // Modal states for player and PDP management
  const [editPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
  const [deletePlayerModalOpen, setDeletePlayerModalOpen] = useState(false);
  const [editPDPModalOpen, setEditPDPModalOpen] = useState(false);
  const [archivePDPModalOpen, setArchivePDPModalOpen] = useState(false);
  
  // Add state for delete confirmation modal
  const [deleteObservation, setDeleteObservation] = useState<Observation | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const MAX_OBSERVATIONS = 5;

  const selectedPlayer = players.find((p) => p.id === playerId);

  console.log("Observations page state:", {
    playersCount: players.length,
    playerId,
    selectedPlayer,
    observationsCount: observations.length,
    allObservationsCount: allObservations.length
  });

  const { coach } = useCoach();
  const isSuperadmin = coach?.is_superadmin;

  // Team/org filter logic
  const teamOptions = isSuperadmin
    ? [{ id: null, name: "All Teams" }, ...teams.map(t => ({ id: t.id, name: t.name }))]
    : [{ id: null, name: "All Teams" }, ...teams.map(t => ({ id: t.id, name: t.name }))];

  // MVP: Filter and sort observations by search and team/org
  const mvpFilteredObservations = allObservations.filter(obs => {
    const player = players.find(p => p.id === obs.player_id);
    const teamMatch = !selectedTeamId || player?.team_id === selectedTeamId;
    const searchMatch =
      !observationSearch.trim() ||
      (player && (
        player.name.toLowerCase().includes(observationSearch.toLowerCase()) ||
        (player.team_name && player.team_name.toLowerCase().includes(observationSearch.toLowerCase()))
      )) ||
      obs.content.toLowerCase().includes(observationSearch.toLowerCase());
    return teamMatch && searchMatch;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.observation_date).getTime() - new Date(a.observation_date).getTime();
    } else {
      return new Date(a.observation_date).getTime() - new Date(b.observation_date).getTime();
    }
  });

  // Insights
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const totalThisWeek = allObservations.filter(o => new Date(o.observation_date) >= weekAgo && new Date(o.observation_date) <= now).length;
  // Calculate your observations this week
  const yourThisWeek = allObservations.filter(o => {
    const obsDate = new Date(o.observation_date);
    const isRecent = obsDate >= weekAgo && obsDate <= now;
    // Check for created_by match
    const isYours = (o.created_by && coach?.id && o.created_by === coach.id) ||
                    (o.created_by && coach?.auth_uid && o.created_by === coach.auth_uid);
    return isRecent && isYours;
  }).length;
  // Use created_at for last added
  const lastAdded = allObservations.length > 0
    ? allObservations.reduce((latest, obs) => new Date(obs.created_at) > new Date(latest.created_at) ? obs : latest, allObservations[0])
    : null;

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
          .select("id, content, observation_date, created_at, player_id, created_by")
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
        .select("id, content, observation_date, created_at, player_id, created_by")
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
    let createdBy = null;

    // Always fetch the current user and coach record for created_by
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: coachData } = await supabase
        .from('coaches')
        .select('id, auth_uid, org_id')
        .eq('auth_uid', user.id)
        .single();
      if (coachData) {
        orgId = orgId || coachData.org_id;
        createdBy = coachData.id || coachData.auth_uid;
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
        created_by: createdBy,
      },
    ]);
    setAddObservationOpen(false);
    // Refetch observations
    const { data } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, player_id, created_by")
      .eq("player_id", selectedPlayer.id)
      .eq("pdp_id", currentPdp.id)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .limit(50);
    setObservations((data || []).map((obs: any) => ({ ...obs, archived: false })));
  };

  // Player management handlers
  const handleEditPlayer = () => {
    setEditPlayerModalOpen(true);
  };

  const handleDeletePlayer = (playerId: string) => {
    const supabase = createClient();
    supabase.from("players").delete().eq("id", playerId).then(() => {
      setDeletePlayerModalOpen(false);
      setPlayerId("");
      // Refresh the page to update the player list
      window.location.reload();
    });
  };

  const handlePlayerUpdated = () => {
    setEditPlayerModalOpen(false);
    // Refresh the page to update the player list
    window.location.reload();
  };

  // PDP management handlers
  const handleEditPDP = () => {
    setEditPDPModalOpen(true);
  };

  const handleArchivePDP = () => {
    setArchivePDPModalOpen(true);
  };

  const handlePDPUpdated = () => {
    setEditPDPModalOpen(false);
    fetchPdp();
  };

  const handlePDPArchived = () => {
    setArchivePDPModalOpen(false);
    setCurrentPdp(null);
    fetchPdp();
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
          {/* Left: Search and Filter */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Search & Filter</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Search players, teams, or observations…"
                  value={observationSearch}
                  onChange={e => setObservationSearch(e.target.value)}
                  className="w-full p-2 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700"
                />
                <select
                  value={selectedTeamId || ""}
                  onChange={e => setSelectedTeamId(e.target.value || null)}
                  className="w-full p-2 rounded bg-zinc-800 text-sm text-white border border-zinc-700"
                >
                  {teamOptions.map(opt => (
                    <option key={opt.id || "all"} value={opt.id || ""}>{opt.name}</option>
                  ))}
                </select>
                {(!observationSearch && !selectedTeamId) && (
                  <div className="text-xs text-zinc-400 mt-2">Tip: Select a team or search for a player to filter observations.</div>
                )}
              </div>
            </Card>
          </div>

          {/* Center: Observations Feed */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
            {/* Header with controls */}
            <div className="flex items-center justify-between">
              <SectionLabel>Observations</SectionLabel>
              <button
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-[#C2B56B] transition-colors"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                aria-label="Toggle sort order"
              >
                <span>Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
                <svg className={`w-3 h-3 transition-transform ${sortOrder === 'newest' ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Observations Card */}
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              {mvpFilteredObservations.length === 0 ? (
                <div className="text-sm text-zinc-400">No observations found for this search/filter.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(showAllObservations ? mvpFilteredObservations : mvpFilteredObservations.slice(0, MAX_OBSERVATIONS)).map(obs => {
                    const player = players.find(p => p.id === obs.player_id);
                    return (
                      <div key={obs.id} className="bg-zinc-800 p-4 rounded flex flex-col gap-1 border border-zinc-700">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <div className="text-base font-bold text-[#C2B56B]">{player?.name || "Unknown Player"}</div>
                            {player?.team_name && (
                              <div className="text-xs text-zinc-400">{player.team_name}</div>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {formatDate(obs.observation_date, "MMM do, yyyy")}
                          </div>
                        </div>
                        <div className="text-base text-zinc-100 mb-3">{obs.content}</div>
                        {(coach?.is_admin || coach?.is_superadmin) && (
                          <div className="flex gap-2 self-end">
                            <button
                              className="text-xs text-[#C2B56B] font-semibold hover:underline"
                              onClick={() => {
                                setObservationBeingEdited(obs);
                                setEditObservationContent(obs.content);
                                setEditObservationModalOpen(true);
                              }}
                            >Edit</button>
                            <button
                              className="text-xs text-red-400 font-semibold hover:underline"
                              onClick={() => setDeleteObservation(obs)}
                            >Delete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {mvpFilteredObservations.length > MAX_OBSERVATIONS && !showAllObservations && (
                    <button
                      className="mt-2 text-xs text-[#C2B56B] font-semibold hover:underline self-center"
                      onClick={() => setShowAllObservations(true)}
                    >
                      Show More
                    </button>
                  )}
                  {showAllObservations && mvpFilteredObservations.length > MAX_OBSERVATIONS && (
                    <button
                      className="mt-2 text-xs text-[#C2B56B] font-semibold hover:underline self-center"
                      onClick={() => setShowAllObservations(false)}
                    >
                      Show Less
                    </button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right: Insights */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Insights</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span>Total (this week):</span>
                  <span className="font-bold">{totalThisWeek}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Your observations:</span>
                  <span className="font-bold">{yourThisWeek}</span>
                </div>
                {lastAdded && (
                  <div className="flex justify-between text-sm">
                    <span>Last added:</span>
                    <span>{formatDate(lastAdded.created_at, "MMMM do, yyyy")}</span>
                  </div>
                )}
                <div className="text-xs text-zinc-400 mt-2 pt-2 border-t border-zinc-700">
                  Keep logging observations to see your activity here!
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* Edit Observation Modal */}
      {editObservationModalOpen && observationBeingEdited && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-[#C2B56B]">Edit Observation</h2>
            <textarea
              className="w-full p-2 rounded bg-zinc-800 text-sm text-white border border-zinc-700 mb-4"
              rows={5}
              value={editObservationContent}
              onChange={e => setEditObservationContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                onClick={() => setEditObservationModalOpen(false)}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-[#C2B56B] text-zinc-900 font-semibold hover:bg-[#b3a14e]"
                onClick={async () => {
                  // Save changes to observation
                  const supabase = createClient();
                  await supabase
                    .from('observations')
                    .update({ content: editObservationContent })
                    .eq('id', observationBeingEdited.id);
                  // Update local state
                  setAllObservations(prev => prev.map(o => o.id === observationBeingEdited.id ? { ...o, content: editObservationContent } : o));
                  setEditObservationModalOpen(false);
                  setObservationBeingEdited(null);
                }}
                disabled={editObservationContent.trim() === ''}
              >Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteObservation && (
        <Modal.Delete
          open={!!deleteObservation}
          onOpenChange={(open) => {
            if (!open) setDeleteObservation(null);
          }}
          title="Delete Observation"
          description="Are you sure you want to delete this observation? This action cannot be undone."
          confirmText="Delete"
          loading={deleting}
          onConfirm={async () => {
            setDeleting(true);
            const supabase = createClient();
            const { error } = await supabase.from('observations').delete().eq('id', deleteObservation.id);
            setDeleting(false);
            if (error) {
              toast.error("Failed to delete observation");
            } else {
              setAllObservations(prev => prev.filter(o => o.id !== deleteObservation.id));
              toast.success("Observation deleted");
            }
            setDeleteObservation(null);
          }}
          onCancel={() => setDeleteObservation(null)}
        />
      )}
    </div>
  );
}