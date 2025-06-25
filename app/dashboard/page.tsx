"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageTitle from "@/components/PageTitle";
import ObservationFeedPane from "@/components/ObservationFeedPane";
import PlayerListPane from "@/components/PlayerListPane";
import PlayerProfilePane from "@/components/PlayerProfilePane";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import EmptyCard from "@/components/EmptyCard";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  created_at: string;
  player_id: string;
  archived_at: string | null;
}

export default function DashboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, clearPlayerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedPlayer = players.find((p: Player) => p.id === playerId);

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
    async function fetchPlayers() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: playersData } = await supabase
          .from("players")
          .select("id, name, first_name, last_name, created_at")
          .order("last_name", { ascending: true });
        const { data: observationsData } = await supabase
          .from("observations")
          .select("player_id")
          .eq("archived", false);
        const counts = new Map<string, number>();
        observationsData?.forEach((obs: any) => {
          counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
        });
        setPlayers(
          (playersData || []).map((player: any) => ({
            ...player,
            observations: counts.get(player.id) || 0,
            joined: new Date(player.created_at).toLocaleDateString(),
          }))
        );
      } catch (err) {
        setError("Error fetching players");
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
    fetchAllPdps();
  }, []);

  useEffect(() => {
    async function fetchObs() {
      if (!playerId) return setObservations([]);
      const supabase = createClient();
      const { data } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at")
        .eq("player_id", playerId)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(5);
      setObservations(data || []);
    }
    fetchObs();
  }, [playerId]);

  useEffect(() => {
    fetchPdp();
  }, [playerId]);

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
        <PageTitle>Dashboard</PageTitle>
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
            selectedPlayer ? (
              <div className="flex flex-col gap-4">
                <PlayerMetadataCard 
                  player={{ name: selectedPlayer.name, joined: selectedPlayer.joined }} 
                  observations={observations}
                  playerId={selectedPlayer.id}
                  showDeleteButton={false}
                />
                <DevelopmentPlanCard 
                  player={selectedPlayer}
                  pdp={currentPdp}
                  showActions={false}
                  onPdpUpdate={() => {
                    // Refresh PDP data by re-fetching
                    if (playerId) {
                      fetchPdp();
                    }
                    fetchAllPdps();
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <EmptyCard title="Player Profile" />
                <EmptyCard title="Development Plan" />
              </div>
            )
          }
          rightPane={
            selectedPlayer ? (
              <ObservationFeedPane observations={observations} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full px-4 py-6">
                <h2 className="text-white font-semibold text-base mb-1">
                  Welcome to MP Player Development
                </h2>
                <p className="text-sm text-zinc-400">
                  To get started,&nbsp;
                  <span className="text-white font-medium">select a player</span> from the list
                  <br />
                  or <span className="text-white font-medium">add a new one</span>.
                </p>
              </div>
            )
          }
        />
      </div>
    </div>
  );
} 