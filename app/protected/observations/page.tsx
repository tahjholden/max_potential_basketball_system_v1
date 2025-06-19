"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Observation = {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_id: string;
  pdp_id?: string;
  player: {
    name: string;
  };
  coaches: {
    first_name: string;
    last_name: string;
  };
};

type Player = {
  id: string;
  name: string;
};

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError("Authentication required");
          return;
        }

        // Fetch all observations with player and coach info
        const { data: observationsData, error: obsError } = await supabase
          .from("observations")
          .select(`
            id,
            content,
            observation_date,
            created_at,
            player_id,
            pdp_id,
            player:players!player_id(name),
            coaches:coaches(first_name, last_name)
          `)
          .order("created_at", { ascending: false });

        if (obsError) {
          setError(`Error loading observations: ${obsError.message}`);
          return;
        }

        // Transform the data to match our expected structure
        const transformedObservations = (observationsData || []).map((obs: any) => ({
          id: obs.id,
          content: obs.content,
          observation_date: obs.observation_date,
          created_at: obs.created_at,
          player_id: obs.player_id,
          pdp_id: obs.pdp_id,
          player: {
            name: obs.player?.name || "Unknown Player"
          },
          coaches: {
            first_name: obs.coaches?.first_name || "",
            last_name: obs.coaches?.last_name || ""
          }
        }));

        // Fetch all players for filter dropdown
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("id, name")
          .order("name");

        if (playersError) {
          setError(`Error loading players: ${playersError.message}`);
          return;
        }

        setObservations(transformedObservations);
        setPlayers(playersData || []);
        setError(null);
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter observations based on search and filters
  const filteredObservations = observations.filter(obs => {
    const matchesSearch = !searchTerm || 
      obs.player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlayer = !selectedPlayer || obs.player_id === selectedPlayer;
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (obs.observation_date >= dateRange.start && obs.observation_date <= dateRange.end);
    
    return matchesSearch && matchesPlayer && matchesDateRange;
  });

  const visibleObservations = filteredObservations.slice(0, visibleCount);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  const getCoachName = (coach: any) => {
    if (!coach) return "Unknown Coach";
    return `${coach.first_name || ""} ${coach.last_name || ""}`.trim() || "Unknown Coach";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPlayer("");
    setDateRange({ start: "", end: "" });
    setVisibleCount(10);
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#0f172a] min-h-screen font-sans text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gold">Loading observations...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0f172a] min-h-screen font-sans text-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
            <h1 className="text-2xl text-gold font-bold mb-4">Error</h1>
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-gold text-black px-4 py-2 rounded hover:bg-gold/80"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen font-sans text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Observations Archive</h1>
            <p className="text-gray-400">Review and manage all coaching observations</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/protected/dashboard"
              className="bg-slate-700 text-white px-4 py-2 font-bold rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
            >
              Back to Dashboard
            </Link>
            <Link 
              href="/protected/players"
              className="bg-gold text-black px-4 py-2 font-bold rounded-lg hover:bg-gold/80 transition-colors"
            >
              + Add Observation
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-600 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by player or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none"
              />
            </div>

            {/* Player Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Player</label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none"
              >
                <option value="">All Players</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
            <div className="text-sm text-gray-400">
              Showing {visibleObservations.length} of {filteredObservations.length} observations
            </div>
            <button
              onClick={clearFilters}
              className="text-gold hover:text-gold text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Observations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleObservations.map((obs) => (
            <div key={obs.id} className="bg-slate-800 rounded-lg p-6 border border-slate-600 shadow-md hover:border-slate-500 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-gold font-semibold text-lg">{obs.player.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {formatDate(obs.observation_date || obs.created_at)}
                  </p>
                </div>
                <Link
                  href={`/protected/players/${obs.player_id}`}
                  className="text-gold hover:text-gold text-sm"
                >
                  View Player
                </Link>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-200 text-sm line-clamp-4">
                  {obs.content.length > 200 
                    ? `${obs.content.substring(0, 200)}...` 
                    : obs.content
                  }
                </p>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Coach: {getCoachName(obs.coaches)}</span>
                {obs.pdp_id && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    Linked to PDP
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleObservations.length < filteredObservations.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="bg-gold text-black px-6 py-3 rounded-lg hover:bg-gold/80 transition-colors font-bold"
            >
              Load More ({filteredObservations.length - visibleObservations.length} remaining)
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredObservations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm || selectedPlayer || dateRange.start || dateRange.end 
                ? 'No observations found matching your filters' 
                : 'No observations found'
              }
            </div>
            <p className="text-gray-500">
              {searchTerm || selectedPlayer || dateRange.start || dateRange.end 
                ? 'Try adjusting your search criteria' 
                : 'Observations will appear here once added'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 