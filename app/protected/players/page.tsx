"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import EntityListPane from "@/components/EntityListPane";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import BulkDeleteObservationsPane from "@/components/BulkDeleteObservationsPane";
import PDPArchivePane from "@/components/PDPArchivePane";
import { NoPlayersEmptyState, NoArchivedPDPsEmptyState } from '@/components/ui/EmptyState';
import { ErrorBadge } from '@/components/StatusBadge';
import SectionLabel from "@/components/SectionLabel";
import PaneTitle from "@/components/PaneTitle";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import AddObservationButton from "@/components/AddObservationButton";
import AddObservationModal from "@/app/protected/players/AddObservationModal";
import CreatePDPModal from "@/components/CreatePDPModal";
import { useSelectedPlayer } from '@/stores/useSelectedPlayer';
import SharedPlayerList from "@/components/SharedPlayerList";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/card";
import { Users, FileText, Archive, Target } from "lucide-react";
import EditPlayerModal from "@/components/EditPlayerModal";
import EditPDPModal from "@/components/EditPDPModal";
import ArchiveCreateNewModal from "@/components/ArchiveCreateNewModal";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import AddPlayerModal from "@/components/AddPlayerModal";
import { Modal } from "@/components/ui/UniversalModal";
import { toast } from "sonner";
import { UniversalModal } from "@/components/ui/UniversalModal";
import ArchivedPDPsList from "@/components/ArchivedPDPsList";
import EntityButton from "@/components/EntityButton";

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
  team_coach_id?: string;
  org_id?: string;
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
  const [observationRange, setObservationRange] = useState('all');
  const [observationSearch, setObservationSearch] = useState('');
  const [showAllObservations, setShowAllObservations] = useState(false);
  const MAX_OBSERVATIONS = 10;
  const [currentCoachId, setCurrentCoachId] = useState<string | null>(null);
  const [createPDPModalOpen, setCreatePDPModalOpen] = useState(false);
  const [addObservationModalOpen, setAddObservationModalOpen] = useState(false);
  const [editPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
  const [editPDPModalOpen, setEditPDPModalOpen] = useState(false);
  const [archivePDPModalOpen, setArchivePDPModalOpen] = useState(false);
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [newPlanText, setNewPlanText] = useState("");
  const [archiveLoading, setArchiveLoading] = useState(false);
  
  const selectedPlayer = players.find((p) => p.id === playerId);
  const searchParams = useSearchParams();

  // Fetch teams for the current coach (copied from dashboard)
  useEffect(() => {
    async function fetchTeams() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError("User not authenticated.");
          return;
        }
        // Get coach record
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id, first_name, last_name, is_admin, is_superadmin, org_id')
          .eq('auth_uid', user.id)
          .single();
        if (coachError || !coachData) {
          setError("Coach record not found.");
          return;
        }
        setIsAdmin(!!coachData.is_admin);
        const isSuperadmin = !!coachData.is_superadmin;
        const orgId = coachData.org_id;
        let teamsQuery = supabase.from('teams').select('id, name, coach_id, org_id').order('name', { ascending: true });
        if (!isSuperadmin) {
          teamsQuery = teamsQuery.eq('org_id', orgId);
        }
        const { data: teamsData, error: teamsError } = await teamsQuery;
        if (teamsError) {
          setError(`Error fetching teams: ${teamsError.message}`);
          return;
        }
        setTeams(teamsData || []);
        if (!isSuperadmin && teamsData && teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
        if (coachData && coachData.id) setCurrentCoachId(coachData.id);
      } catch (err) {
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

    // Debug: Log playerId before fetching PDP
    console.log('DEBUG: Fetching PDP for playerId:', playerId);

    // Fetch current PDP (active)
    const { data: currentPdp, error: currentPdpError } = await supabase
      .from('pdp')
      .select('id, player_id, content, created_at, start_date, end_date, archived_at, org_id')
      .eq('player_id', playerId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (currentPdpError) {
      console.error('DEBUG: Supabase current PDP error:', currentPdpError);
    }
    setCurrentPdp(currentPdp || null);

    // Fetch recent observations for the player (matching dashboard behavior)
    const { data: observationsData, error: observationsError } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, player_id")
      .eq("player_id", playerId)
      .or("archived.is.null,archived.eq.false")
      .order("created_at", { ascending: false })
      .range(0, 49);
    setObservations((observationsData || []).map((obs: any) => ({ ...obs, archived: false })));

    // Fetch archived PDPs
    const { data: archivedPdps, error: archivedPdpsError } = await supabase
      .from('pdp')
      .select('id, player_id, content, created_at, start_date, end_date, archived_at, org_id')
      .eq('player_id', playerId)
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: sortOrder === "asc" });
    if (archivedPdpsError) {
      console.error('DEBUG: Supabase archived PDPs error:', archivedPdpsError);
    }

    // Fetch all archived observations for this player
    const { data: archivedObsData } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, pdp_id, archived")
      .eq("player_id", playerId)
      .eq("archived", true);

    if (archivedPdps) {
      const processedArchived = archivedPdps.map((pdp: any) => {
        const startDate = format(new Date(pdp.start_date), "MMMM do, yyyy");
        const endDate = pdp.archived_at ? format(new Date(pdp.archived_at), "MMMM do, yyyy") : "Present";
        // Attach observations for this PDP
        const pdpObservations = (archivedObsData || []).filter((obs: any) => obs.pdp_id === pdp.id && obs.archived === true);
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
      const { data: playersData } = await supabase
        .from("players")
        .select("id, name, first_name, last_name, created_at, team_id, org_id, teams(name)")
        .order("last_name", { ascending: true });
      
      const safePlayersData = playersData || [];
      
      if (safePlayersData.length === 0) throw new Error("No players found");

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
      
      // Get all PDPs (active and archived) with org filtering
      let allPdpsQuery = supabase
        .from("pdp")
        .select("id, player_id, content, archived_at")
        .order("created_at", { ascending: false });
      if (!isSuperadmin) {
        allPdpsQuery = allPdpsQuery.eq("org_id", orgId);
      }
      const { data: allPdpsData } = await allPdpsQuery;
      setAllPdps(allPdpsData || []);

      // Get observations with org filtering
      let observationsQuery = supabase.from("observations").select("player_id");
      if (!isSuperadmin) {
        observationsQuery = observationsQuery.eq("org_id", orgId);
      }
      const { data: observationsData } = await observationsQuery;
      const counts = new Map();
      observationsData?.forEach((obs: any) => {
        counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
      });
      
      const teamsById = new Map(teams.map((t) => [t.id, t]));
      const transformedPlayers = (safePlayersData).map((player: any) => {
        const team = player.team_id ? teamsById.get(player.team_id) : undefined;
        return {
          ...player,
          name: player.first_name && player.last_name ? `${player.first_name} ${player.last_name}`: player.name,
          observations: counts.get(player.id) || 0,
          joined: new Date(player.created_at).toLocaleDateString(),
          team_name: team?.name || undefined,
          team_coach_id: team?.coach_id || undefined,
        };
      });
      setPlayers(transformedPlayers);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching players');
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, isAdmin, teams]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  useEffect(() => {
    const playerIdParam = searchParams.get("id");
    const teamIdParam = searchParams.get("teamId");
    if (playerIdParam) setPlayerId(playerIdParam);
    if (teamIdParam) setSelectedTeamId(teamIdParam);
  }, [searchParams, setPlayerId, setSelectedTeamId]);

  const handleEditPlayer = () => setEditPlayerModalOpen(true);
  const handleEditPDP = () => setEditPDPModalOpen(true);
  const handleArchivePDP = () => setArchivePDPModalOpen(true);

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
  const filteredByRange = filterObservationsByRange(observations, observationRange);
  const filteredObservations = filterObservationsBySearch(filteredByRange, observationSearch);
  const sortedObservations = [...filteredObservations].sort((a, b) => a.content.localeCompare(b.content));
  const displayedObservations = showAllObservations ? sortedObservations : sortedObservations.slice(0, MAX_OBSERVATIONS);

  // When rendering the player list, filter by selectedTeamId (from dropdown) if present
  const filteredPlayers = selectedTeamId && selectedTeamId !== ""
    ? players.filter(p => p.team_id === selectedTeamId)
    : players;

  // Handler for team selection change
  function handleTeamChange(teamId: string | null) {
    const safeTeamId = teamId ?? "";
    setSelectedTeamId(safeTeamId);
    // Find all players on the new team
    const playersOnTeam = players.filter(p => p.team_id === safeTeamId);
    // If the current player is on the new team, keep them selected
    if (playersOnTeam.some(p => p.id === playerId)) {
      // Do nothing, keep playerId
    } else {
      setPlayerId("");
      setCurrentPdp(null);
      setArchivedPdps([]);
      setObservations([]);
    }
  }

  // Handler for archiving PDP and observations with new plan text
  const handleArchiveWithModal = async () => {
    if (!selectedPlayer || !currentPdp) {
      toast.error("Please select a player with an active PDP first");
      return;
    }
    if (!newPlanText.trim()) {
      toast.error("Please enter new plan text");
      return;
    }
    setArchiveLoading(true);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        setArchiveLoading(false);
        return;
      }
      // 1. Archive the current PDP
      const { error: pdpError } = await supabase
        .from('pdp')
        .update({ archived_at: now, updated_at: now })
        .eq('id', currentPdp.id);
      if (pdpError) {
        toast.error(`PDP archive error: ${pdpError.message}`);
        throw pdpError;
      }
      // 2. Archive all observations for this player
      const { error: obsError } = await supabase
        .from('observations')
        .update({ archived: true, updated_at: now })
        .eq('player_id', selectedPlayer.id)
        .eq('archived', false);
      if (obsError) {
        toast.error(`Observations archive error: ${obsError.message}`);
        throw obsError;
      }
      // 3. Create a new PDP with user text
      const { data: newPDP, error: createError } = await supabase
        .from('pdp')
        .insert({
          player_id: selectedPlayer.id,
          org_id: selectedPlayer.org_id,
          content: newPlanText,
          start_date: now,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      if (createError) {
        toast.error(`New PDP creation error: ${createError.message}`);
        throw createError;
      }
      toast.success("Archive and create process completed successfully");
      setArchiveModalOpen(false);
      setNewPlanText("");
      fetchPlayerData();
      fetchAllData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Archive process error: ${errorMsg}`);
    } finally {
      setArchiveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">Loading players...</span>
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
        <ErrorBadge className="p-4">
          {error}
        </ErrorBadge>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mt-2 px-6 flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Player list panel */}
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
                  onSelectTeam={handleTeamChange}
                  playerIdsWithPDP={playerIdsWithPDP}
                  showAddPlayer={false}
                />
              )}
            </Card>
          </div>
          {/* Center: Player Profile + Development Plan (wider column) */}
          <div className="flex-[2] min-w-0">
            <div className="flex flex-col gap-4 mt-0">
              <SectionLabel>Player Profile</SectionLabel>
              <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                {selectedPlayer ? (
                  <div>
                    <div className="text-lg font-bold text-[#C2B56B] mb-2">{selectedPlayer.name}</div>
                    <div className="text-sm text-zinc-400 font-medium mb-1">
                      Joined: {format(new Date(selectedPlayer.joined), "MMMM do, yyyy")}
                    </div>
                    {selectedPlayer.team_name && (
                      <div className="text-sm text-zinc-400 font-medium mb-1">
                        Team: <Link 
                          href={`/protected/teams?teamId=${selectedPlayer.team_id}`}
                          className="text-[#C2B56B] hover:text-[#C2B56B]/80 underline transition-colors"
                        >
                          {selectedPlayer.team_name}
                        </Link>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end mt-4">
                      <button
                        className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                        onClick={handleEditPlayer}
                      >
                        Edit Player
                      </button>
                      <DeletePlayerButton
                        playerId={selectedPlayer.id}
                        playerName={selectedPlayer.name}
                        triggerClassName="text-red-500 font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                        onDeleted={() => {
                          setPlayerId("");
                          fetchAllData();
                        }}
                      />
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
              <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg flex flex-col justify-between min-h-[120px] relative">
                {selectedPlayer && currentPdp ? (
                  <>
                    <div>
                      <div className="text-sm text-zinc-400 font-medium mb-1">
                        Started: {currentPdp.created_at ? format(new Date(currentPdp.created_at), "MMMM do, yyyy") : "—"}
                      </div>
                      <div className="text-base text-zinc-300 mb-2">{currentPdp.content || "No active plan."}</div>
                    </div>
                    {!currentPdp.archived_at && (
                      <div className="flex gap-4 justify-end absolute bottom-4 right-6">
                        <button
                          onClick={handleEditPDP}
                          className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                        >
                          Edit Plan
                        </button>
                        <button
                          onClick={() => setArchiveModalOpen(true)}
                          className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                        >
                          Archive Plan
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <EmptyState
                      icon={Target}
                      title={selectedPlayer ? "No Development Plan" : "Select a Player to View Development Plan"}
                      description={selectedPlayer ? "This player does not have a development plan yet." : "Pick a player from the list to see their development plan."}
                      className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                    />
                    {selectedPlayer && (
                      <EntityButton
                        color="gold"
                        onClick={() => setCreatePDPModalOpen(true)}
                      >
                        Create New
                      </EntityButton>
                    )}
                  </div>
                )}
              </Card>
              <SectionLabel>Observations</SectionLabel>
              <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                {selectedPlayer ? (
                  displayedObservations.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No Observations Yet"
                      description="This player doesn't have any observations yet."
                      className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                      action={{ label: "Add Observation", onClick: () => setAddObservationModalOpen(true), color: "gold" }}
                    />
                  ) : (
                    <>
                      {/* Header: Range selector and Add Observation button */}
                      <div className="flex items-center justify-between gap-2 mb-2">
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
                        {selectedPlayer && selectedPlayer.team_coach_id === currentCoachId && (
                          <button 
                            onClick={() => setAddObservationModalOpen(true)}
                            className="text-[#C2B56B] font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                          >
                            Add Observation
                          </button>
                        )}
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
                    </>
                  )
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="Select a Player to View Observations"
                    description="Pick a player from the list to see their observations."
                    className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                  />
                )}
              </Card>
            </div>
          </div>
          {/* Right: PDP Archive */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Development Plan Archive</SectionLabel>
            <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg flex flex-col justify-between min-h-[180px] relative">
              {selectedPlayer && selectedPlayer.id && selectedPlayer.org_id ? (
                <ArchivedPDPsList playerId={selectedPlayer.id} orgId={selectedPlayer.org_id} />
              ) : (
                <EmptyState
                  icon={Archive}
                  title="Select a Player to View Archived Plans"
                  description="Pick a player from the list to see their archived development plans."
                  className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                />
              )}
            </Card>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AddPlayerModal
        open={addPlayerModalOpen}
        onClose={() => setAddPlayerModalOpen(false)}
        onPlayerAdded={() => {
          fetchAllData();
        }}
      />
      {selectedPlayer && (
        <>
          <CreatePDPModal
            open={createPDPModalOpen}
            onClose={() => setCreatePDPModalOpen(false)}
            player={selectedPlayer}
            coachId={currentCoachId || undefined}
            onCreated={() => {
              fetchPlayerData();
              fetchAllData();
            }}
          />
          <AddObservationModal
            open={addObservationModalOpen}
            onClose={() => setAddObservationModalOpen(false)}
            player={selectedPlayer}
            onObservationAdded={() => {
              fetchPlayerData();
              fetchAllData();
            }}
          />
          <EditPlayerModal
            open={editPlayerModalOpen}
            onClose={() => setEditPlayerModalOpen(false)}
            player={selectedPlayer}
            onSuccess={() => {
              fetchPlayerData();
              fetchAllData();
            }}
          />
          {selectedPlayer && currentPdp && (
            <EditPDPModal
              open={editPDPModalOpen}
              onClose={() => setEditPDPModalOpen(false)}
              player={selectedPlayer}
              currentPdp={currentPdp}
              onSuccess={() => {
                fetchPlayerData();
                fetchAllData();
              }}
            />
          )}
          <ArchiveCreateNewModal
            playerId={selectedPlayer?.id || ""}
            open={archivePDPModalOpen}
            onClose={() => {
              setArchivePDPModalOpen(false);
              // Optionally: fetchPlayerData(); fetchAllData();
            }}
            onSuccess={() => {
              setArchivePDPModalOpen(false);
              fetchPlayerData();
              fetchAllData();
            }}
          />
          <Modal.Edit
            open={archiveModalOpen}
            onOpenChange={setArchiveModalOpen}
            title="Archive Current Development Plan"
            description="This will archive the current development plan and all of its associated observations. Enter the new plan text below. This action cannot be undone."
            onSubmit={handleArchiveWithModal}
            submitText={archiveLoading ? "Archiving..." : "Archive & Create New"}
            loading={archiveLoading}
            disabled={archiveLoading}
          >
            <textarea
              className="w-full min-h-[100px] p-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-100"
              placeholder="Enter new development plan text..."
              value={newPlanText}
              onChange={e => setNewPlanText(e.target.value)}
              disabled={archiveLoading}
            />
          </Modal.Edit>
        </>
      )}
    </div>
  );
}