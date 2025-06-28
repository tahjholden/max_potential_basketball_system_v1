"use client";
import React from "react";

interface PlayerDetailCardProps {
  player: any;
  playerPDP: any;
  playerObservations: any[];
}

export default function PlayerDetailCard({ player, playerPDP, playerObservations }: PlayerDetailCardProps) {
  const playerName = player.first_name && player.last_name 
    ? `${player.first_name} ${player.last_name}` 
    : player.name || `Player ${player.id}`;

  return (
    <div className="bg-[#0f172a] min-h-screen p-6 font-sans text-white">
      <div className="bg-[#1e293b] border border-slate-700 rounded-xl shadow-lg p-6 max-w-4xl mx-auto mb-8">
        <a href="/" className="text-sm text-yellow-400 hover:underline mb-4 block">← Back to Home</a>

        <h1 className="text-2xl font-bold text-[#facc15] mb-2">Player: {playerName}</h1>
        <p className="text-gray-300 mb-4">PDP Summary:</p>

        <p className="text-gray-200 mb-6 leading-relaxed">
          {playerPDP ? (
            playerPDP.content
          ) : (
            <span className="text-gray-400 italic">No PDP available for this player.</span>
          )}
        </p>

        <h2 className="text-xl font-semibold text-[#facc15] mb-3">Observations</h2>

        <div className="space-y-4">
          {playerObservations.map((obs, index) => (
            <div key={obs.id || index} className="bg-slate-800 p-4 rounded-md border border-slate-600">
              <div className="text-xs text-gray-400 mb-1">
                {obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : 'No date'}
              </div>
              <div className="text-sm text-gray-100">{obs.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 