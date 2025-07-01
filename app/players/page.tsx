"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageTitle from "@/components/PageTitle";
import PlayerListPane from "@/components/PlayerListPane";
import PlayerMetadataCard from "@/components/PlayerMetadataCard";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import EmptyCard from "@/components/EmptyCard";
import PDPArchivePane from "@/components/PDPArchivePane";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import ObservationFeedPane from "@/components/ObservationFeedPane";
import PlayerListShared from "@/components/PlayerListShared";
import SectionLabel from "@/components/SectionLabel";
import { NoTeamsEmptyState } from "@/components/ui/EmptyState";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
  team_name?: string;
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

interface ArchivedPDP {
  id: string;
  dateRange: string;
  summary: string;
  archived_at?: string;
  created_at: string;
  observations?: Observation[];
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, clearPlayerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [archivedPdps, setArchivedPdps] = useState<ArchivedPDP[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
      .or("archived.is.null,archived.eq.false")
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

  const fetchArchivedPdps = async () => {
    if (!playerId) return setArchivedPdps([]);
    const supabase = createClient();
    const { data } = await supabase
      .from("pdp")
      .select("id, content, start_date, created_at, player_id, archived_at, observations")
      .eq("player_id", playerId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: sortOrder === "asc" });
    // Format for PDPArchivePane
    setArchivedPdps(
      (data || []).map((pdp: any) => ({
        id: pdp.id,
        dateRange: `${pdp.start_date} - ${pdp.archived_at}`,
        summary: pdp.content || "",
        archived_at: pdp.archived_at,
        created_at: pdp.created_at,
        observations: pdp.observations || [],
      }))
    );
  };

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: playersData } = await supabase
          .from("players")
          .select("id, name, first_name, last_name, created_at, team_name")
          .order("last_name", { ascending: true });
        const { data: observationsData } = await supabase
          .from("observations")
          .select("player_id")
          .or("archived.is.null,archived.eq.false");
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
        .or("archived.is.null,archived.eq.false")
        .order("created_at", { ascending: false })
        .limit(5);
      setObservations(data || []);
    }
    fetchObs();
    fetchArchivedPdps();
  }, [playerId, sortOrder]);

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
        <PageTitle>Players</PageTitle>
        <ThreePaneLayout
          leftPane={
            <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
              <SectionLabel>Players</SectionLabel>
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
                {players.length === 0 ? (
                  <NoTeamsEmptyState onAddTeam={() => {}} />
                ) : (
                  <PlayerListShared
                    players={players}
                    teams={[]}
                    selectedPlayerId={playerId}
                    setSelectedPlayerId={() => {}}
                    selectedTeamId={null}
                    setSelectedTeamId={() => {}}
                  />
                )}
              </div>
            </div>
          }
          centerPane={
            selectedPlayer ? (
              <div className="flex flex-col gap-4">
                <PlayerMetadataCard 
                  player={{ name: selectedPlayer.name, joined: selectedPlayer.joined }} 
                  playerId={selectedPlayer.id}
                  showDeleteButton={false}
                />
                <DevelopmentPlanCard 
                  plan={currentPdp?.content || ""}
                  started={currentPdp?.start_date || ""}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full">
                <EmptyCard title="Player Profile" titleClassName="font-bold text-center" />
                <EmptyCard title="Development Plan" titleClassName="font-bold text-center" />
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
    </div>
  );
} 