import Link from "next/link";

type Player = {
  id: string;
  name: string;
  position?: string;
  created_at: string;
  last_pdp_date?: string;
  has_active_pdp?: boolean;
  pdpStatus?: string;
};

interface PlayerCardProps {
  player: Player;
  onView: () => void;
}

export default function PlayerCard({ player, onView }: PlayerCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  const getPDPStatus = () => {
    if (player.has_active_pdp) {
      return { text: "Active", color: "text-green-400" };
    }
    return { text: "Needs Update", color: "text-red-400" };
  };

  const pdpStatus = getPDPStatus();

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 shadow-md text-white flex flex-col justify-between hover:border-slate-500 transition-colors">
      <div>
        <h3 className="text-gold font-semibold text-lg">{player.name}</h3>
        <p className="text-gray-400 text-sm">
          Position: {player.position || "N/A"}
        </p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            player.pdpStatus === "Active"
              ? "bg-green-600 text-white"
              : "bg-gold text-black"
          }`}
        >
          {player.pdpStatus === "Active" ? "PDP Active" : "PDP Missing"}
        </span>
        {player.last_pdp_date && (
          <p className="text-gray-500 text-xs mt-1">
            Last PDP: {formatDate(player.last_pdp_date)}
          </p>
        )}
      </div>
      <button
        onClick={onView}
        className="mt-4 bg-gold text-black px-4 py-2 rounded hover:bg-gold/80 text-sm font-bold text-center transition-colors"
      >
        View
      </button>
    </div>
  );
} 