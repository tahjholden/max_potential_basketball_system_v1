"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Player = {
  id: string;
  name: string;
  position?: string;
  created_at: string;
  last_pdp_date?: string;
  has_active_pdp?: boolean;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError("Authentication required");
          return;
        }

        // Fetch players
        const { data: players, error: playersError } = await supabase
          .from("players")
          .select(`
            id,
            name,
            first_name,
            last_name,
            position,
            created_at
          `)
          .order("last_name");

        if (playersError) {
          setError(`Error loading players: ${playersError.message}`);
          return;
        }

        // Fetch active PDPs for each player
        const { data: activePdps, error: pdpsError } = await supabase
          .from("pdp")
          .select(`
            id,
            player_id,
            created_at,
            archived_at
          `)
          .is("archived_at", null);

        if (pdpsError) {
          setError(`Error loading PDPs: ${pdpsError.message}`);
          return;
        }

        // Enrich players with PDP information
        const enrichedPlayers = (players || []).map(player => {
          const activePdp = (activePdps || []).find(pdp => pdp.player_id === player.id);
          const lastPdp = activePdp ? activePdp.created_at : null;
          
          return {
            ...player,
            last_pdp_date: lastPdp,
            has_active_pdp: !!activePdp
          };
        });

        setPlayers(enrichedPlayers);
        setError(null);
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(player =>
    !search.trim() || 
    player.name.toLowerCase().includes(search.toLowerCase()) ||
    (player.position && player.position.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#0f172a] min-h-screen font-sans text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gold">Loading players...</div>
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
            <h1 className="text-3xl font-bold text-gold mb-2">Players</h1>
            <p className="text-gray-400">Manage player development plans and track progress</p>
          </div>
          <Link 
            href="/protected/dashboard"
            className="bg-slate-700 text-white px-4 py-2 font-bold rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="bg-[#232323] border border-[#323232] rounded-lg p-4 mb-6 shadow-md flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search players by name or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 h-10 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#d8cc97] focus:outline-none"
            />
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600 shadow-md text-white hover:border-slate-500 transition-colors">
              <div className="mb-4">
                <h3 className="text-gold font-semibold text-lg">{player.name}</h3>
                <p className="text-gray-400 text-sm">
                  Position: {player.position || "N/A"}
                </p>
                <p className={`text-sm font-medium ${player.has_active_pdp ? 'text-green-400' : 'text-red-400'}`}>
                  PDP Status: {player.has_active_pdp ? 'Active' : 'Needs Update'}
                </p>
                {player.last_pdp_date && (
                  <p className="text-gray-500 text-xs mt-1">
                    Last PDP: {formatDate(player.last_pdp_date)}
                  </p>
                )}
              </div>
              <Link
                href={`/protected/players/${player.id}`}
                className="block w-full bg-gold text-black px-4 py-2 rounded hover:bg-gold/80 text-sm font-bold text-center transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {search ? 'No players found matching your search' : 'No players found'}
            </div>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search terms' : 'Players will appear here once added'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 