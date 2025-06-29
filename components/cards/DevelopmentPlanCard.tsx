import type { Pdp } from "@/types/entities";
import EntityMetadataCard from "@/components/ui/EntityMetadataCard";
import EmptyCard from "@/components/ui/EmptyCard";
import ManagePDPModal from "@/components/ManagePDPModal";
import React from "react";

export default function DevelopmentPlanCard({ pdp, playerId, playerName }: { pdp: Pdp | null, playerId: string, playerName: string }) {
  if (!pdp) return <EmptyCard title="No active development plan." />;

  return (
    <EntityMetadataCard
      fields={[
        { label: "Started", value: pdp.start_date ?? "—" },
        { label: "Plan", value: pdp.content ?? "No active plan." },
        {
          label: "",
          value: (
            <div className="flex w-full justify-end">
              <ManagePDPModal
                playerId={playerId}
                playerName={playerName}
                buttonClassName="text-xs text-[#C2B56B] underline hover:text-[#b3a04e] bg-transparent border-none p-0 m-0 shadow-none cursor-pointer"
              />
            </div>
          ),
        },
      ]}
    />
  );
} 