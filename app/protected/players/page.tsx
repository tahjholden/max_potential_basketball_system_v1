"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import EntityListPane from "@/components/EntityListPane";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import BulkDeleteObservationsPane from "@/components/BulkDeleteObservationsPane";
import PDPArchivePane from "@/components/PDPArchivePane";
import EmptyCard from "@/components/EmptyCard";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import PageTitle from "@/components/PageTitle";
import EntityButton from '@/components/EntityButton';
import { NoPlayersEmptyState, NoArchivedPDPsEmptyState } from '@/components/ui/EmptyState';

// Type Definitions
interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  created_at: string;
  joined: string;
  team_name?: string;
}

interface Pdp {
  id: string;
  content: string | null;
  created_at: string;
  start_date: string;
  player_id: string;
  archived_at: string | null;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
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
      .select("id, content, created_at, start_date, player_id, archived_at")
      .eq("player_id", playerId)
      .is("archived_at", null)
      .maybeSingle();
    setCurrentPdp(pdpData);

    // Fetch recent observations for the player (matching dashboard behavior)
    const { data: observationsData, error: observationsError } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, player_id")
      .eq("player_id", playerId)
      .or("archived.is.null,archived.eq.false")
      .order("created_at", { ascending: false })
      .range(0, 49);
    setObservations((observationsData || []).map(obs => ({ ...obs, archived: false })));

    // Fetch archived PDPs
    const { data: archivedData } = await supabase
      .from("pdp")
      .select("id, content, created_at, start_date, archived_at")
      .eq("player_id", playerId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: sortOrder === "asc" });

    // Fetch all archived observations for this player
    const { data: archivedObsData } = await supabase
      .from("observations")
      .select("id, content, observation_date, created_at, pdp_id, archived")
      .eq("player_id", playerId)
      .eq("archived", true);

    if(archivedData) {
      const processedArchived = archivedData.map(pdp => {
        const startDate = format(new Date(pdp.start_date), "MMM d, yyyy");
        const endDate = pdp.archived_at ? format(new Date(pdp.archived_at), "MMM d, yyyy") : "Present";
        // Attach observations for this PDP
        const pdpObservations = (archivedObsData || []).filter(obs => obs.pdp_id === pdp.id && obs.archived === true);
        return {
          id: pdp.id,
          dateRange: `${startDate} - ${endDate}`,
          summary: pdp.content || "No content available",
          observations: pdpObservations,
          created_at: pdp.created_at,
          start_date: pdp.start_date,
          archived_at: pdp.archived_at,
        };
      });
      setArchivedPdps(processedArchived);
    } else {
      setArchivedPdps([]);
    }
  }, [playerId, sortOrder]);

  const fetchAllData = useCallback(async () => {
    const supabase = createClient();
    
    // Fetch players with team information and observation counts
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select(`
        id, 
        name, 
        first_name, 
        last_name, 
        created_at,
        team_id,
        teams!inner(name)
      `)
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
    
    const transformedPlayers = (playersData || []).map((player: any) => ({
      ...player,
      name: player.first_name && player.last_name ? `${player.first_name} ${player.last_name}`: player.name,
      observations: counts.get(player.id) || 0,
      joined: new Date(player.created_at).toLocaleDateString(),
      team_name: player.teams?.name || undefined,
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

  const handleEdit = () => {
    // Implementation for editing player
    console.log('Edit player:', selectedPlayer?.id);
  };

  const handleDelete = () => {
    // Implementation for deleting player
    console.log('Delete player:', selectedPlayer?.id);
  };

  // Get players without active PDPs for styling
  const playerIdsWithPDP = new Set(
    allPdps
      .filter(pdp => !pdp.archived_at)
      .map(pdp => pdp.player_id)
  );

  // Custom render function for player items with PDP status
  const renderPlayerItem = (player: any, isSelected: boolean) => {
    const hasNoPlan = !playerIdsWithPDP.has(player.id);
    
    const baseClasses = "w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2";

    let classes = baseClasses;
    if (hasNoPlan) {
      classes += isSelected
        ? " bg-[#A22828] text-white border-[#A22828]"
        : " bg-zinc-900 text-[#A22828] border-[#A22828]";
    } else {
      classes += isSelected
        ? " bg-[#C2B56B] text-black border-[#C2B56B]"
        : " bg-zinc-900 text-[#C2B56B] border-[#C2B56B]";
    }

    return (
      <button
        key={player.id}
        onClick={() => setPlayerId(player.id)}
        className={classes}
      >
        {player.name}
      </button>
    );
  };

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <div className="mt-2 px-6">
        <PageTitle>Players</PageTitle>
        <ThreePaneLayout
          leftPane={
            <EntityListPane
              title="Players"
              items={players}
              selectedId={playerId || undefined}
              onSelect={id => setPlayerId(id)}
              actions={
                <EntityButton 
                  color="gold"
                  onClick={() => {
                    // This would need to be implemented to open the AddPlayerModal
                    console.log('Add player');
                    fetchAllData();
                  }}
                >
                  Add Player
                </EntityButton>
              }
              searchPlaceholder="Search players..."
              renderItem={renderPlayerItem}
            />
          }
          centerPane={
            players.length === 0 ? (
              <NoPlayersEmptyState 
                onAddPlayer={() => {
                  console.log('Add player');
                  fetchAllData();
                }}
              />
            ) : selectedPlayer ? (
              <div className="flex flex-col gap-4">
                <EntityMetadataCard
                  title="Player Profile"
                  fields={[
                    {
                      label: "Name",
                      value: selectedPlayer.name,
                      highlight: true
                    },
                    {
                      label: "Joined",
                      value: format(new Date(selectedPlayer.joined), "MMMM do, yyyy")
                    },
                    ...(selectedPlayer.team_name ? [{
                      label: "Team",
                      value: (
                        <Link 
                          href={`/protected/teams?playerId=${selectedPlayer.id}`}
                          className="text-[#C2B56B] hover:text-[#C2B56B]/80 underline transition-colors"
                        >
                          {selectedPlayer.team_name}
                        </Link>
                      )
                    }] : [])
                  ]}
                />
                <DevelopmentPlanCard
                  player={selectedPlayer}
                  pdp={currentPdp}
                  onPdpUpdate={fetchPlayerData}
                />
                <BulkDeleteObservationsPane
                  observations={observations}
                  showCheckboxes={false}
                />
                <div className="flex gap-1">
                  <EntityButton color="gold" onClick={handleEdit}>
                    Edit Player
                  </EntityButton>
                  <EntityButton color="danger" onClick={handleDelete}>
                    Delete Player
                  </EntityButton>
                </div>
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
            players.length === 0 ? (
              <NoArchivedPDPsEmptyState />
            ) : (
              <PDPArchivePane
                pdps={archivedPdps}
                onSortOrderChange={setSortOrder}
                sortOrder={sortOrder}
              />
            )
          }
        />
      </div>
    </div>
  );
} 