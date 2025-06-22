import { format } from "date-fns";
import PaneTitle from "@/components/PaneTitle";

interface DevelopmentPlanCardProps {
  startDate: string | null;
  content: string | null;
}

export default function DevelopmentPlanCard({ startDate, content }: DevelopmentPlanCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <PaneTitle>Development Plan</PaneTitle>
        <div className="text-xs text-zinc-400">
          Started {startDate ? format(new Date(startDate), "MMM dd, yyyy") : "—"}
        </div>
      </div>
      <div className="text-sm text-zinc-100 whitespace-pre-line pt-2">
        {content || "No active plan."}
      </div>
    </div>
  );
} 