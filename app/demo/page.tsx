import DemoPlayerCard from "../protected/dashboard/DemoPlayerCard";

export default function DemoPage() {
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-xl shadow-lg p-6 max-w-4xl mx-auto mb-8 text-white">
      <div className="mb-4">
        <a href="/" className="text-sm text-yellow-400 hover:underline">← Back to Home</a>
      </div>

      <h1 className="text-2xl font-bold text-[#facc15] mb-2">Player: Dillon Rice</h1>
      <p className="text-gray-300 mb-6">PDP Summary:</p>

      <div className="text-gray-200 leading-relaxed mb-8">
        Dillon is a high-energy, instinct-driven mover whose game is built around speed and disruption.
        He thrives in transition but lacks pacing control, spatial sensitivity, and motor solutions under pressure.
        His athleticism and quick decision-making make him effective in open space, but he needs to develop
        better control and awareness in structured situations.
      </div>

      <h2 className="text-xl font-semibold text-[#facc15] mb-4">Observations</h2>

      <div className="space-y-4">
        {[
          {
            date: "6/9/2025",
            content: "Cole did a great job with his base shooting. His form was consistent and he showed good follow-through on his shots."
          },
          {
            date: "6/11/2025",
            content: "Cole had a great practice today. His energy was high and he was engaged throughout the session."
          },
          {
            date: "6/11/2025",
            content: "Cole did a tremendous job with his base and balance. He maintained proper form even when fatigued."
          },
        ].map((obs, idx) => (
          <div key={idx} className="bg-slate-800 p-4 rounded-md border border-slate-600">
            <div className="text-xs text-gray-400 mb-1">{obs.date}</div>
            <div className="text-sm text-gray-100">{obs.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 