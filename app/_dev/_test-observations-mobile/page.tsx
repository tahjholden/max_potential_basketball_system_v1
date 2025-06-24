"use client";

import { useState, useEffect } from "react";
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

export default function TestObservationsMobilePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'list' | 'detail'>('list');

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
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Observations Mobile</h1>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Loading observations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Observations Mobile</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading observations: {error}
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

        {/* Player Info */}
        <div className="bg-zinc-900 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
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
        </div>

        {/* Observations List */}
        {selectedPlayerObservations.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((obs) => (
              <div
                key={obs.id}
                className="relative bg-zinc-900 rounded p-4 text-sm text-zinc-200"
              >
                <div className="absolute top-2 right-2">
                  <DeleteObservationButton observationId={obs.id} />
                </div>
                <p className="text-xs text-zinc-400 mb-2">
                  {format(new Date(obs.observation_date || obs.created_at), "MMM d, yyyy")}
                </p>
                <p className="pr-8">{obs.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 p-8 rounded-lg text-center">
            <p className="text-zinc-500">No observations for this player yet.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <h1 className="text-xl font-bold mb-4 text-white">Test Observations Mobile</h1>
      
      {/* Search */}
      <div className="mb-4">
        <input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded bg-zinc-900 text-white border border-zinc-700"
        />
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {filteredPlayers.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelected(p.id);
              setView('detail');
            }}
            className="w-full bg-zinc-900 p-4 rounded-lg text-left hover:bg-zinc-800 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">{p.name}</h3>
                <p className="text-sm text-zinc-400">{p.observations} observations</p>
              </div>
              <div className="text-zinc-500">→</div>
            </div>
          </button>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          No players found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
} 