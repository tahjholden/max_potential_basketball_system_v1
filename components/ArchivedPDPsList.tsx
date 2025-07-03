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

  useEffect(() => {
    fetchArchivedPDPs();
  }, [playerId, orgId]);

  const fetchArchivedPDPs = async () => {
    try {
      setLoading(true);
      const data = await getArchivedPDPsWithObservations(playerId, orgId);
      setArchivedPDPs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch archived PDPs");
    } finally {
      setLoading(false);
    }
  };

  const togglePDPExpansion = (pdpId: string) => {
    const newExpanded = new Set(expandedPDPs);
    if (newExpanded.has(pdpId)) {
      newExpanded.delete(pdpId);
    } else {
      newExpanded.add(pdpId);
    }
    setExpandedPDPs(newExpanded);
  };

  const getCoachName = (coaches?: { first_name: string; last_name: string }[]) => {
    if (!coaches || coaches.length === 0) return "Unknown Coach";
    const coach = coaches[0]; // Take the first coach
    return `${coach.first_name} ${coach.last_name}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM do, yyyy");
    } catch {
      return "Invalid date";
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#C2B56B]">
          Archived Development Plans ({archivedPDPs.length})
        </h3>
      </div>

      {archivedPDPs.map((pdp) => (
        <Card key={pdp.id} className="bg-zinc-800 border border-zinc-700 overflow-hidden">
          {/* PDP Header */}
          <div 
            className="p-4 cursor-pointer hover:bg-zinc-750 transition-colors"
            onClick={() => togglePDPExpansion(pdp.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">
                    {formatDate(pdp.start_date)} - {pdp.end_date ? formatDate(pdp.end_date) : "Ongoing"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-400">
                    Created by {getCoachName(pdp.coaches)}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 line-clamp-2">
                  {pdp.content || "No content"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  {pdp.observations.length} observation{pdp.observations.length !== 1 ? 's' : ''}
                </span>
                {expandedPDPs.has(pdp.id) ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                )}
              </div>
            </div>
          </div>

          {/* PDP Content and Observations */}
          {expandedPDPs.has(pdp.id) && (
            <div className="border-t border-zinc-700 bg-zinc-850">
              {/* PDP Content */}
              <div className="p-4 border-b border-zinc-700">
                <h4 className="text-sm font-semibold text-[#C2B56B] mb-2">Development Plan Content</h4>
                <div className="bg-zinc-900 p-3 rounded text-sm text-zinc-300 whitespace-pre-wrap">
                  {pdp.content || "No content available"}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                  <span>Archived: {formatDate(pdp.archived_at)}</span>
                  <span>Created: {formatDate(pdp.created_at)}</span>
                </div>
              </div>

              {/* Observations */}
              {pdp.observations.length > 0 ? (
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-[#C2B56B] mb-3">
                    Observations ({pdp.observations.length})
                  </h4>
                  <div className="space-y-3">
                    {pdp.observations.map((observation) => (
                      <div key={observation.id} className="bg-zinc-900 p-3 rounded border border-zinc-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-400">
                            {formatDate(observation.observation_date || observation.created_at)}
                          </span>
                          <span className="text-xs text-zinc-500">
                            by {getCoachName(observation.coaches)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300">{observation.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                          <span>Archived: {formatDate(observation.archived_at)}</span>
                          <span>Created: {formatDate(observation.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-zinc-500 italic">No observations linked to this plan</p>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 