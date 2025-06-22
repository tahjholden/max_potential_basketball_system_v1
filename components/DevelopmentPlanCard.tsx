import { format } from "date-fns";

interface DevelopmentPlanCardProps {
  startDate: string | null;
  content: string | null;
}

export default function DevelopmentPlanCard({ startDate, content }: DevelopmentPlanCardProps) {
  if (!content) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
      <div className="text-xs text-zinc-400">
        Development Plan · Started {startDate ? format(new Date(startDate), "MMM dd, yyyy") : "—"}
      </div>
      <div className="text-sm text-zinc-100 whitespace-pre-line">
        {content}
      </div>
    </div>
  );
} 