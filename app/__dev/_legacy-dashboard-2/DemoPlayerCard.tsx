"use client";
import React from "react";

export default function DemoPlayerCard() {
  return (
    <div className="bg-[#1e293b] rounded-xl p-6 mb-6 shadow-md border border-slate-700 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl text-[#facc15] font-bold mb-4">Player: Dillon Rice</h2>

      <div className="text-sm text-gray-200 space-y-2 mb-6">
        <p><span className="font-semibold text-[#facc15]">PDP Summary:</span></p>
        <p className="text-gray-300 leading-relaxed">
          Dillon is a high-energy, instinct-driven mover whose game is built around speed and disruption.
          He thrives in transition but lacks pacing control, spatial sensitivity, and motor solutions under pressure.
          His athleticism and quick decision-making make him effective in open space, but he needs to develop
          better control and awareness in structured situations.
        </p>
      </div>

      <div>
        <h3 className="text-lg text-[#facc15] font-semibold mb-2">Observations</h3>
        <div className="divide-y divide-slate-700">
          {[
            { date: "6/9/2025", content: "Cole did a great job with his base shooting. His form was consistent and he showed good follow-through on his shots." },
            { date: "6/11/2025", content: "Cole had a great practice today. His energy was high and he was engaged throughout the session." },
            { date: "6/11/2025", content: "Cole did a tremendous job with his base and balance. He maintained proper form even when fatigued." },
          ].map((obs, index) => (
            <div key={index} className="py-3">
              <div className="text-sm text-gray-400">{obs.date}</div>
              <div className="text-white">{obs.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 