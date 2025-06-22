"use client";

import { useState, useEffect } from "react";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import DeleteObservationButton from "@/components/DeleteObservationButton";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

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

export default function ObservationsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchObservationsData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch players and observations
        const [
          { data: playersData, error: playersError },
          { data: observationsData, error: observationsError },
        ] = await Promise.all([
          supabase.from("players").select("id, name, first_name, last_name").order("last_name"),
          supabase.from("observations").select(`
            id, 
            content, 
            observation_date, 
            created_at, 
            player_id
          `).order("created_at", { ascending: false }),
        ]);

        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);
        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);

        // Count observations per player
        const observationCounts = new Map<string, number>();
        observationsData?.forEach(obs => {
          observationCounts.set(obs.player_id, (observationCounts.get(obs.player_id) || 0) + 1);
        });

        // Transform players data
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
        setError(null);
      } catch (err) {
        console.error('Error fetching observations data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }

    fetchObservationsData();
  }, []);

  const selectedPlayer = players.find((p) => p.id === selected);
  const selectedPlayerObservations = observations.filter(obs => obs.player_id === selected);

  // Sort observations by date
  const sorted = selectedPlayerObservations.slice().sort((a, b) => {
    const dateA = a.observation_date || a.created_at;
    const dateB = b.observation_date || b.created_at;
    return dateA.localeCompare(dateB);
  });

  // Calculate date range
  const dateRange = sorted.length > 0
    ? `Observations from ${format(new Date(sorted[0].observation_date || sorted[0].created_at), "MMM d, yyyy")} to ${format(
        new Date(sorted[sorted.length - 1].observation_date || sorted[sorted.length - 1].created_at),
        "MMM d, yyyy"
      )}`
    : null;

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">MP Player Development</h1>
        <div className="flex items-center justify-center h-full text-zinc-500">
          Loading observations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">MP Player Development</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading observations: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">MP Player Development</h1>
      <ThreePaneLayout
        leftPane={
          <>
            <h2 className="text-lg font-semibold mb-2">Players</h2>
            <input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700"
            />
            <div className="flex flex-col space-y-1">
              {filteredPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`text-left px-3 py-2 rounded ${
                    selected === p.id ? "bg-yellow-800 text-black" : "bg-zinc-800 text-white"
                  }`}
                >
                  {p.name}
                  <div className="text-xs opacity-70">{p.observations} observations</div>
                </button>
              ))}
            </div>
          </>
        }
        mainPane={
          selectedPlayer ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedPlayer.name}</h2>
                  <p className="text-sm text-zinc-400">
                    Observations ({selectedPlayerObservations.length})
                  </p>
                  {dateRange && (
                    <p className="text-xs text-zinc-500 mt-1">{dateRange}</p>
                  )}
                </div>
                <button className="text-sm px-3 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400">
                  + Add Observation
                </button>
              </div>

              {selectedPlayerObservations.length > 0 ? (
                <div className="space-y-4">
                  {sorted.map((obs) => (
                    <div
                      key={obs.id}
                      className="relative bg-zinc-800 rounded p-4 text-sm text-zinc-200"
                    >
                      <div className="absolute top-2 right-2">
                        <DeleteObservationButton observationId={obs.id} />
                      </div>
                      <p className="text-xs text-zinc-400 mb-1">
                        {format(new Date(obs.observation_date || obs.created_at), "MMM d, yyyy")}
                      </p>
                      <p>{obs.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 mt-10">No observations found for this player.</p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Select a player to view observations.
            </div>
          )
        }
        rightPane={
          <>
            <h3 className="text-md font-semibold mb-2">Coming Soon</h3>
            <div className="bg-zinc-800 p-4 rounded text-sm border border-yellow-700 text-yellow-300">
              <ul className="list-disc list-inside space-y-1">
                <li>AI-powered constraint suggestions</li>
                <li>Tag trend visualizations</li>
                <li>Drill recommendations</li>
              </ul>
            </div>
          </>
        }
      />
    </div>
  );
} 