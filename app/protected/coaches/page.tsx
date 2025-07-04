"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import CoachProfilePane from "@/components/CoachProfilePane";
import EntityButton from '@/components/EntityButton';
import SectionLabel from "@/components/SectionLabel";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import AddCoachModal from "@/components/AddCoachModal";
import DeleteButton from "@/components/DeleteButton";
import EditCoachModal from "../../../components/EditCoachModal";

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
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdminOrSuperadmin, setIsAdminOrSuperadmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editCoachOpen, setEditCoachOpen] = useState(false);
  const [deleteCoachOpen, setDeleteCoachOpen] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  // On mount, set default coach selection from query param, sessionStorage, or current user
  useEffect(() => {
    async function setDefaultCoach() {
      // 1. Check for coachId in query params
      const urlCoachId = searchParams.get("coachId");
      if (urlCoachId) {
        setSelectedCoachId(urlCoachId);
        sessionStorage.setItem("selectedCoachId", urlCoachId);
        return;
      }
      // 2. Check for coachId in sessionStorage
      const storedCoachId = sessionStorage.getItem("selectedCoachId");
      if (storedCoachId) {
        setSelectedCoachId(storedCoachId);
        return;
      }
      // 3. Default to current user's coachId
      const currentUserCoachId = await getCurrentUserCoachId();
      if (currentUserCoachId) {
        setSelectedCoachId(currentUserCoachId);
        sessionStorage.setItem("selectedCoachId", currentUserCoachId);
      }
    }
    if (!selectedCoachId && !hasSetDefaultCoach.current) {
      setDefaultCoach();
      hasSetDefaultCoach.current = true;
    }
  }, [selectedCoachId, getCurrentUserCoachId, searchParams]);

  // --- Top-level org-wide data fetch ---
  useEffect(() => {
    async function fetchOrgWideData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        let isAdmin = false;
        let isSuperadmin = false;
        let orgId = null;
        if (user) {
          const { data: coachData } = await supabase
            .from('coaches')
            .select('is_admin, is_superadmin, org_id')
            .eq('auth_uid', user.id)
            .single();
          isAdmin = coachData?.is_admin || false;
          isSuperadmin = coachData?.is_superadmin || false;
          orgId = coachData?.org_id;
        }
        setIsAdminOrSuperadmin(isAdmin || isSuperadmin);
        // Fetch coaches
        let coachesQuery = supabase
          .from("coaches")
          .select(`
            id,
            first_name,
            last_name,
            email,
            is_admin,
            is_superadmin,
            active,
            created_at,
            org_id
          `)
          .order("last_name", { ascending: true });
        if (!isSuperadmin && orgId) {
          coachesQuery = coachesQuery.eq("org_id", orgId);
        }
        if (!isAdmin && !isSuperadmin) {
          coachesQuery = coachesQuery.eq("active", true);
        }
        const { data: coachesData, error: coachesError } = await coachesQuery;
        if (coachesError) throw new Error("Error fetching coaches: " + coachesError.message);
        // Fetch teams
        let teamsQuery = supabase.from("teams").select("id, name, coach_id, org_id");
        if (!isSuperadmin && orgId) {
          teamsQuery = teamsQuery.eq("org_id", orgId);
        }
        const { data: teamsData } = await teamsQuery;
        // Fetch all PDPs (active and archived) for the org
        let pdpsQuery = supabase
          .from("pdp")
          .select("id, player_id, content, archived_at")
          .order("created_at", { ascending: false });
        if (!isSuperadmin && orgId) {
          pdpsQuery = pdpsQuery.eq("org_id", orgId);
        }
        const { data: pdpsData } = await pdpsQuery;
        setCoaches(coachesData || []);
        setTeams(teamsData || []);
        setAllPdps(pdpsData || []);
        setLoading(false);
      } catch (err: any) {
        setError("Error loading data: " + (err.message || err.toString()));
        setLoading(false);
      }
    }
    fetchOrgWideData();
  }, []);

  // --- Coach-specific data fetch ---
  useEffect(() => {
    async function fetchCoachSpecificData() {
      setLoading(true);
      setError(null);
      try {
        if (!selectedCoachId) {
          setSelectedCoach(null);
          setObservations([]);
          setPlayers([]);
          setTeams([]);
          setLoading(false);
          return;
        }
        // Find the selected coach
        const selectedCoachData = coaches.find(c => c.id === selectedCoachId);
        if (!selectedCoachData) {
          setLoading(false);
          return;
        }
        setSelectedCoach(selectedCoachData);
        const supabase = createClient();
        // Get the team for this coach (teams have coach_id)
        const { data: teamData } = await supabase
          .from("teams")
          .select("id, name")
          .eq("coach_id", selectedCoachId)
          .maybeSingle();
        const coachTeamId = teamData?.id;
        const coachTeamName = teamData?.name;
        setTeams(teamData ? [teamData] : []);
        // Fetch players and observations for this coach's team
        if (coachTeamId) {
          // Get all players on this team
          const { data: playersData } = await supabase
            .from("players")
            .select("id, name, first_name, last_name, created_at, team_id")
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
              joined: player.created_at ? format(new Date(player.created_at), "MMMM do, yyyy") : "—",
              team_name: coachTeamName || undefined,
            }));
            setPlayers(transformedPlayers);
          }
          // Fetch recent observations for players on this team
          if (playersData && playersData.length > 0) {
            const playerIds = playersData.map((p: any) => p.id);
            if (playerIds.length > 0) {
              const { data: recentObsData } = await supabase
                .from("observations")
                .select("id, content, observation_date, created_at, player_id")
                .in("player_id", playerIds)
                .or("archived.is.null,archived.eq.false")
                .order("created_at", { ascending: false })
                .limit(10);
              setObservations(recentObsData || []);
            } else {
              setObservations([]);
            }
          } else {
            setObservations([]);
          }
        } else {
          setObservations([]);
          setPlayers([]);
        }
        setLoading(false);
      } catch (err: any) {
        setError("Error loading coach data: " + (err.message || err.toString()));
        setLoading(false);
      }
    }
    fetchCoachSpecificData();
  }, [selectedCoachId, coaches]);

  const handleCoachSelect = (coachId: string) => {
    setSelectedCoachId(coachId);
    sessionStorage.setItem("selectedCoachId", coachId);
  };

  const openCreateModal = () => {
    // Implementation of openCreateModal function
  };

  const handleEdit = () => setEditCoachOpen(true);
  const handleDelete = () => setDeleteCoachOpen(true);

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

  // Only show hydration loading screen if !isHydrated
  if (!isHydrated) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">Loading coaches...</span>
          <img
            src="/maxsM.png"
            alt="MP Shield"
            width={220}
            height={120}
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

  // After hydration, always render the main UI
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mt-2 px-6 flex-1 min-h-0 flex flex-col">
        {/* Show loading spinner or error in main UI area */}
        {loading && (
          <div className="flex items-center justify-center w-full py-8">
            <span className="text-zinc-400 text-lg font-semibold">Loading data...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center w-full py-8">
            <span className="text-red-500 text-lg font-semibold">{error}</span>
          </div>
        )}
        {/* Canonical main content row: three columns, scrollable */}
        {!loading && !error && (
          <div className="flex-1 min-h-0 flex gap-6">
            {/* Left: Coaches list */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <SectionLabel>Coaches</SectionLabel>
              <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                {displayedCoaches.length === 0 ? (
                  <EmptyState
                    icon={UserCheck}
                    title="No Coaches Found"
                    description="Add your first coach to get started."
                    className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                    action={isAdminOrSuperadmin ? { label: "Add Coach", onClick: openCreateModal, color: "gold" } : undefined}
                  />
                ) : (
                  <>
                    {/* Scrollable coach list, responsive height */}
                    <div className="flex-1 min-h-0 mb-2">
                      {displayedCoaches.map(coach => (
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
                      ))}
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
                  </>
                )}
              </Card>
            </div>
            {/* Center: Coach Profile and Observations */}
            <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
              <SectionLabel>Coach Profile</SectionLabel>
              {coaches.length === 0 ? (
                <div className="flex flex-col gap-4 h-full">
                  <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                    <EmptyState
                      icon={UserCheck}
                      title="No Coaches Found"
                      description="There are no coaches in your team yet. Add your first coach to get started."
                      className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                      action={isAdminOrSuperadmin ? { label: "Add Coach", onClick: openCreateModal, color: "gold" } : undefined}
                    />
                  </Card>
                </div>
              ) : (
                <>
                  <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                    {selectedCoach ? (
                      <div>
                        <div className="text-lg font-bold text-[#C2B56B] mb-2">{selectedCoach.first_name} {selectedCoach.last_name}</div>
                        <div className="text-sm text-zinc-400 font-medium mb-1">Email: {selectedCoach.email}</div>
                        {selectedCoach.team_name && (
                          <div className="text-sm text-zinc-400 font-medium mb-1">Team: <span className="text-[#C2B56B]">{selectedCoach.team_name}</span></div>
                        )}
                        <div className="text-sm text-zinc-400 font-medium mb-1">
                          Status: <span className={selectedCoach.active ? "text-[#C2B56B] font-semibold" : "text-red-400 font-semibold"}>
                            {selectedCoach.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-400 font-medium mb-1">
                          Created: {selectedCoach.created_at ? format(new Date(selectedCoach.created_at), "MMMM do, yyyy") : "—"}
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                          {(isAdminOrSuperadmin || selectedCoach.id === currentUserId) && (
                            <EntityButton
                              color="gold"
                              onClick={handleEdit}
                              className="border-none bg-transparent px-0 py-0 shadow-none text-[#C2B56B] hover:underline"
                            >
                              Edit Coach
                            </EntityButton>
                          )}
                          {isAdminOrSuperadmin && selectedCoach.id !== currentUserId && (
                            <DeleteButton
                              onConfirm={() => {/* implement delete logic here */}}
                              entity="Coach"
                              label="Delete Coach"
                              iconOnly={false}
                              triggerClassName="text-red-500 font-semibold hover:underline bg-transparent border-none p-0 m-0 text-sm"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={UserCheck}
                        title="Select a Coach to View Their Profile"
                        description="Pick a coach from the list to see their details."
                        className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                      />
                    )}
                  </Card>
                  <SectionLabel>Observations</SectionLabel>
                  <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                    {selectedCoach ? (
                      observations.length === 0 ? (
                        <EmptyState
                          icon={FileText}
                          title="No Observations Yet"
                          description="This coach hasn't made any observations yet."
                          className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                        />
                      ) : (
                        <>
                          {/* Range selector in normal flow */}
                          <select
                            value={observationRange}
                            onChange={e => setObservationRange(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-sm shadow-lg mb-2"
                            style={{ minWidth: 120 }}
                          >
                            <option value="week">This week</option>
                            <option value="month">This month</option>
                            <option value="all">All</option>
                          </select>
                          {/* Card content (background) */}
                          <div className="flex-1 min-h-0 flex flex-col justify-center items-center">
                            <div className="flex flex-col gap-3 w-full mt-10">
                              {displayedObservations.map(obs => (
                                <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                                  <div className="text-xs text-zinc-400 mb-1">{obs.player_name ? `${obs.player_name} — ` : ''}{obs.observation_date ? format(new Date(obs.observation_date), "MMMM do, yyyy") : ''}</div>
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
                              className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm mt-2"
                            />
                          )}
                        </>
                      )
                    ) : (
                      <EmptyState
                        icon={FileText}
                        title="Select a Coach to View Their Observations"
                        description="Pick a coach from the list to see their observations."
                        className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                      />
                    )}
                  </Card>
                </>
              )}
            </div>
            {/* Right: Players list */}
            <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
              <SectionLabel>Players</SectionLabel>
              <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg">
                {displayedPlayers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No Players Found"
                    description="There are no players to display."
                    className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
                  />
                ) : (
                  <>
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
                    <div className="flex-1 min-h-0 mb-2">
                      {displayedPlayers.map(player => (
                        <button
                          key={player.id}
                          className={`w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2 text-center
                            ${selectedPlayerForObservations === player.id
                              ? 'bg-[#C2B56B] text-black border-[#C2B56B]'
                              : playerIdsWithPDP.has(player.id)
                                ? 'bg-zinc-900 text-[#C2B56B] border-[#C2B56B]'
                                : 'bg-zinc-900 text-[#A22828] border-[#A22828]'}
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
                  </>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
      <EditCoachModal
        open={editCoachOpen}
        onClose={() => setEditCoachOpen(false)}
        onCoachEdited={() => {/* implement refresh logic here */}}
        coach={selectedCoach}
      />
    </div>
  );
} 