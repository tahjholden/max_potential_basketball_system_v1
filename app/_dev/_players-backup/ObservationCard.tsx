"use client";

interface ObservationCardProps {
  id: string;
  player_name: string;
  date: string;
  content: string;
  coach_name?: string;
}

export default function ObservationCard({ 
  player_name, 
  date, 
  content, 
  coach_name 
}: ObservationCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-md text-sm text-gray-100 space-y-2">
      <div className="flex justify-between items-center text-gold font-semibold">
        <span>{player_name}</span>
        <span className="text-xs text-gray-400">{formatDate(date)}</span>
      </div>
      <p className="text-gray-200 line-clamp-3">{content}</p>
      {coach_name && (
        <p className="text-xs text-gray-500">Coach: {coach_name}</p>
      )}
    </div>
  );
} 