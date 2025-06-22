"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import PlayerListPane from "@/components/PlayerListPane";
import PlayerObservationPane from "@/components/PlayerObservationPane";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import AddObservationModal from "./AddObservationModal";
import PageSubheader from "@/components/PageSubheader";
import PDPArchivePane from "@/components/PDPArchivePane";
import { format } from "date-fns";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import EditPDPButton from "@/components/EditPDPButton";
import ManagePDPModal from "@/components/ManagePDPModal";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import ObservationFeedPane from "@/components/ObservationFeedPane";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
}

interface Pdp {
  id: string;
  content: string | null;
  start_date: string;
  archived_at?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

interface ArchivedPdp {
  id: string;
  dateRange: string;
  summary: string;
}

export default function TestPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [archivedPdps, setArchivedPdps] = useState<ArchivedPdp[]>([]);
  const [isAddObservationModalOpen, setAddObservationModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPdp = async () => {
    if (!selectedPlayerId) {
      setCurrentPdp(null);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pdp")
      .select("id, content, start_date")
      .eq("player_id", selectedPlayerId)
      .is("archived_at", null)
      .maybeSingle();

    if (error) {
      console.error("Error fetching PDP:", error.message);
      setCurrentPdp(null);
    } else {
      setCurrentPdp(data);
    }
  };

  // Fetch observations when selected player changes
  const fetchObservations = async () => {
    if (!selectedPlayerId) {
      setObservations([]);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at")
        .eq("player_id", selectedPlayerId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw new Error(`Error fetching observations: ${error.message}`);
      setObservations(data || []);
    } catch (err) {
      console.error('Error fetching observations:', err);
      setObservations([]);
    }
  };

  const fetchArchivedPdps = async () => {
    if (!selectedPlayerId) {
      setArchivedPdps([]);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdp")
        .select("id, content, start_date, archived_at")
        .eq("player_id", selectedPlayerId)
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: sortOrder === "asc" });

      if (error) {
        console.error("Error fetching archived PDPs:", error.message);
        setArchivedPdps([]);
        return;
      }

      // Transform archived PDPs to match the interface
      const transformedPdps: ArchivedPdp[] = (data || []).map((pdp) => {
        const startDate = format(new Date(pdp.start_date), "MMM yyyy");
        const endDate = pdp.archived_at ? format(new Date(pdp.archived_at), "MMM yyyy") : "Present";
        const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
        
        return {
          id: pdp.id,
          dateRange,
          summary: pdp.content || "No content available",
        };
      });

      setArchivedPdps(transformedPdps);
    } catch (err) {
      console.error("Error fetching archived PDPs:", err);
      setArchivedPdps([]);
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
            joined: player.created_at,
          };
        });

        setPlayers(transformedPlayers);
        if (transformedPlayers.length > 0) {
          setSelectedPlayerId(transformedPlayers[0].id);
        }
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

  // Fetch active PDP for the selected player
  useEffect(() => {
    fetchPdp();
  }, [selectedPlayerId]);

  // Fetch observations when selected player changes
  useEffect(() => {
    fetchObservations();
  }, [selectedPlayerId]);

  // Fetch archived PDPs when player or sort order changes
  useEffect(() => {
    fetchArchivedPdps();
  }, [selectedPlayerId, sortOrder]);

  const handleDeleteMany = async (ids: string[]) => {
    const supabase = createClient();
    const { error } = await supabase.from("observations").delete().in("id", ids);

    if (error) {
      console.error("Failed to delete observations");
    } else {
      setSuccessMessage(`${ids.length} observation(s) deleted.`);
      setTimeout(() => setSuccessMessage(null), 3100);
      fetchObservations();
    }
  };

  const handleAddObservation = async (content: string) => {
    if (!selectedPlayer) {
      console.error("No player selected.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("observations").insert({
      player_id: selectedPlayer.id,
      content: content,
      observation_date: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to add observation.");
    } else {
      setSuccessMessage("Observation added successfully.");
      setTimeout(() => setSuccessMessage(null), 3100);
      await fetchObservations();
      setAddObservationModalOpen(false);
    }
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Players</h1>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Loading players...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Players</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading players: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-2 px-6">
        <PageSubheader
          title="Player Profile"
        />

        <ThreePaneLayout
          leftPane={
            <PlayerListPane
              players={players}
              selectedId={selectedPlayerId}
              onSelect={setSelectedPlayerId}
            />
          }
          centerPane={
            selectedPlayer ? (
              <div className="flex flex-col gap-4 w-full">
                {/* Player Info Header */}
                <PlayerMetadataCard 
                  player={{ name: selectedPlayer.name, joined: selectedPlayer.joined }} 
                  observations={observations}
                  playerId={selectedPlayer.id}
                  showDeleteButton={true}
                />

                <hr className="my-4 border-zinc-700" />

                {/* Refactored PDP Display Box */}
                <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-zinc-100 text-sm font-semibold">Development Plan</h2>
                    {selectedPlayer && currentPdp && (
                      <div className="flex gap-2">
                        <EditPDPButton player={selectedPlayer} pdp={currentPdp} onUpdate={fetchPdp} />
                        <ManagePDPModal playerId={selectedPlayer.id} playerName={selectedPlayer.name} />
                      </div>
                    )}
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
                  observations={observations}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Select a player to view their profile.
              </div>
            )
          }
          rightPane={
            <PDPArchivePane
              pdps={archivedPdps}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          }
        />
      </div>

      {selectedPlayer && (
        <AddObservationModal
          open={isAddObservationModalOpen}
          onClose={() => setAddObservationModalOpen(false)}
          selectedPlayer={selectedPlayer}
          onSubmit={handleAddObservation}
        />
      )}
    </div>
  );
} 