"use client";

import { useState, useEffect } from "react";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import ManagePDPModal from "@/components/ManagePDPModal";
import DeletePlayerButton from "@/components/DeletePlayerButton";
import DevelopmentPlanCard from "@/components/DevelopmentPlanCard";
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

export default function DashboardPage({ coachId }: { coachId: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [currentPdp, setCurrentPdp] = useState<Pdp | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPdp = async () => {
    if (!selected) {
      console.log('No player selected, setting currentPdp to null');
      setCurrentPdp(null);
      return;
    }
    console.log('Fetching PDP for player:', selected);
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
      console.log("Fetched PDP data:", data);
      setCurrentPdp(data);
    }
  };

  // Enhanced fetchPdp with retry mechanism
  const fetchPdpWithRetry = async (retryCount = 0) => {
    if (!selected) {
      console.log('No player selected, setting currentPdp to null');
      setCurrentPdp(null);
      return;
    }
    
    console.log(`Fetching PDP for player: ${selected} (attempt ${retryCount + 1})`);
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
      console.log("Fetched PDP data:", data);
      setCurrentPdp(data);
      
      // If no PDP found and we haven't retried too many times, retry after a short delay
      if (!data && retryCount < 2) {
        console.log(`No PDP found, retrying in 500ms... (attempt ${retryCount + 1})`);
        setTimeout(() => fetchPdpWithRetry(retryCount + 1), 500);
      }
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
    fetchPdpWithRetry();
  }, [selected]);

  const selectedPlayer = players.find((p) => p.id === selected);

  // Debug logging
  console.log('Rendering with currentPdp:', currentPdp);

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Player Dashboard</h1>
        <div className="flex items-center justify-center h-full text-zinc-500">
          Loading players...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Player Dashboard</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading players: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] gap-4 px-8 py-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Player Dashboard</h1>
      
      <div className="flex h-[calc(100vh-80px)] gap-4 px-8 py-6">
        {/* Left Pane */}
        <div className="w-[22%] max-w-xs bg-zinc-900 p-4 rounded-lg flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Players</h2>
          <input 
            placeholder="Search players..."
            className="mb-3 px-2 py-1 bg-zinc-800 rounded text-white border border-zinc-700" 
          />
          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {players.map((p) => (
              <div key={p.id} className="relative group">
                <button
                  onClick={() => setSelected(p.id)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selected === p.id ? "bg-gold text-black" : "bg-zinc-800 text-white"
                  }`}
                >
                  {p.name}
                  <div className="text-xs opacity-70">{p.observations} observations</div>
                </button>
                <div className="absolute right-2 bottom-2 hidden group-hover:block">
                  <DeletePlayerButton playerId={p.id} playerName={p.name} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Pane */}
        <div className="w-[50%] flex-1 bg-zinc-900 p-4 rounded-lg overflow-y-auto">
          {selectedPlayer ? (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-100">{selectedPlayer.name}</h2>
                    <p className="text-sm text-zinc-400">Joined: {selectedPlayer.joined}</p>
                  </div>
                  <div className="flex gap-2">
                    {currentPdp ? (
                      <>
                        <Button
                          onClick={() => setEditModalOpen(true)}
                          className="bg-zinc-700 text-white hover:bg-zinc-600"
                        >
                          Edit Plan
                        </Button>
                        <ManagePDPModal playerId={selectedPlayer.id} playerName={selectedPlayer.name} />
                      </>
                    ) : (
                      <GoldButton onClick={() => setCreateModalOpen(true)}>
                        Create Plan
                      </GoldButton>
                    )}
                  </div>
                </div>
                <DevelopmentPlanCard 
                  player={selectedPlayer ? { id: selectedPlayer.id, name: selectedPlayer.name } : null}
                  pdp={currentPdp ? { ...currentPdp, created_at: currentPdp.start_date } : null}
                  showActions={false}
                />
              </div>

              <CreatePDPModal
                open={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                player={selectedPlayer ? { id: selectedPlayer.id, name: selectedPlayer.name } : null}
                coachId={coachId}
                onCreated={fetchPdpWithRetry}
              />
              <EditPDPModal
                open={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                player={selectedPlayer ? { id: selectedPlayer.id, name: selectedPlayer.name } : null}
                currentPdp={currentPdp}
                onSuccess={fetchPdpWithRetry}
              />
              <div>
                <h3 className="text-sm font-semibold mb-1">Recent Observations ({selectedPlayer.observations})</h3>
                <p className="text-zinc-500 text-sm">No recent observations.</p>
              </div>
            </>
          ) : (
            <div className="text-center text-zinc-500 mt-8">
              <p>Select a player to view details</p>
            </div>
          )}
        </div>

        {/* Right Pane */}
        <div className="w-[28%] max-w-md bg-zinc-900 p-4 rounded-lg overflow-y-auto">
          <h3 className="text-md font-semibold mb-2">Recent Observations</h3>
          {observations.length > 0 ? (
            <ul className="text-sm text-zinc-300 space-y-2">
              {observations.slice(-3).reverse().map((obs) => (
                <li key={obs.id} className="bg-zinc-800 p-2 rounded">
                  <p className="text-xs text-zinc-500">
                    {obs.observation_date 
                      ? format(new Date(obs.observation_date), "MMM d, yyyy")
                      : format(new Date(obs.created_at), "MMM d, yyyy")
                    }
                  </p>
                  <p>{obs.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-zinc-800 p-3 rounded text-sm text-zinc-300">
              <p>No recent observations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}