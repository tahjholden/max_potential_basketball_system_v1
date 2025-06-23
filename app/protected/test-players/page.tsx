"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import PlayerListPane from "@/components/PlayerListPane";
import PlayerObservationPane from "@/components/PlayerObservationPane";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import AddObservationModal from "./AddObservationModal";
import PageTitle from "@/components/PageTitle";
import PDPArchivePane from "@/components/PDPArchivePane";
import { format } from "date-fns";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import EditPDPButton from "@/components/EditPDPButton";
import ManagePDPModal from "@/components/ManagePDPModal";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import ObservationFeedPane from "@/components/ObservationFeedPane";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";
import PaneTitle from "@/components/PaneTitle";
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
  observations: Observation[];
  start_date: string;
  archived_at: string;
}

export default function TestPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId } = useSelectedPlayer();
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [archivedPdps, setArchivedPdps] = useState<ArchivedPdp[]>([]);
  const [isAddObservationModalOpen, setAddObservationModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("desc");
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

  // Fetch observations when selected player changes
  const fetchObservations = async () => {
    if (!playerId) {
      setObservations([]);
      return;
    }

    try {
      const supabase = createClient();
      let query = supabase
        .from("observations")
        .select("id, content, observation_date, created_at")
        .eq("player_id", playerId)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      // Dynamically filter observations:
      // - If there's an active PDP, show observations for it.
      // - If not, show observations that are not linked to any PDP.
      if (currentPdp) {
        query = query.eq('pdp_id', currentPdp.id);
      } else {
        query = query.is('pdp_id', null);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Error fetching observations: ${error.message}`);
      setObservations(data || []);
    } catch (err) {
      console.error('Error fetching observations:', err);
      setObservations([]);
    }
  };

  const fetchArchivedPdps = async () => {
    if (!playerId) {
      setArchivedPdps([]);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdp")
        .select("id, content, start_date, archived_at")
        .eq("player_id", playerId)
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: sortOrder === "asc" });

      if (error) {
        console.error("Error fetching archived PDPs:", error.message);
        setArchivedPdps([]);
        return;
      }

      // For each archived PDP, fetch its observations
      const archivedPdpsWithObservations = await Promise.all(
        (data || []).map(async (pdp) => {
          const { data: pdpObservations } = await supabase
            .from("observations")
            .select("id, content, observation_date, created_at")
            .eq("pdp_id", pdp.id)
            .order("created_at", { ascending: false });

          const startDate = format(new Date(pdp.start_date), "MMM yyyy");
          const endDate = pdp.archived_at ? format(new Date(pdp.archived_at), "MMM yyyy") : "Present";
          const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
          
          return {
            id: pdp.id,
            dateRange,
            summary: pdp.content || "No content available",
            observations: pdpObservations || [],
            start_date: pdp.start_date,
            archived_at: pdp.archived_at,
          };
        })
      );

      setArchivedPdps(archivedPdpsWithObservations);
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
    if (playerId) {
      fetchPdp();
    } else {
      setCurrentPdp(null);
      setObservations([]);
    }
  }, [playerId]);

  // Fetch observations only after the active PDP has been determined
  useEffect(() => {
    fetchObservations();
  }, [playerId, currentPdp]);

  // Fetch archived PDPs when player or sort order changes
  useEffect(() => {
    fetchArchivedPdps();
  }, [playerId, sortOrder]);

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
    if (!playerId) {
      console.error("No player selected.");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    // Get the active PDP for the player to link the observation
    const { data: activePdp } = await supabase
      .from("pdp")
      .select("id")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .single();

    const { error } = await supabase.from("observations").insert({
      player_id: playerId,
      content,
      observation_date: new Date().toISOString(),
      coach_id: user.id,
      pdp_id: activePdp?.id,
    });

    if (error) {
      console.error("Failed to add observation:", error.message);
    } else {
      setAddObservationModalOpen(false);
      setSuccessMessage("Observation added successfully.");
      setTimeout(() => setSuccessMessage(null), 3100);
      fetchObservations(); // Refresh observations list
      fetchArchivedPdps(); // Also refresh archives in case of state changes
    }
  };

  const selectedPlayer = players.find((p) => p.id === playerId);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <div className="mt-2 px-6">
          <PageTitle>Player Profile</PageTitle>
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
          <PageTitle>Player Profile</PageTitle>
          <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
            Error loading players: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 p-4">
      <div className="mb-4">
        <PageTitle>Players</PageTitle>
      </div>
      <ThreePaneLayout
        leftPane={
          <PlayerListPane
            players={players}
            onSelect={() => {
              // Handled by global store
            }}
          />
        }
        centerPane={
          selectedPlayer ? (
            <div className="flex flex-col gap-4">
              <DevelopmentPlanCard
                startDate={currentPdp?.start_date || null}
                content={currentPdp?.content || "No active plan."}
              />
              <PDPArchivePane
                pdps={archivedPdps}
                onSortOrderChange={setSortOrder}
                sortOrder={sortOrder}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col gap-4">
              <EmptyCard title="Current Development Plan" />
              <EmptyCard title="Archived Plans" />
            </div>
          )
        }
        rightPane={
          selectedPlayer ? (
            <PlayerObservationPane
              playerName={selectedPlayer.name}
              observations={observations}
              onAdd={() => setAddObservationModalOpen(true)}
            />
          ) : (
            <EmptyCard title="Observation Feed" />
          )
        }
      />
      {selectedPlayer && (
        <AddObservationModal
          open={isAddObservationModalOpen}
          onClose={() => setAddObservationModalOpen(false)}
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