"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getArchivedPDPsWithObservations } from "@/lib/archivePDPAndObservations";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Calendar, User, FileText } from "lucide-react";

interface ArchivedPDP {
  id: string;
  content: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  archived_at: string;
  archived_by: string;
  created_by: string;
  coaches?: {
    first_name: string;
    last_name: string;
  }[];
  observations: ArchivedObservation[];
}

interface ArchivedObservation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  archived_at: string;
  archived_by: string;
  created_by: string;
  coaches?: {
    first_name: string;
    last_name: string;
  }[];
}

interface ArchivedPDPsListProps {
  playerId: string;
  orgId: string;
  className?: string;
}

export default function ArchivedPDPsList({ playerId, orgId, className = "" }: ArchivedPDPsListProps) {
  const [archivedPDPs, setArchivedPDPs] = useState<ArchivedPDP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPDPs, setExpandedPDPs] = useState<Set<string>>(new Set());
  const [expandedObservations, setExpandedObservations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!playerId || !orgId) {
      setError("Missing player or organization ID.");
      setArchivedPDPs([]);
      setLoading(false);
      return;
    }
    fetchArchivedPDPs();
  }, [playerId, orgId]);

  const fetchArchivedPDPs = async () => {
    if (!playerId || !orgId) {
      setError("Missing player or organization ID.");
      setArchivedPDPs([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getArchivedPDPsWithObservations(playerId, orgId);
      console.log("Fetched archived PDPs with observations:", data);
      setArchivedPDPs(
        (data || []).map((pdp: any) => ({
          id: pdp.id,
          content: pdp.content,
          start_date: pdp.start_date,
          end_date: pdp.end_date || "",
          created_at: pdp.created_at,
          archived_at: pdp.archived_at,
          archived_by: pdp.archived_by || "",
          created_by: pdp.created_by || "",
          coaches: pdp.coaches || [],
          observations: pdp.observations || [],
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch archived PDPs");
    } finally {
      setLoading(false);
    }
  };

  const togglePDPContent = (pdpId: string) => {
    setExpandedPDPs(prev => {
      const next = new Set(prev);
      next.has(pdpId) ? next.delete(pdpId) : next.add(pdpId);
      return next;
    });
  };
  const toggleObservations = (pdpId: string) => {
    setExpandedObservations(prev => {
      const next = new Set(prev);
      next.has(pdpId) ? next.delete(pdpId) : next.add(pdpId);
      return next;
    });
  };

  const getCoachName = (coaches?: { first_name: string; last_name: string }[]) => {
    if (!coaches || coaches.length === 0) return "Unknown Coach";
    const coach = coaches[0]; // Take the first coach
    return `${coach.first_name} ${coach.last_name}`;
  };

  const shortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "M/d/yy");
    } catch {
      return "--";
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-zinc-400">Loading archived plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-900/20 border border-red-700 rounded-lg ${className}`}>
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (archivedPDPs.length === 0) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#C2B56B] mb-2">No Archived Plans</h3>
        <p className="text-zinc-400 text-sm">
          When you archive a development plan, it will appear here along with its observations.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {archivedPDPs.map((pdp) => {
        const devPlanExpanded = expandedPDPs.has(pdp.id);
        const obsExpanded = expandedObservations.has(pdp.id);
        return (
          <div key={pdp.id} className="mb-4 px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-900">
            {/* Top Row: Date Range + Chevron (one line) */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePDPContent(pdp.id)}>
              <div className="text-sm text-[#C2B56B] font-medium truncate max-w-[75%]">
                {shortDate(pdp.start_date)} – {shortDate(pdp.end_date || pdp.archived_at)}
              </div>
              {devPlanExpanded
                ? <ChevronDown className="w-5 h-5 text-zinc-400" />
                : <ChevronRight className="w-5 h-5 text-zinc-400" />
              }
            </div>
            {/* Dev Plan Content and Observations Chevron */}
            {devPlanExpanded && (
              <>
                <div className="bg-zinc-950 rounded mt-2 mb-2 p-3 text-sm text-zinc-300">{pdp.content}</div>
                <div className="flex items-center justify-between cursor-pointer mt-2" onClick={() => toggleObservations(pdp.id)}>
                  <div className="text-xs text-zinc-400">
                    {pdp.observations.length} observation{pdp.observations.length !== 1 && "s"}
                  </div>
                  {obsExpanded
                    ? <ChevronDown className="w-4 h-4 text-zinc-400" />
                    : <ChevronRight className="w-4 h-4 text-zinc-400" />
                  }
                </div>
                {obsExpanded && (
                  <div className="divide-y divide-zinc-800 mt-2">
                    {pdp.observations.length === 0 ? (
                      <div className="italic text-xs text-zinc-500 p-2">No observations linked to this plan</div>
                    ) : (
                      pdp.observations.map(obs => (
                        <div key={obs.id} className="flex items-center gap-2 py-2">
                          <span className="text-xs text-zinc-500 w-28">{shortDate(obs.observation_date)}</span>
                          <span className="text-sm text-zinc-300">{obs.content}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
} 