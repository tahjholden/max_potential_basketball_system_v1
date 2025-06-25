"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";

import ThreePaneLayout from "@/components/ThreePaneLayout";
import EntityListPane from "@/components/EntityListPane";
import MiddlePane from "@/components/MiddlePane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import EmptyCard from "@/components/EmptyCard";
import PageTitle from "@/components/PageTitle";
import EntityButton from '@/components/EntityButton';
import StatusBadge from '@/components/StatusBadge';
import { ErrorBadge } from '@/components/StatusBadge';

// Type definitions - matching dashboard exactly
interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
  team_name?: string;
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
    const { data } = await supabase
      .from("pdp")
      .select("id, content, start_date, created_at, player_id, archived_at")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .maybeSingle();
    setCurrentPdp(data);
  };

  const fetchAllPdps = async () => {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get coach record
    const { data: coachRow } = await supabase
      .from("coaches")
      .select("id")
      .eq("auth_uid", user.id)
      .single();
    
    if (!coachRow) return;

    // Get teams for this coach
    const { data: teamCoaches } = await supabase
      .from("team_coaches")
      .select("team_id")
      .eq("coach_id", coachRow.id);
    
    const teamIds = teamCoaches?.map(tc => tc.team_id) || [];
    
    if (teamIds.length === 0) {
      setAllPdps([]);
      return;
    }

    // Get player IDs for this coach's teams
    const { data: players } = await supabase
      .from("players")
      .select("id")
      .in("team_id", teamIds);
    
    const playerIds = players?.map(p => p.id) || [];
    
    if (playerIds.length === 0) {
      setAllPdps([]);
      return;
    }

    // Fetch PDPs only for coach's players
    const { data } = await supabase
      .from("pdp")
      .select("id, content, start_date, created_at, player_id, archived_at")
      .in("player_id", playerIds);
    setAllPdps(data || []);
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
        // Fetch all active PDPs
        const { data: pdpsData } = await supabase
          .from("pdp")
          .select("id, player_id, content, archived_at, start_date")
          .is("archived_at", null);
        setAllPdps(pdpsData || []);
        // Get player IDs for filtering observations
        const playerIds = playersData?.map(p => p.id) || [];
        // Fetch observations only for these players
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at, player_id")
          .in("player_id", playerIds)
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .limit(100);
        if (observationsError) {
          console.error("Error fetching observations:", observationsError);
          setError("Error fetching observations");
          return;
        }
        const counts = new Map<string, number>();
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
        setAllObservations((observationsData || []).map(obs => ({ ...obs, archived: false })));
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
      setObservations((data || []).map(obs => ({ ...obs, archived: false })));
    }
    fetchObs();
  }, [playerId, currentPdp]);

  useEffect(() => {
    fetchPdp();
  }, [playerId]);

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
      setObservations((data || []).map(obs => ({ ...obs, archived: false })));
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
    const selectedClasses = isSelected
      ? " bg-[#C2B56B] text-black border-[#C2B56B]"
      : " bg-zinc-900 text-[#C2B56B] border-[#C2B56B]";

    return (
      <div key={player.id} className="space-y-1">
        <button
          onClick={() => setPlayerId(player.id)}
          className={baseClasses + selectedClasses}
        >
          {player.name}
        </button>
        <div className="flex justify-end">
          <StatusBadge
            variant={hasNoPlan ? "pdp-inactive" : "pdp-active"}
            size="sm"
            showIcon
          >
            {hasNoPlan ? "No PDP" : "Active PDP"}
          </StatusBadge>
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-2 px-6">
        <PageTitle>Observations</PageTitle>
        <ThreePaneLayout
          leftPane={
            <EntityListPane
              title="Players"
              items={players}
              selectedId={playerId || undefined}
              onSelect={id => setPlayerId(id)}
              actions={
                <EntityButton 
                  color="gold"
                  onClick={() => {
                    // This would need to be implemented to open the AddPlayerModal
                    console.log('Add player');
                    window.location.reload();
                  }}
                >
                  Add Player
                </EntityButton>
              }
              searchPlaceholder="Search players..."
              renderItem={renderPlayerItem}
            />
          }
          centerPane={
            players.length === 0 ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Players Found</h3>
                  <p className="text-zinc-400 mb-4">There are no players in your team yet. Add your first player to start tracking observations.</p>
                  <EntityButton 
                    color="gold"
                    onClick={() => {
                      console.log('Add player');
                      window.location.reload();
                    }}
                  >
                    Add Player
                  </EntityButton>
                </div>
              </div>
            ) : selectedPlayer ? (
              <MiddlePane
                player={selectedPlayer}
                observations={observations}
                pdp={currentPdp as any}
                onDeleteMany={handleBulkDelete}
              />
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <EmptyCard title="Player Profile" />
                <EmptyCard title="Development Plan" />
                <EmptyCard title="Recent Observations" />
              </div>
            )
          }
          rightPane={
            players.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">Insights</h3>
                <p className="text-zinc-400">Player insights and statistics will appear here once you add players and start tracking observations.</p>
              </div>
            ) : (
              <ObservationInsightsPane
                total={allObservations.length}
                playerTotal={selectedPlayer ? observations.filter(o => o.player_id === selectedPlayer.id).length : 0}
              />
            )
          }
        />
      </div>
    </div>
  );
} 