"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";

import ThreePaneLayout from "@/components/ThreePaneLayout";
import EntityListPane from "@/components/EntityListPane";
import MiddlePane from "@/components/MiddlePane";
import ObservationInsightsPane from "@/components/ObservationInsightsPane";
import EmptyCard from "@/components/EmptyCard";
import PageTitle from "@/components/PageTitle";
import EntityButton from '@/components/EntityButton';
import { ErrorBadge } from '@/components/StatusBadge';
import SectionLabel from "@/components/SectionLabel";
import EntityMetadataCard from "@/components/EntityMetadataCard";

// Type definitions - matching dashboard exactly
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
  player_id: string;
  archived: boolean;
}

interface Pdp {
  id: string;
  player_id: string;
  content: string | null;
  archived_at: string | null;
  start_date: string;
}

export default function ObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerId, setPlayerId } = useSelectedPlayer();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [allObservations, setAllObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [allPdps, setAllPdps] = useState<Pdp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);

  const selectedPlayer = players.find((p) => p.id === playerId);

  console.log("Observations page state:", {
    playersCount: players.length,
    playerId,
    selectedPlayer,
    observationsCount: observations.length,
    allObservationsCount: allObservations.length
  });

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
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get coach record
    const { data: coachRow } = await supabase
      .from("coaches")
      .select("id")
      .eq("auth_uid", user.id)
      .single();
    
    if (!coachRow) return;

    // Get teams for this coach
    const { data: teamCoaches } = await supabase
      .from("team_coaches")
      .select("team_id")
      .eq("coach_id", coachRow.id);
    
    const teamIds = teamCoaches?.map(tc => tc.team_id) || [];
    
    if (teamIds.length === 0) {
      setAllPdps([]);
      return;
    }

    // Get player IDs for this coach's teams
    const { data: players } = await supabase
      .from("players")
      .select("id")
      .in("team_id", teamIds);
    
    const playerIds = players?.map(p => p.id) || [];
    
    if (playerIds.length === 0) {
      setAllPdps([]);
      return;
    }

    // Fetch PDPs only for coach's players
    const { data } = await supabase
      .from("pdp")
      .select("id, content, start_date, created_at, player_id, archived_at")
      .in("player_id", playerIds);
    setAllPdps(data || []);
  };

  useEffect(() => {
    async function fetchPlayersAndAllObservations() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        // Fetch players with team information and observation counts (same as Players page)
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
          setError("Error fetching players");
          return;
        }
        // Fetch all active PDPs
        const { data: pdpsData } = await supabase
          .from("pdp")
          .select("id, player_id, content, archived_at, start_date")
          .is("archived_at", null);
        setAllPdps(pdpsData || []);
        // Get player IDs for filtering observations
        const playerIds = playersData?.map(p => p.id) || [];
        // Fetch observations only for these players
        const { data: observationsData, error: observationsError } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at, player_id")
          .in("player_id", playerIds)
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .range(0, 49);
        if (observationsError) {
          console.error("Error fetching observations:", observationsError);
          setError("Error fetching observations");
          return;
        }
        const counts = new Map<string, number>();
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
        setAllObservations((observationsData || []).map(obs => ({ ...obs, archived: false })));
      } catch (err) {
        console.error("Error in fetchPlayersAndAllObservations:", err);
        setError("Error fetching players");
      } finally {
        setLoading(false);
      }
    }
    fetchPlayersAndAllObservations();
    fetchAllPdps();
  }, []);

  useEffect(() => {
    async function fetchObs() {
      if (!playerId || !currentPdp) {
        setObservations([]);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at, player_id")
        .eq("player_id", playerId)
        .eq("pdp_id", currentPdp.id)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        console.error("Error fetching observations:", error);
      }
      console.log("Fetched observations:", data);
      setObservations((data || []).map(obs => ({ ...obs, archived: false })));
    }
    fetchObs();
  }, [playerId, currentPdp]);

  useEffect(() => {
    fetchPdp();
  }, [playerId]);

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = createClient();
    await supabase.from("observations").delete().in("id", ids);
    // Refetch observations after deletion
    if (playerId && currentPdp) {
      const { data } = await supabase
        .from("observations")
        .select("id, content, observation_date, created_at, player_id")
        .eq("player_id", playerId)
        .eq("pdp_id", currentPdp.id)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(50);
      setObservations((data || []).map(obs => ({ ...obs, archived: false })));
    }
  };

  const openCreateModal = () => {
    // Implementation of openCreateModal function
  };

  const handleEdit = () => {
    // Implementation of handleEdit function
  };

  const handleDelete = () => {
    // Implementation of handleDelete function
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

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400">Loading observations...</span>
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
    <div className="min-h-screen p-4 bg-zinc-950" style={{ fontFamily: 'Satoshi-Regular, Satoshi, sans-serif' }}>
      <div className="mt-2 px-6">
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Left: Player list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Players</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Add Player button and search bar can be added here if needed */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-2">
                {players.map(player => renderPlayerItem(player, playerId === player.id))}
              </div>
            </div>
          </div>
          {/* Center: Player Profile + Development Plan */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Player Profile</SectionLabel>
            {selectedPlayer ? (
              <EntityMetadataCard
                fields={[
                  { label: "Name", value: selectedPlayer.name, highlight: true },
                  { label: "Joined", value: selectedPlayer.joined },
                  ...(selectedPlayer.team_name ? [{ label: "Team", value: selectedPlayer.team_name }] : [])
                ]}
                actions={null}
                cardClassName="mt-0"
              />
            ) : (
              <EmptyCard title="Select a Player to View Their Profile" titleClassName="font-bold text-center" />
            )}
            <SectionLabel>Development Plan</SectionLabel>
            {selectedPlayer ? (
              <EntityMetadataCard
                fields={[
                  { label: "Started", value: currentPdp?.start_date ? currentPdp.start_date : "—" },
                  { label: "Plan", value: currentPdp?.content || "No active plan." }
                ]}
                actions={null}
                cardClassName="mt-0"
              />
            ) : (
              <EmptyCard title="Select a Player to View Their Development Plan" titleClassName="font-bold text-center" />
            )}
            <SectionLabel>Recent Observations</SectionLabel>
            {selectedPlayer ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
                {observations.length === 0 ? (
                  <div className="text-zinc-500 italic">No observations for this player.</div>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    {observations.map(obs => (
                      <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                        <div className="text-xs text-zinc-400 mb-1">{obs.observation_date}</div>
                        <div className="text-base text-zinc-100">{obs.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyCard title="Select a Player to View Their Observations" titleClassName="font-bold text-center" />
            )}
          </div>
          {/* Right: Insights or additional info */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Insights</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Add insights or summary info here if needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 