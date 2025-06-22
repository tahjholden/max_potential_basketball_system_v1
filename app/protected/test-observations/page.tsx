"use client";

import { useState, useEffect, useCallback } from "react";
import PlayerListPane from "@/components/PlayerListPane";
import ObservationFeedPane from "@/components/ObservationFeedPane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import PageTitle from "@/components/PageTitle";
import AddObservationModal from "@/app/protected/test-players/AddObservationModal";
import { createClient } from "@/lib/supabase/client";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import { format } from "date-fns";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import PDPArchivePane from "@/components/PDPArchivePane";
import PaneTitle from "@/components/PaneTitle";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_id: string;
}

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined?: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  archived_at?: string;
}

export default function TestObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const { playerId } = useSelectedPlayer();
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [archivedPdps, setArchivedPdps] = useState<Pdp[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchPdp = useCallback(async () => {
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
  }, [playerId]);

  const fetchObservationsData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const [
        { data: playersData, error: playersError },
        { data: observationsData, error: observationsError },
      ] = await Promise.all([
        supabase.from("players").select("id, name, first_name, last_name, created_at").order("last_name"),
        supabase.from("observations").select(`
          id, content, observation_date, created_at, player_id
        `).order("created_at", { ascending: false }),
      ]);

      if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);
      if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);

      const observationCounts = new Map<string, number>();
      observationsData?.forEach(obs => {
        observationCounts.set(obs.player_id, (observationCounts.get(obs.player_id) || 0) + 1);
      });

      const transformedPlayers: Player[] = (playersData || []).map(player => {
        const fullName = (player.first_name && player.last_name) 
          ? `${player.first_name} ${player.last_name}` 
          : player.name;
        
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
      setObservations(observationsData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching observations data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObservationsData();
  }, [fetchObservationsData]);

  useEffect(() => {
    fetchPdp();
  }, [fetchPdp]);

  const handleDeleteMany = async (ids: string[]) => {
    const supabase = createClient();
    const { error } = await supabase.from("observations").delete().in("id", ids);

    if (error) {
      console.error("Failed to delete observations");
    } else {
      setSuccessMessage(`${ids.length} observation(s) deleted.`);
      setTimeout(() => setSuccessMessage(null), 3100);
      fetchObservationsData();
    }
  };

  const handleAddObservation = async (content: string) => {
    if (!playerId) {
      console.error("No player selected.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("observations").insert({
      player_id: playerId,
      content: content,
      observation_date: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to add observation.");
    } else {
      setSuccessMessage("Observation added successfully.");
      setTimeout(() => setSuccessMessage(null), 3100);
      await fetchObservationsData();
      setAddModalOpen(false);
    }
  };

  const handlePdpUpdate = useCallback(() => {
    fetchPdp();
  }, [fetchPdp]);

  const selectedPlayer = players.find((p) => p.id === playerId);
  const selectedPlayerObservations = observations.filter(obs => obs.player_id === playerId);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <div className="mt-2 px-6">
          <PageTitle>Observations</PageTitle>
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
          <PageTitle>Observations</PageTitle>
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
        <PageTitle>Observations</PageTitle>

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
              <div className="flex flex-col gap-4 w-full">
                {/* Player Info Header */}
                <PlayerMetadataCard 
                  player={{ name: selectedPlayer.name, joined: selectedPlayer.joined || "" }} 
                  observations={selectedPlayerObservations}
                  playerId={selectedPlayer.id}
                  showDeleteButton={false}
                />

                <hr className="my-4 border-zinc-700" />

                {/* Read-only PDP Display */}
                <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <PaneTitle>Development Plan</PaneTitle>
                  </div>
                  <div className="mt-4">
                    {currentPdp ? (
                      <div className="bg-zinc-800 p-3 rounded text-sm text-zinc-200">
                        <p className="text-xs text-zinc-500 mb-1">
                          Started {format(new Date(currentPdp.start_date), 'PPP')}
                        </p>
                        <p className="whitespace-pre-line">{currentPdp.content}</p>
                      </div>
                    ) : (
                      <div className="bg-zinc-800 p-3 rounded text-sm text-zinc-500 text-center">
                        No active plan.
                      </div>
                    )}
                  </div>
                </div>
                
                <ObservationFeedPane
                  onAddObservation={() => setAddModalOpen(true)}
                  observations={selectedPlayerObservations}
                  onDeleteMany={handleDeleteMany}
                  successMessage={successMessage || ""}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Select a player to view their observations.
              </div>
            )
          }
          rightPane={
            <PDPArchivePane
              pdps={archivedPdps}
              sortOrder={sortOrder}
              onSortOrderChange={(order: string) => setSortOrder(order as "asc" | "desc")}
            />
          }
        />
      </div>

      {selectedPlayer && (
        <AddObservationModal
          open={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          selectedPlayer={selectedPlayer}
          onSubmit={handleAddObservation}
        />
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  );
} 