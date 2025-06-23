"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";

import ThreePaneLayout from "@/components/ThreePaneLayout";
import PlayerListPane from "@/components/PlayerListPane";
import PageTitle from "@/components/PageTitle";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import PaneTitle from "@/components/PaneTitle";

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
  focus_areas: string;
}

export default function TestObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId } = useSelectedPlayer();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const [observations, setObservations] = useState<Observation[]>([]);
  const [activePdp, setActivePdp] = useState<Pdp | null>(null);
  const [totalObservations, setTotalObservations] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const formatDate = (date: string) => format(new Date(date), "M/dd/yyyy");

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
      .from("pdps")
      .select("id, created_at, focus_areas")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setActivePdp(pdpData);
  }, [playerId, players]);

  // This effect runs once on initial load to fetch the player list
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const { data: playersData } = await supabase
        .from("players")
        .select("id, name, first_name, last_name, created_at")
        .order("last_name", { ascending: true });
        
      const { count: totalObsCount } = await supabase
        .from("observations")
        .select('*', { count: 'exact', head: true });

      setTotalObservations(totalObsCount || 0);

      const { data: playerObsData } = await supabase.from("observations").select("player_id");
      const observationCounts = new Map<string, number>();
      playerObsData?.forEach(obs => {
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
    };
    fetchInitialData();
  }, []);

  // This effect re-runs whenever the selected player changes
  useEffect(() => {
    fetchDataForPlayer();
  }, [fetchDataForPlayer]);

  const EmptyCard = ({ title }: { title: string }) => (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-sm">
      <PaneTitle>{title}</PaneTitle>
      <div className="flex items-center justify-center py-8">
        <img src="/maxsM.png" alt="Select a player" className="w-24 h-24 mx-auto opacity-20" />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
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
            <div className="space-y-4 h-full">
              {selectedPlayer ? (
                <>
                  <PlayerMetadataCard 
                    player={selectedPlayer}
                    observations={observations}
                  />
                  <DevelopmentPlanCard
                    startDate={activePdp?.created_at || null}
                    content={activePdp?.focus_areas || null}
                  />
                </>
              ) : (
                <>
                  <EmptyCard title="Player Profile" />
                  <EmptyCard title="Development Plan" />
                </>
              )}
            </div>
          }
          rightPane={
            <ObservationInsightsPane
              totalObservations={totalObservations}
              selectedPlayerObservations={observations.length}
            />
          }
        />
      )}
    </div>
  );
} 