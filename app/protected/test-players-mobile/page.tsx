"use client";

import { useState, useEffect } from "react";
import ManagePDPModal from "@/components/ManagePDPModal";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { GoldButton } from "@/components/ui/gold-button";
import CreatePDPModal from "@/components/CreatePDPModal";
import EditPDPModal from "@/components/EditPDPModal";
import { Button } from "@/components/ui/button";

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

export default function TestPlayersMobilePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');

  const fetchPdp = async () => {
    if (!selected) {
      setCurrentPdp(null);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pdp")
      .select("id, content, start_date")
      .eq("player_id", selected)
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
        setSelected(transformedPlayers[0]?.id || null);
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
      if (!selected) {
        setObservations([]);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("observations")
          .select("id, content, observation_date, created_at")
          .eq("player_id", selected)
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
  }, [selected]);

  // Fetch active PDP for the selected player
  useEffect(() => {
    fetchPdp();
  }, [selected]);

  const selectedPlayer = players.find((p) => p.id === selected);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Players Mobile</h1>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Loading players...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Players Mobile</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading players: {error}
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedPlayer) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setView('list')}
            className="text-white hover:text-yellow-300"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-white">{selectedPlayer.name}</h1>
        </div>

        {/* Player Stats */}
        <div className="bg-zinc-900 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400">Observations</p>
              <p className="text-lg font-bold text-yellow-300">{selectedPlayer.observations}</p>
            </div>
            <div>
              <p className="text-zinc-400">Joined</p>
              <p className="text-lg font-bold text-yellow-300">{selectedPlayer.joined}</p>
            </div>
          </div>
        </div>

        {/* PDP Section */}
        <div className="bg-zinc-900 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">Current PDP</h2>
            <div className="flex gap-2">
              {currentPdp ? (
                <Button
                  onClick={() => setEditModalOpen(true)}
                  className="text-xs px-2 py-1"
                >
                  Edit
                </Button>
              ) : (
                <GoldButton
                  onClick={() => setCreateModalOpen(true)}
                  className="text-xs px-2 py-1"
                >
                  Create PDP
                </GoldButton>
              )}
            </div>
          </div>
          
          {currentPdp ? (
            <div className="text-sm text-zinc-300">
              <p className="text-xs text-zinc-400 mb-1">
                Started: {format(new Date(currentPdp.start_date), "MMM d, yyyy")}
              </p>
              <p className="whitespace-pre-wrap">{currentPdp.content}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No PDP created yet.</p>
          )}
        </div>

        {/* Recent Observations */}
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-3 text-white">Recent Observations</h3>
          {observations.length > 0 ? (
            <div className="space-y-3">
              {observations.map((obs) => (
                <div key={obs.id} className="text-sm text-zinc-300 border-l-2 border-zinc-700 pl-3">
                  <p className="text-xs text-zinc-400 mb-1">
                    {format(new Date(obs.observation_date || obs.created_at), "MMM d, yyyy")}
                  </p>
                  <p>{obs.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No observations yet.</p>
          )}
        </div>

        {/* Modals */}
        {isCreateModalOpen && selected && selectedPlayer && (
          <CreatePDPModal
            open={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            player={{ id: selected, name: selectedPlayer.name }}
            coachId=""
            onCreated={() => {
              setCreateModalOpen(false);
              fetchPdp();
            }}
          />
        )}

        {isEditModalOpen && currentPdp && selectedPlayer && (
          <EditPDPModal
            open={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            player={{ id: selected!, name: selectedPlayer.name }}
            currentPdp={currentPdp}
            onSuccess={() => {
              setEditModalOpen(false);
              fetchPdp();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <h1 className="text-xl font-bold mb-4 text-white">Test Players Mobile</h1>
      
      {/* Player List */}
      <div className="space-y-2">
        {players.map((p) => (
          <div key={p.id} className="relative">
            <button
              onClick={() => {
                setSelected(p.id);
                setView('detail');
              }}
              className="w-full bg-zinc-900 p-4 rounded-lg text-left hover:bg-zinc-800 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{p.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {p.observations} observations • Joined {p.joined}
                  </p>
                </div>
                <div className="text-zinc-500">→</div>
              </div>
            </button>
            
            {/* Delete button positioned at bottom right */}
            <div className="absolute bottom-2 right-2">
              <DeletePlayerButton playerId={p.id} playerName={p.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 