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
      observationsData?.forEach(obs => {
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
          const obsPlayerIds = recentObsData.map(obs => obs.player_id).filter(Boolean);
          if (obsPlayerIds.length > 0) {
            const { data: obsPlayersData } = await supabase
              .from("players")
              .select("id, name, first_name, last_name")
              .in("id", obsPlayerIds);

            const playerMap = new Map();
            obsPlayersData?.forEach(player => {
              playerMap.set(player.id, player);
            });

            const transformedObservations = recentObsData.map(obs => {
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
        const playerIds = teamPlayers.map(p => p.id);
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
            playersData?.forEach(player => {
              playerMap.set(player.id, player);
            });

            const transformedObservations = recentObsData.map(obs => {
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
        observationsData?.forEach(obs => {
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
    
    // Fetch coaches
    const { data: coachesData, error: coachesError } = await supabase
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
      .eq("active", true)
      .order("last_name", { ascending: true });

    if (coachesError) {
      console.error("Error fetching coaches:", coachesError);
      return;
    }

    // Fetch team information separately (teams have coach_id)
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name, coach_id");

    // Create a map of coach_id to team_name
    const coachTeamMap = new Map();
    teamsData?.forEach(team => {
      if (team.coach_id) {
        coachTeamMap.set(team.coach_id, team.name);
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
        onClick={() => {
          // Handle player selection if needed
          console.log('Player selected:', player.id);
        }}
        className={classes}
      >
        {player.name}
      </button>
    );
  };

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-2 px-6">
        <PageTitle>Coaches</PageTitle>
        <ThreePaneLayout
          leftPane={
            <EntityListPane
              title="Coaches"
              items={coaches.map(coach => ({
                id: coach.id,
                name: `${coach.first_name} ${coach.last_name}`
              }))}
              selectedId={selectedCoachId || undefined}
              onSelect={handleCoachSelect}
              actions={
                <EntityButton color="gold" onClick={openCreateModal}>
                  Add Coach
                </EntityButton>
              }
              searchPlaceholder="Search coaches..."
            />
          }
          centerPane={
            coaches.length === 0 ? (
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
              <div className="flex flex-col gap-4">
                <CoachProfilePane
                  coach={selectedCoach}
                  observations={observations}
                />
                <CoachObservationsPane
                  coach={selectedCoach}
                  observations={observations}
                />
                <div className="flex gap-1">
                  <EntityButton color="gold" onClick={handleEdit}>
                    Edit Coach
                  </EntityButton>
                  <EntityButton color="danger" onClick={handleDelete}>
                    Delete Coach
                  </EntityButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <EmptyCard title="Coach Profile" />
                <EmptyCard title="Recent Observations" />
              </div>
            )
          }
          rightPane={
            coaches.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">Players</h3>
                <p className="text-zinc-400">Players will appear here once you add coaches and assign them to teams.</p>
              </div>
            ) : (
              <EntityListPane
                title="Players"
                items={players}
                actions={
                  <EntityButton 
                    color="gold"
                    onClick={() => {
                      console.log('Add player');
                      fetchAllData();
                    }}
                  >
                    Add Player
                  </EntityButton>
                }
                searchPlaceholder="Search players..."
                renderItem={renderPlayerItem}
              />
            )
          }
        />
      </div>
    </div>
  );
} 