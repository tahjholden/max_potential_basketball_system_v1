"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import AddPlayerModal from "./AddPlayerModal";
import AddPDPModal from "../dashboard/AddPDPModal";

type Player = {
  id: string;
  name: string;
  position?: string;
  created_at: string;
  last_pdp_date?: string;
  has_active_pdp?: boolean;
  observation_count?: number;
  pdpStatus: string;
};

type FilterType = 'all' | 'active' | 'missing';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [addPDPModalOpen, setAddPDPModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPlayerForPDP, setSelectedPlayerForPDP] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastAddedPlayer, setLastAddedPlayer] = useState<any>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showPDPSuccessToast, setShowPDPSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

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

        setCurrentUser(user);

        // Fetch players with PDPs joined
        const { data: playersWithPDPs, error: playersError } = await supabase
          .from("players")
          .select(`
            id,
            name,
            first_name,
            last_name,
            position,
            created_at,
            pdps:pdp(id, archived_at)
          `)
          .order("last_name");

        if (playersError) {
          setError(`Error loading players: ${playersError.message}`);
          return;
        }

        // Fetch observation counts for each player
        const { data: observations, error: obsError } = await supabase
          .from("observations")
          .select(`id, player_id`);

        if (obsError) {
          setError(`Error loading observations: ${obsError.message}`);
          return;
        }

        // Enrich players with PDP status and observation information
        const enrichedPlayers = (playersWithPDPs || []).map(player => {
          const hasActivePDP = player.pdps?.some((pdp: any) => pdp.archived_at === null);
          const pdpStatus = hasActivePDP ? "Active" : "Missing";
          const playerObservations = (observations || []).filter((obs: { player_id: string }) => obs.player_id === player.id);
          return {
            ...player,
            pdpStatus,
            observation_count: playerObservations.length
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

  const handleAddPlayer = async (playerData: { first_name: string; last_name: string; position?: string; pdpContent?: string }, addPDPNow: boolean) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("players")
        .insert([
          {
            first_name: playerData.first_name,
            last_name: playerData.last_name,
            position: playerData.position || null,
            name: `${playerData.first_name} ${playerData.last_name}`
          }
        ])
        .select();

      if (error || !data || !data[0]) {
        throw error || new Error('Failed to add player');
      }
      const newPlayer = data[0];
      setLastAddedPlayer(newPlayer);
      setAddPlayerModalOpen(false);
      // If PDP content is provided, create a PDP for this player
      if (playerData.pdpContent && playerData.pdpContent.trim().length > 0) {
        const { error: pdpError } = await supabase.from("pdp").insert([
          {
            player_id: newPlayer.id,
            content: playerData.pdpContent.trim(),
            start_date: new Date().toISOString(),
            archived_at: null
          }
        ]);
        if (pdpError) throw pdpError;
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    } catch (error: any) {
      setErrorToast(error?.message || "Failed to add player. Please try again.");
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const handleAddPDP = async (pdpData: any) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdp")
        .insert([
          {
            player_id: pdpData.player_id,
            content: pdpData.content,
            start_date: pdpData.start_date,
            created_by: currentUser?.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }
      setShowPDPSuccessToast(true);
      setTimeout(() => setShowPDPSuccessToast(false), 4000);
      window.location.reload();
    } catch (error: any) {
      setErrorToast(error?.message || "Failed to add PDP. Please try again.");
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const filteredPlayers = players.filter(player => {
    // Apply search filter
    const matchesSearch = !search.trim() || 
      player.name.toLowerCase().includes(search.toLowerCase()) ||
      (player.position && player.position.toLowerCase().includes(search.toLowerCase()));
    
    // Apply PDP status filter
    let matchesFilter = true;
    if (filter === 'active') {
      matchesFilter = player.pdpStatus === 'Active';
    } else if (filter === 'missing') {
      matchesFilter = player.pdpStatus === 'Missing';
    }
    
    return matchesSearch && matchesFilter;
  });

  // Sort players so 'Missing' PDPs appear first
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (a.pdpStatus === b.pdpStatus) return 0;
    if (a.pdpStatus === 'Missing') return -1;
    return 1;
  });

  // Count of missing PDPs
  const missingPDPCount = players.filter((p: any) => p.pdpStatus === 'Missing').length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  const getFilterButtonClass = (filterType: FilterType) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors border";
    const activeClass = "bg-gold text-black border-gold";
    const inactiveClass = "bg-slate-700 text-white border-slate-600 hover:bg-slate-600";
    return `${baseClass} ${filter === filterType ? activeClass : inactiveClass}`;
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gold mb-2">Players</h1>
            <p className="text-gray-400">Manage player development plans and track progress</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-gold/20 text-gold font-bold px-3 py-1 rounded-lg text-sm">Missing PDPs: {missingPDPCount}</span>
            <Link 
              href="/protected/dashboard"
              className="bg-slate-700 text-white px-4 py-2 font-bold rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mt-0 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setAddPDPModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 font-bold rounded-lg hover:bg-green-500 transition-colors"
            >
              + Add PDP
            </button>
            <button
              onClick={() => setAddPlayerModalOpen(true)}
              className="bg-gold text-black px-4 py-2 font-bold rounded-lg hover:bg-gold/80 transition-colors"
            >
              + Add Player
            </button>
          </div>
          <div className="flex gap-2">
            {/* Placeholder for Delete actions or other admin actions */}
            {/* <Button variant="danger">Delete Player</Button> */}
          </div>
        </div>

        <hr className="my-4 border-slate-700" />
        <h2 className="text-xl font-semibold text-gold mb-4">All Players</h2>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search players by name or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 w-1/3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-gold focus:outline-none"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={getFilterButtonClass('all')}
            >
              All Players ({players.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={getFilterButtonClass('active')}
            >
              Active ({players.filter(p => p.pdpStatus === 'Active').length})
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={getFilterButtonClass('missing')}
            >
              Missing ({players.filter(p => p.pdpStatus === 'Missing').length})
            </button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPlayers.map((player) => (
            <div key={player.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600 shadow-md text-white hover:border-slate-500 transition-colors min-h-[100px]">
              <div className="mb-4">
                <h3 className="text-gold font-semibold text-lg">{player.name}</h3>
                {player.position && (
                  <p className="text-gray-400 text-sm">
                    Position: {player.position}
                  </p>
                )}
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    player.pdpStatus === "Active"
                      ? "bg-green-600 text-white"
                      : "bg-gold text-black"
                  }`}
                >
                  {player.pdpStatus === "Active" ? "PDP Active" : "PDP Missing"}
                </span>
                <p className="text-gray-400 text-sm">
                  Observations: {player.observation_count || 0}
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
              {search || filter !== 'all' ? 'No players found matching your criteria' : 'No players found'}
            </div>
            <p className="text-gray-500">
              {search || filter !== 'all' ? 'Try adjusting your search terms or filters' : 'Players will appear here once added'}
            </p>
          </div>
        )}

        {/* Modals */}
        <AddPlayerModal
          open={addPlayerModalOpen}
          onClose={() => setAddPlayerModalOpen(false)}
          onSubmit={(data, addPDPNow) => handleAddPlayer(data, addPDPNow)}
        />

        <AddPDPModal
          open={addPDPModalOpen}
          onClose={() => { setAddPDPModalOpen(false); setSelectedPlayerForPDP(null); }}
          onSubmit={handleAddPDP}
          players={players}
          selectedPlayer={selectedPlayerForPDP}
          currentUser={currentUser}
        />

        {/* Toasts */}
        {showToast && lastAddedPlayer && (
          <div className="fixed bottom-4 right-4 bg-gold text-black px-4 py-2 rounded shadow-lg font-bold z-50 flex items-center gap-4">
            <div>
              Player added without PDP. Would you like to create one now?
            </div>
            <button
              className="bg-black text-gold px-3 py-1 rounded hover:bg-gold-600 font-bold"
              onClick={() => {
                setSelectedPlayerForPDP(lastAddedPlayer);
                setAddPDPModalOpen(true);
                setShowToast(false);
              }}
            >
              + Add PDP
            </button>
          </div>
        )}
        {showSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg font-bold z-50">
            Player and PDP created successfully!
          </div>
        )}
        {showPDPSuccessToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg font-bold z-50">
            PDP created successfully!
          </div>
        )}
        {errorToast && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg font-bold z-50">
            Error: {errorToast}
          </div>
        )}
      </div>
    </div>
  );
} 