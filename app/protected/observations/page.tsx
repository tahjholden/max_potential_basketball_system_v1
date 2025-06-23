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

// Type definitions - ensure they are consistent across components
interface Player {
  id: string;
  name: string;
  joined: string;
  observations: number; // For PlayerListPane
}

interface Observation {
  id: string;
  content: string;
  observation_date: string; // For BulkDeleteObservationsPane
  player_id: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
}

export default function ObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);

  const selectedPlayer = players.find((p) => p.id === playerId);

  // Consolidated data fetching
  useEffect(() => {
    async function fetchAllData() {
      const supabase = createClient();
      
      const { data: playersData } = await supabase.from("players").select("id, name, created_at");
      const { data: observationsData } = await supabase.from("observations").select("player_id");
      const counts = new Map();
      observationsData?.forEach(obs => {
        counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
      });
      setPlayers((playersData || []).map(p => ({ 
          ...p,
          joined: p.created_at,
          observations: counts.get(p.id) || 0 
        }))
      );
    }
    fetchAllData();
  }, []);

  useEffect(() => {
    async function fetchPlayerData() {
      if (!playerId) {
        setObservations([]);
        setCurrentPdp(null);
        return;
      }
      const supabase = createClient();
      const { data: obsData } = await supabase.from("observations").select("id, content, observation_date, player_id").eq("player_id", playerId);
      setObservations(obsData || []);

      const { data: pdpData } = await supabase.from("pdp").select("id, content, start_date").eq("player_id", playerId).is("archived_at", null).maybeSingle();
      setCurrentPdp(pdpData);
    }
    fetchPlayerData();
  }, [playerId]);

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = createClient();
    await supabase.from("observations").delete().in("id", ids);
    // Refetch observations after deletion
    const { data: obsData } = await supabase.from("observations").select("id, content, observation_date, player_id").eq("player_id", playerId);
    setObservations(obsData || []);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-white">
      <div className="p-4 px-6 border-b border-zinc-800">
        <PageTitle>Observations</PageTitle>
      </div>
      <div className="flex-1 overflow-y-hidden">
        <ThreePaneLayout
          leftPane={<PlayerListPane players={players} onSelect={() => {}} />}
          centerPane={
            selectedPlayer ? (
              <MiddlePane
                player={selectedPlayer}
                observations={observations}
                pdp={currentPdp}
                onDeleteMany={handleBulkDelete}
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
              total={observations.length}
              playerTotal={selectedPlayer ? observations.filter(o => o.player_id === selectedPlayer.id).length : 0}
            />
          }
        />
      </div>
    </div>
  );
} 