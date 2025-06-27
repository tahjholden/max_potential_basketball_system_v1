"use client";

import { useState } from "react";

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
  player_name?: string;
}

interface CoachObservationsPaneProps {
  coach: Coach;
  observations: Observation[];
}

export default function CoachObservationsPane({ coach, observations }: CoachObservationsPaneProps) {
  const [showAll, setShowAll] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show only last 5 observations initially, or all if expanded
  const displayedObservations = showAll ? observations : observations.slice(0, 5);
  const hasMoreObservations = observations.length > 5;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Observations</h3>
        <div className="text-sm text-zinc-400">
          {observations.length} observation{observations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {observations.length === 0 ? (
        <div className="text-center py-8">
          <h4 className="text-lg font-medium text-zinc-400 mb-2">
            No Recent Observations
          </h4>
          <p className="text-sm text-zinc-500">
            {coach.first_name} hasn't made any observations yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedObservations.map((observation) => (
            <div
              key={observation.id}
              className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {observation.player_name || 'Unknown Player'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>{formatDate(observation.observation_date)}</span>
                  <span>•</span>
                  <span>{formatTime(observation.created_at)}</span>
                </div>
              </div>
              
              <div className="text-sm text-zinc-300 leading-relaxed">
                {observation.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMoreObservations && (
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="w-full border border-[#C2B56B] text-sm px-4 py-2 rounded font-semibold text-[#C2B56B] hover:bg-[#C2B56B]/10 transition"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        </div>
      )}
    </div>
  );
}