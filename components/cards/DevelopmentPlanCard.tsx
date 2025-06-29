import type { Pdp } from "@/types/entities";
import EntityMetadataCard from "@/components/ui/EntityMetadataCard";
import EmptyCard from "@/components/ui/EmptyCard";
import ManagePDPModal from "@/components/ManagePDPModal";
import React from "react";
import { format } from "date-fns";

export default function DevelopmentPlanCard({ pdp, playerId, playerName }: { pdp: Pdp | null, playerId: string, playerName: string }) {
  if (!pdp) return <EmptyCard title="No active development plan." />;

  let formattedStart = "—";
  if (pdp.start_date) {
    try {
      formattedStart = format(new Date(pdp.start_date), "MMMM do, yyyy");
    } catch {}
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="mb-2 text-sm text-zinc-500">Started: <span className="text-zinc-300">{formattedStart}</span></div>
      <div className="text-zinc-300 text-base text-left whitespace-pre-line mb-4">{pdp.content ?? "No active plan."}</div>
      <hr className="border-zinc-700 my-2" />
      <div className="flex w-full justify-end gap-4">
        <button className="text-xs text-[#C2B56B] underline hover:text-[#b3a04e] bg-transparent border-none p-0 m-0 shadow-none cursor-pointer" type="button">
          Edit PDP
        </button>
        <ManagePDPModal
          playerId={playerId}
          playerName={playerName}
          buttonClassName="text-xs text-[#C2B56B] underline hover:text-[#b3a04e] bg-transparent border-none p-0 m-0 shadow-none cursor-pointer"
        />
      </div>
    </div>
  );
} 