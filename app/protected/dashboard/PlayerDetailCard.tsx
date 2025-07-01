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
    <div className="bg-[#161616] min-h-screen p-6 font-sans text-[#f5f5f7]">
      <div className="bg-[#232323] border border-[#323232] rounded-xl shadow-lg p-6 max-w-4xl mx-auto mb-8">
        <a href="/" className="text-sm text-[#d8cc97] hover:underline mb-4 block">← Back to Home</a>

        <h1 className="text-2xl font-bold text-[#d8cc97] mb-2">Player: {playerName}</h1>
        <p className="text-[#b0b0b0] mb-4">PDP Summary:</p>

        <p className="text-[#d8cc97] mb-6 leading-relaxed">
          {playerPDP ? (
            playerPDP.content
          ) : (
            <span className="text-[#b0b0b0] italic">No PDP available for this player.</span>
          )}
        </p>

        <h2 className="text-lg font-bold text-[#d8cc97] mb-3">Observations</h2>

        <div className="space-y-4">
          {playerObservations.map((obs, index) => (
            <div key={obs.id || index} className="bg-[#232323] p-4 rounded-md border border-[#323232]">
              <div className="text-xs text-[#b0b0b0] mb-1">
                {obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : 'No date'}
              </div>
              <div className="text-sm text-[#f5f5f7]">{obs.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 