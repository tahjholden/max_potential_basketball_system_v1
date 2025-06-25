"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";

import ThreePaneLayout from "@/components/ThreePaneLayout";
import PlayerListPane from "@/components/PlayerListPane";
import MiddlePane from "@/components/MiddlePane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import EmptyCard from "@/components/EmptyCard";
import PageTitle from "@/components/PageTitle";
import AddPlayerButton from "@/components/AddPlayerButton";

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
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  created_at: string;
  player_id: string;
  archived_at: string | null;
}

export default function ObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, clearPlayerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [allObservations, setAllObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const { data } = await supabase
      .from("pdp")
      .select("id, content, start_date, created_at, player_id, archived_at");
    setAllPdps(data || []);
  };

  useEffect(() => {
    async function fetchPlayersAndAllObservations() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select(`
            id, 
            name, 
            first_name, 
            last_name, 
            created_at,
            team_id,
            teams(name)
          `)
          .order("last_name", { ascending: true });
        
        if (playersError) {
          console.error("Error fetching players:", playersError);
          setError("Error fetching players");
          return;
        }
        
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at, player_id");
        
        if (observationsError) {
          console.error("Error fetching observations:", observationsError);
        }
        
        console.log("Fetched players:", playersData);
        console.log("Fetched observations:", observationsData);
        
        const counts = new Map<string, number>();
        observationsData?.forEach(obs => {
          counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
        });
        
        const transformedPlayers = (playersData || []).map((player: any) => ({
          ...player,
          observations: counts.get(player.id) || 0,
          joined: new Date(player.created_at).toLocaleDateString(),
          team_name: player.teams?.name || undefined,
        }));
        
        console.log("Transformed players:", transformedPlayers);
        
        setPlayers(transformedPlayers);
        setAllObservations(observationsData || []);
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
      if (!playerId) {
        console.log("No playerId selected, clearing observations");
        return setObservations([]);
      }
      console.log("Fetching observations for playerId:", playerId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at, player_id")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching observations:", error);
      }
      
      console.log("Fetched observations for player:", data);
      setObservations(data || []);
    }
    fetchObs();
  }, [playerId]);

  useEffect(() => {
    fetchPdp();
  }, [playerId]);

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = createClient();
    await supabase.from("observations").delete().in("id", ids);
    // Refetch observations after deletion
    if (playerId) {
      const { data } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at, player_id")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false });
      setObservations(data || []);
    }
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
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-2 px-6">
        <PageTitle>Observations</PageTitle>
        <ThreePaneLayout
          leftPane={
            <PlayerListPane
              players={players}
              pdps={allPdps}
              onSelect={() => {
                // Player selection is now handled by the global store
              }}
            />
          }
          centerPane={
            players.length === 0 ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Players Found</h3>
                  <p className="text-zinc-400 mb-4">There are no players in your team yet. Add your first player to start tracking observations.</p>
                  <AddPlayerButton onPlayerAdded={() => window.location.reload()} />
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