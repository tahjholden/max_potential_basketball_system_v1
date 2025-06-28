"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSelectedPlayer } from "@/stores/useSelectedPlayer";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import SectionLabel from "@/components/SectionLabel";
import EntityMetadataCard from "@/components/EntityMetadataCard";
import EmptyCard from "@/components/EmptyCard";
import PaneTitle from "@/components/PaneTitle";
import { Badge as ErrorBadge } from "@/components/ui/badge";

interface Player {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  observations: number;
  joined: string;
  team_id?: string;
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

export default function TestCoachesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { playerId, setPlayerId } = useSelectedPlayer();
  const selectedPlayer = players.find((p: Player) => p.id === playerId);

  // Fetch players
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
  }, []);

  // Fetch observations for selected player
  useEffect(() => {
    async function fetchObservations() {
      if (!playerId) {
        setObservations([]);
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at")
          .eq("player_id", playerId)
          .or("archived.is.null,archived.eq.false")
          .order("created_at", { ascending: false })
          .limit(5);
        setObservations(data || []);
      } catch (err) {
        console.error('Error fetching observations:', err);
      }
    }
    fetchObservations();
  }, [playerId]);

  // Fetch PDP for selected player
  useEffect(() => {
    async function fetchPdp() {
      if (!playerId) {
        setCurrentPdp(null);
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("pdp")
          .select("id, content, start_date, created_at, player_id, archived_at")
          .eq("player_id", playerId)
          .or("archived.is.null,archived.eq.false")
          .maybeSingle();
        setCurrentPdp(data);
      } catch (err) {
        console.error('Error fetching PDP:', err);
      }
    }
    fetchPdp();
  }, [playerId]);

  const renderPlayerItem = (player: any, isSelected: boolean) => {
    return (
      <button
        key={player.id}
        onClick={() => setPlayerId(player.id)}
        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
          isSelected
            ? "bg-[#C2B56B] text-black font-medium"
            : "text-zinc-300 hover:bg-zinc-800"
        }`}
      >
        {player.name}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400">Loading test coaches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950 flex items-center justify-center">
        <ErrorBadge className="p-4">
          {error}
        </ErrorBadge>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950" style={{ fontFamily: 'Satoshi-Regular, Satoshi, sans-serif' }}>
      <div className="mt-2 px-6">
        {/* Canonical main content row: three columns, scrollable */}
        <div className="flex-1 min-h-0 flex gap-6">
          {/* Left: Player list */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Players</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {/* Scrollable player list */}
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
                  { label: "Joined", value: format(new Date(selectedPlayer.joined), "MMMM do, yyyy") },
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
                  { label: "Started", value: currentPdp?.created_at ? format(new Date(currentPdp.created_at), "MMMM do, yyyy") : "—" },
                  { label: "Plan", value: currentPdp?.content || "No active plan." }
                ]}
                actions={null}
                cardClassName="mt-0"
              />
            ) : (
              <EmptyCard title="Select a Player to View Their Development Plan" titleClassName="font-bold text-center" />
            )}
          </div>
          {/* Right: Observations Card */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
            <SectionLabel>Observations</SectionLabel>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex-1 min-h-0 flex flex-col">
              {!selectedPlayer ? (
                <div className="flex items-center justify-center w-full overflow-x-hidden h-full">
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '220px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <Image
                      src={require('@/public/maxsM.png')}
                      alt="MP Shield"
                      priority
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                        filter: 'drop-shadow(0 2px 12px #2226)',
                        opacity: 0.75,
                        transform: 'scale(3)',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {observations.map(obs => (
                    <div key={obs.id} className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700">
                      <div className="text-xs text-zinc-400 mb-1">{format(new Date(obs.observation_date), "MMMM do, yyyy")}</div>
                      <div className="text-base text-zinc-100">{obs.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 