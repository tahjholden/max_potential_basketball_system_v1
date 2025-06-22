"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DashboardMetrics {
  totalPlayers: number;
  totalObservations: number;
  activePDPs: number;
  archivedPDPs: number;
  playersNeedingPDP: number;
  newObservationsToday: number;
  playersWithoutPDP: number;
}

export default function TestDashboardMobilePage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPlayers: 0,
    totalObservations: 0,
    activePDPs: 0,
    archivedPDPs: 0,
    playersNeedingPDP: 0,
    newObservationsToday: 0,
    playersWithoutPDP: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch all data in parallel
        const [
          { data: players, error: playersError },
          { data: observations, error: observationsError },
          { data: activePDPs, error: activePDPsError },
          { data: allPDPs, error: allPDPsError },
        ] = await Promise.all([
          supabase.from("players").select("id, name, first_name, last_name"),
          supabase.from("observations").select("id, created_at"),
          supabase.from("pdp").select("id, player_id").is("archived_at", null),
          supabase.from("pdp").select("id, archived_at"),
        ]);

        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);
        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);
        if (activePDPsError) throw new Error(`Error fetching active PDPs: ${activePDPsError.message}`);
        if (allPDPsError) throw new Error(`Error fetching all PDPs: ${allPDPsError.message}`);

        const totalPlayers = players?.length || 0;
        const totalObservations = observations?.length || 0;
        const activePDPsCount = activePDPs?.length || 0;
        const archivedPDPsCount = (allPDPs?.filter(pdp => pdp.archived_at) || []).length;

        // Calculate players without PDPs
        const playersWithPDPs = new Set(activePDPs?.map(pdp => pdp.player_id) || []);
        const playersWithoutPDP = totalPlayers - playersWithPDPs.size;

        // Calculate new observations today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newObservationsToday = observations?.filter(obs => {
          const obsDate = new Date(obs.created_at);
          return obsDate >= today;
        }).length || 0;

        setMetrics({
          totalPlayers,
          totalObservations,
          activePDPs: activePDPsCount,
          archivedPDPs: archivedPDPsCount,
          playersNeedingPDP: playersWithoutPDP,
          newObservationsToday,
          playersWithoutPDP,
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Dashboard Mobile</h1>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-zinc-950">
        <h1 className="text-xl font-bold mb-4 text-white">Test Dashboard Mobile</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-950">
      <h1 className="text-xl font-bold mb-4 text-white">Test Dashboard Mobile</h1>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-xs text-zinc-400">Total Players</p>
          <p className="text-xl font-bold text-yellow-300">{metrics.totalPlayers}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-xs text-zinc-400">Observations</p>
          <p className="text-xl font-bold text-yellow-300">{metrics.totalObservations}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-xs text-zinc-400">Active PDPs</p>
          <p className="text-xl font-bold text-yellow-300">{metrics.activePDPs}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-xs text-zinc-400">Archived PDPs</p>
          <p className="text-xl font-bold text-yellow-300">{metrics.archivedPDPs}</p>
        </div>
      </div>

      {/* Quick View Section */}
      <div className="bg-zinc-900 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-3 text-white">Quick View</h2>
        <div className="space-y-2 text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <span>🟡</span>
            <span>{metrics.playersNeedingPDP} Players need a PDP</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span>{metrics.totalPlayers} Players in system</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔵</span>
            <span>{metrics.newObservationsToday} New observations today</span>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-zinc-900 p-4 rounded-lg mb-4">
        <h3 className="text-md font-semibold mb-3 text-white">System Alerts</h3>
        <div className="space-y-2 text-sm text-zinc-300">
          <p>🔁 Player sync complete.</p>
          <p>🧠 GPT prompts are current.</p>
          <p>⚠️ {metrics.playersWithoutPDP} players have no PDP assigned.</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-zinc-900 p-4 rounded-lg border border-yellow-700">
        <h3 className="text-md font-semibold mb-3 text-yellow-300">Coming Soon</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-300">
          <li>Live PDP activity heatmap</li>
          <li>Coach adaptability tracker</li>
          <li>Drill usage analytics</li>
        </ul>
      </div>
    </div>
  );
} 