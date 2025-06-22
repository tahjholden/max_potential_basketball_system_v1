"use client";

import ThreePaneLayout from "@/components/ThreePaneLayout";
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

export default function LegacyDashboardPage() {
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
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Legacy Dashboard</h1>
        <div className="flex items-center justify-center h-full text-zinc-500">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Legacy Dashboard</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Legacy Dashboard</h1>
      <ThreePaneLayout
        leftPane={
          <>
            <h2 className="text-lg font-semibold mb-2">Quick View</h2>
            <ul className="text-sm text-zinc-300 space-y-2">
              <li>🟡 {metrics.playersNeedingPDP} Players need a PDP</li>
              <li>🟢 {metrics.totalPlayers} Players in system</li>
              <li>🔵 {metrics.newObservationsToday} New observations today</li>
            </ul>
          </>
        }
        mainPane={
          <>
            <h2 className="text-xl font-semibold mb-4">System Snapshot</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-200">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400">Total Players</p>
                <p className="text-2xl font-bold text-yellow-300">{metrics.totalPlayers}</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400">Observations Logged</p>
                <p className="text-2xl font-bold text-yellow-300">{metrics.totalObservations}</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400">Active PDPs</p>
                <p className="text-2xl font-bold text-yellow-300">{metrics.activePDPs}</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400">Archived PDPs</p>
                <p className="text-2xl font-bold text-yellow-300">{metrics.archivedPDPs}</p>
              </div>
            </div>
          </>
        }
        rightPane={
          <>
            <h3 className="text-md font-semibold mb-2">System Alerts</h3>
            <div className="bg-zinc-800 p-3 rounded text-sm text-zinc-300 space-y-2">
              <p>🔁 Player sync complete.</p>
              <p>🧠 GPT prompts are current.</p>
              <p>⚠️ {metrics.playersWithoutPDP} players have no PDP assigned.</p>
            </div>

            <h3 className="text-md font-semibold mt-6 mb-2">Coming Soon</h3>
            <div className="bg-zinc-800 p-3 rounded text-sm text-yellow-300 border border-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Live PDP activity heatmap</li>
                <li>Coach adaptability tracker</li>
                <li>Drill usage analytics</li>
              </ul>
            </div>
          </>
        }
      />
    </div>
  );
} 