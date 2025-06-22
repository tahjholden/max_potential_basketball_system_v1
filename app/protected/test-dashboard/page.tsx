"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
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
}

export default function TestDashboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPdp = async () => {
    if (!playerId) {
      setCurrentPdp(null);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pdp")
      .select("id, content, start_date")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .maybeSingle();

    if (error) {
      console.error("Error fetching PDP:", error.message);
      setCurrentPdp(null);
    } else {
      setCurrentPdp(data);
    }
  };

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch players and their observation counts
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("id, name, first_name, last_name, created_at")
          .order("last_name", { ascending: true });

        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);

        // Fetch observation counts for each player
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("player_id");

        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);

        // Count observations per player
        const observationCounts = new Map<string, number>();
        observationsData?.forEach(obs => {
          observationCounts.set(obs.player_id, (observationCounts.get(obs.player_id) || 0) + 1);
        });

        // Transform players data
        const transformedPlayers: Player[] = (playersData || []).map(player => {
          const fullName = player.first_name && player.last_name 
            ? `${player.first_name} ${player.last_name}`
            : player.name || `${player.first_name || ''} ${player.last_name || ''}`.trim();
          
          return {
            id: player.id,
            name: fullName,
            first_name: player.first_name,
            last_name: player.last_name,
            observations: observationCounts.get(player.id) || 0,
            joined: new Date(player.created_at).toLocaleDateString(),
          };
        });

        setPlayers(transformedPlayers);
        setError(null);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching players');
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  // Fetch observations when selected player changes
  useEffect(() => {
    async function fetchObservations() {
      if (!playerId) {
        setObservations([]);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at")
          .eq("player_id", playerId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw new Error(`Error fetching observations: ${error.message}`);
        setObservations(data || []);
      } catch (err) {
        console.error('Error fetching observations:', err);
        setObservations([]);
      }
    }

    fetchObservations();
  }, [playerId]);

  // Fetch active PDP for the selected player
  useEffect(() => {
    fetchPdp();
  }, [playerId]);

  const selectedPlayer = players.find((p) => p.id === playerId);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <div className="mt-2 px-6">
          <PageTitle>Dashboard</PageTitle>
          <div className="flex items-center justify-center h-64">
            <div className="text-zinc-400">Loading players...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <div className="mt-2 px-6">
          <PageTitle>Dashboard</PageTitle>
          <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
            Error loading players: {error}
          </div>
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
                  startDate={currentPdp?.start_date || null}
                  content={currentPdp?.content || 'No active plan.'}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Select a player to view their profile.
              </div>
            )
          }
          rightPane={
            <ObservationInsightsPane
              totalObservations={observations.length}
              selectedPlayerObservations={observations.length}
            />
          }
        />
      </div>
    </div>
  );
} 