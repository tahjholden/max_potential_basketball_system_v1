"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ObservationCard from "./ObservationCard";

type Player = {
  id: string;
  name: string;
  position?: string;
  created_at: string;
  last_pdp_date?: string;
  has_active_pdp?: boolean;
};

interface PlayerDetailModalProps {
  open: boolean;
  onClose: () => void;
  player: Player;
}

export default function PlayerDetailModal({ open, onClose, player }: PlayerDetailModalProps) {
  const [currentPDP, setCurrentPDP] = useState<any>(null);
  const [recentObservations, setRecentObservations] = useState<any[]>([]);
  const [archivedPDPs, setArchivedPDPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch player data when modal opens
  useEffect(() => {
    if (open && player) {
      fetchPlayerData();
    }
  }, [open, player]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Fetch current (active) PDP
      const { data: currentPDPData } = await supabase
        .from("pdp")
        .select(`
          id,
          content,
          created_at,
          start_date,
          end_date,
          coach_id,
          coaches(first_name, last_name)
        `)
        .eq("player_id", player.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Fetch recent observations
      const { data: observationsData } = await supabase
        .from("observations")
        .select(`
          id,
          content,
          observation_date,
          created_at,
          coach_id,
          pdp_id,
          coaches(first_name, last_name)
        `)
        .eq("player_id", player.id)
        .order("created_at", { ascending: false })
        .limit(15);

      // Fetch archived PDPs
      const { data: archivedPDPsData } = await supabase
        .from("pdp")
        .select(`
          id,
          content,
          created_at,
          archived_at,
          start_date,
          end_date,
          coach_id,
          coaches(first_name, last_name)
        `)
        .eq("player_id", player.id)
        .not("archived_at", "is", null)
        .order("created_at", { ascending: false });

      // For each archived PDP, fetch its observations
      const archivedPDPsWithObservations = await Promise.all(
        (archivedPDPsData || []).map(async (pdp) => {
          const { data: pdpObservations } = await supabase
            .from("observations")
            .select(`
              id,
              content,
              observation_date,
              created_at,
              coach_id,
              coaches(first_name, last_name)
            `)
            .eq("pdp_id", pdp.id)
            .order("created_at", { ascending: false });

          return {
            ...pdp,
            observations: pdpObservations || []
          };
        })
      );

      setCurrentPDP(currentPDPData);
      setRecentObservations(observationsData || []);
      setArchivedPDPs(archivedPDPsWithObservations);
    } catch (err) {
      setError(`Error loading player data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-oldgold text-2xl font-bold">
            {player.name}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-oldgold">Loading player data...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Player Info */}
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h3 className="text-oldgold font-semibold mb-2">Player Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Position:</span>
                  <span className="ml-2 text-white">{player.position || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400">Member since:</span>
                  <span className="ml-2 text-white">{formatDate(player.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Current PDP */}
            {currentPDP ? (
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-oldgold font-semibold">
                    Current PDP ({formatDate(currentPDP.created_at)})
                  </h3>
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                  <p className="text-gray-200 whitespace-pre-wrap">{currentPDP.content}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    Coach: {getCoachName(currentPDP.coaches)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h3 className="text-oldgold font-semibold mb-2">Current PDP</h3>
                <p className="text-gray-400">No active PDP. Create one to get started.</p>
              </div>
            )}

            {/* Recent Observations */}
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h3 className="text-oldgold font-semibold mb-3">
                Recent Observations ({recentObservations.length})
              </h3>
              {recentObservations.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {recentObservations.map((obs) => (
                    <ObservationCard 
                      key={obs.id}
                      id={obs.id}
                      player_name={player.name}
                      date={obs.observation_date || obs.created_at}
                      content={obs.content}
                      coach_name={getCoachName(obs.coaches)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No observations yet.</p>
              )}
            </div>

            {/* Archived PDPs */}
            {archivedPDPs.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h3 className="text-oldgold font-semibold mb-3">
                  Archived PDPs ({archivedPDPs.length})
                </h3>
                <div className="space-y-4">
                  {archivedPDPs.map((pdp) => (
                    <div
                      key={pdp.id}
                      className="bg-slate-800 rounded-lg p-3 border border-slate-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-oldgold font-medium">
                          PDP from {formatDate(pdp.created_at)}
                        </h4>
                        <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Archived {formatDate(pdp.archived_at)}
                        </span>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 mb-3">
                        <p className="text-gray-200 whitespace-pre-wrap text-sm">{pdp.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          Coach: {getCoachName(pdp.coaches)}
                        </p>
                      </div>
                      
                      {pdp.observations.length > 0 && (
                        <>
                          <h5 className="text-oldgold font-medium mb-2 text-sm">
                            Observations in this PDP ({pdp.observations.length})
                          </h5>
                          <div className="grid md:grid-cols-2 gap-2">
                            {pdp.observations.map((obs) => (
                              <ObservationCard 
                                key={obs.id}
                                id={obs.id}
                                player_name={player.name}
                                date={obs.observation_date || obs.created_at}
                                content={obs.content}
                                coach_name={getCoachName(obs.coaches)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 