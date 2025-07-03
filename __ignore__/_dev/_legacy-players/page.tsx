"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import PlayerListPane from "@/components/PlayerListPane";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import BulkDeleteObservationsPane from "@/components/BulkDeleteObservationsPane";
import PDPArchivePane from "@/components/PDPArchivePane";
import EmptyCard from "@/components/EmptyCard";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import PageTitle from "@/components/PageTitle";

// Type Definitions
interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  created_at: string;
  joined: string;
}

interface Pdp {
  id: string;
  content: string | null;
  created_at: string;
  start_date: string;
  archived_at?: string;
  player_id?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  pdp_id?: string;
  archived: boolean;
}

interface ArchivedPdp {
  id: string;
  dateRange: string;
  summary: string;
  observations: Observation[];
  created_at: string;
  start_date: string;
  archived_at: string;
}

interface PlayerListPdp {
  id: string;
  player_id: string;
  content: string | null;
  archived_at: string | null;
}

export default function TestPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPdps, setAllPdps] = useState<PlayerListPdp[]>([]);
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [archivedPdps, setArchivedPdps] = useState<ArchivedPdp[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const selectedPlayer = players.find((p) => p.id === playerId);

  const fetchPlayerData = useCallback(async () => {
    if (!playerId) {
      setCurrentPdp(null);
      setObservations([]);
      setArchivedPdps([]);
      return;
    }
    
    const supabase = createClient();

    // Fetch current PDP
    const { data: pdpData } = await supabase
      .from("pdp")
      .select("id, content, created_at, start_date")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .maybeSingle();
    setCurrentPdp(pdpData);

    // Fetch ALL observations for the player
    const { data: allObsData } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, pdp_id, archived")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    const allObservations = allObsData || [];

    // Filter for active (un-archived) observations
    const activeObservations = allObservations.filter(obs => !obs.archived);
    setObservations(activeObservations);

    // Fetch archived PDPs
    const { data: archivedData } = await supabase
      .from("pdp")
      .select("id, content, created_at, start_date, archived_at")
      .eq("player_id", playerId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: sortOrder === "asc" });

    if(archivedData) {
       const processedArchived = archivedData.map(pdp => {
          const startDate = format(new Date(pdp.start_date), "MMM d, yyyy");
          const endDate = pdp.archived_at ? format(new Date(pdp.archived_at), "MMM d, yyyy") : "Present";
          
          // Find observations belonging to this archived PDP
          const pdpObservations = allObservations.filter(obs => obs.pdp_id === pdp.id);

          return {
              id: pdp.id,
              dateRange: `${startDate} - ${endDate}`,
              summary: pdp.content || "No content available",
              observations: pdpObservations, // Pass the correct observations
              created_at: pdp.created_at,
              start_date: pdp.start_date,
              archived_at: pdp.archived_at,
          }
      });
      setArchivedPdps(processedArchived);
    } else {
      setArchivedPdps([]);
    }
  }, [playerId, sortOrder]);

  const fetchAllData = useCallback(async () => {
    const supabase = createClient();
    
    // Fetch players and observation counts
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("id, name, first_name, last_name, created_at")
      .order("last_name", { ascending: true });

    if (playersError) {
      console.error("Error fetching players:", playersError);
      return;
    }
    
    // Fetch all active PDPs
    const { data: pdpsData, error: pdpsError } = await supabase
      .from("pdp")
      .select("id, player_id, content, archived_at")
      .is("archived_at", null);
    
    if (pdpsError) {
      console.error("Error fetching PDPs:", pdpsError);
    } else {
      console.log("Fetched PDPs:", pdpsData);
    }
    
    const { data: observationsData } = await supabase.from("observations").select("player_id");
    const counts = new Map();
    observationsData?.forEach(obs => {
      counts.set(obs.player_id, (counts.get(obs.player_id) || 0) + 1);
    });
    
    const transformedPlayers = (playersData || []).map(player => ({
      ...player,
      name: player.first_name && player.last_name ? `${player.first_name} ${player.last_name}`: player.name,
      observations: counts.get(player.id) || 0,
      joined: new Date(player.created_at).toLocaleDateString(),
    }));
    setPlayers(transformedPlayers);
    setAllPdps(pdpsData || []);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);


  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-2 px-6">
        <PageTitle>Players</PageTitle>
        <ThreePaneLayout
          leftPane={
            <PlayerListPane
              players={players}
              pdps={allPdps}
              onSelect={() => {}}
              onPlayerAdded={fetchAllData}
            />
          }
          centerPane={
            selectedPlayer ? (
              <div className="flex flex-col gap-4">
                <PlayerMetadataCard
                  player={selectedPlayer}
                  playerId={selectedPlayer.id}
                  showDeleteButton
                  isAdminOrSuperadmin={false}
                />
                <DevelopmentPlanCard
                  plan={currentPdp?.content || ""}
                  started={currentPdp?.start_date || ""}
                />
                <BulkDeleteObservationsPane
                  observations={observations}
                  showCheckboxes={false}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <EmptyCard title="Player Profile" />
                <EmptyCard title="Development Plan" />
                <EmptyCard title="Recent Observations" />
              </div>
            )
          }
          rightPane={
            <PDPArchivePane
              pdps={archivedPdps}
              onSortOrderChange={setSortOrder}
              sortOrder={sortOrder}
            />
          }
        />
      </div>
    </div>
  );
} 