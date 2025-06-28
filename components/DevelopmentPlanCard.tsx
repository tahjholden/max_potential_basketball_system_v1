// Archived: The original DevelopmentPlanCard has been moved to _dev/DevelopmentPlanCard.archived.tsx for historical reference. Do not use in production.

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DevelopmentPlanCardProps {
  plan: string;
  started: string;
  onEdit?: () => void;
  onArchive?: () => void;
}

const DevelopmentPlanCard: React.FC<DevelopmentPlanCardProps> = ({
  plan,
  started,
  onEdit,
  onArchive,
}) => (
  <Card className="mb-4">
    <CardHeader className="flex flex-row items-center justify-between mb-2">
      <CardTitle>
        <span className="text-lg font-semibold text-neutral-200">
          Development Plan
        </span>
        <span className="ml-3 text-zinc-400 text-sm font-normal">
          Started: {started}
        </span>
      </CardTitle>
      <div className="flex gap-2">
        {onEdit && (
          <button
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm font-medium text-neutral-200 hover:bg-zinc-700"
            onClick={onEdit}
          >
            Edit Plan
          </button>
        )}
        {onArchive && (
          <button
            className="rounded border border-[#C2B56B] bg-transparent px-3 py-1 text-sm font-medium text-[#C2B56B] hover:bg-zinc-900"
            onClick={onArchive}
          >
            Archive & Create New
          </button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-zinc-300 text-base">{plan}</div>
    </CardContent>
  </Card>
);

export default DevelopmentPlanCard; 