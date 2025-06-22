"use client";

import { useState, useEffect, useCallback } from "react";
import PlayerListPane from "@/components/PlayerListPane";
import ObservationFeedPane from "@/components/ObservationFeedPane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import PageSubheader from "@/components/PageSubheader";
import AddObservationModal from "@/app/protected/test-players/AddObservationModal";
import { createClient } from "@/lib/supabase/client";
import ThreePaneLayout from "@/components/ThreePaneLayout";

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
}

export default function TestObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchObservationsData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const [
        { data: playersData, error: playersError },
        { data: observationsData, error: observationsError },
      ] = await Promise.all([
        supabase.from("players").select("id, name, first_name, last_name").order("last_name"),
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
        };
      });

      setPlayers(transformedPlayers);
      setObservations(observationsData || []);
      if (transformedPlayers.length > 0 && !selected) {
        setSelected(transformedPlayers[0].id);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching observations data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    fetchObservationsData();
  }, [fetchObservationsData]);

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
    if (!selected) {
      console.error("No player selected.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("observations").insert({
      player_id: selected,
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

  const selectedPlayer = players.find((p) => p.id === selected);
  const selectedPlayerObservations = observations.filter(obs => obs.player_id === selected);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Observations</h1>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Loading observations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Observations</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading observations: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-6 px-6">
        <PageSubheader
          title="Observations"
          subtitle={selectedPlayer?.name || "Select Player"}
        />

        <ThreePaneLayout
          leftPane={
            <PlayerListPane
              players={players}
              selectedId={selected || ""}
              onSelect={setSelected}
              showDeleteButton={false}
            />
          }
          centerPane={
            <ObservationFeedPane
              playerName={selectedPlayer?.name || "Select Player"}
              observations={selectedPlayerObservations}
              onDeleteMany={handleDeleteMany}
              onAddObservation={() => setAddModalOpen(true)}
              successMessage={successMessage || undefined}
            />
          }
          rightPane={
            <ObservationInsightsPane
              totalObservations={observations.length}
              selectedPlayerObservations={selectedPlayerObservations.length}
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
    </div>
  );
} 