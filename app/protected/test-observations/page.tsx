"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";

import ThreePaneLayout from "@/components/ThreePaneLayout";
import PlayerListPane from "@/components/PlayerListPane";
import PageTitle from "@/components/PageTitle";
import MiddlePane from "@/components/MiddlePane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import PaneTitle from "@/components/PaneTitle";
import EmptyCard from "@/components/EmptyCard";

// Define interfaces for our data structures
interface Player {
  id: string;
  name: string;
  joined: string;
  observationCount: number;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
}

interface Pdp {
  id: string;
  created_at: string;
  content: string;
}

export default function TestObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const [observations, setObservations] = useState<Observation[]>([]);
  const [activePdp, setActivePdp] = useState<Pdp | null>(null);
  const [totalObservations, setTotalObservations] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const formatDate = (date: string) => format(new Date(date), "M/dd/yyyy");

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = createClient();
    await supabase.from("observations").delete().in("id", ids);
    fetchDataForPlayer();
  };

  const handleObservationAdded = () => {
    fetchDataForPlayer();
  };

  // This callback fetches all data related to the currently selected player
  const fetchDataForPlayer = useCallback(async () => {
    if (!playerId) {
      setSelectedPlayer(null);
      setObservations([]);
      setActivePdp(null);
      return;
    }

    const player = players.find(p => p.id === playerId) || null;
    setSelectedPlayer(player);

    const supabase = createClient();
    const { data: obsData } = await supabase
      .from("observations")
      .select("id, content, observation_date")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .order("observation_date", { ascending: false });
    
    setObservations(obsData || []);

    const { data: pdpData } = await supabase
      .from("pdp")
      .select("id, created_at, content")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setActivePdp(pdpData);
  }, [playerId, players]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch players
      const { data: playersData } = await supabase
        .from("players")
        .select("id, first_name, last_name, name, created_at")
        .order("created_at", { ascending: false });

      // Fetch observation counts for each player
      const { data: observationsData } = await supabase
        .from("observations")
        .select("player_id")
        .is("archived", false);

      const observationCounts = new Map<string, number>();
      observationsData?.forEach(obs => {
        observationCounts.set(obs.player_id, (observationCounts.get(obs.player_id) || 0) + 1);
      });

      const transformedPlayers = (playersData || []).map(p => ({
        id: p.id,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.name,
        joined: p.created_at,
        observationCount: observationCounts.get(p.id) || 0,
      }));
      
      setPlayers(transformedPlayers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // This effect re-runs whenever the selected player changes
  useEffect(() => {
    fetchDataForPlayer();
  }, [fetchDataForPlayer]);

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <PageTitle>Observations</PageTitle>
      {loading ? (
        <div className="text-zinc-500 flex-1 flex items-center justify-center">Loading...</div>
      ) : (
        <ThreePaneLayout
          leftPane={
            <PlayerListPane 
              players={players.map(p => ({ id: p.id, name: p.name, observations: p.observationCount }))}
            />
          }
          centerPane={
            selectedPlayer ? (
              <MiddlePane
                player={selectedPlayer}
                observations={observations}
                pdp={activePdp}
                onDeleteMany={handleBulkDelete}
                onObservationAdded={handleObservationAdded}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <EmptyCard title="Player Profile" />
                <EmptyCard title="Recent Observations" />
                <EmptyCard title="Development Plan" />
              </div>
            )
          }
          rightPane={
            <ObservationInsightsPane
              total={totalObservations}
              playerTotal={observations.length}
            />
          }
        />
      )}
    </div>
  );
} 