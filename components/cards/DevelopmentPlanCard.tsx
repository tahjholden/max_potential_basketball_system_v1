import type { Pdp } from "@/types/entities";
import EntityMetadataCard from "@/components/ui/EntityMetadataCard";
import EmptyCard from "@/components/ui/EmptyCard";
import ManagePDPModal from "@/components/ManagePDPModal";
import EditPDPModal from "@/components/EditPDPModal";
import React, { useState } from "react";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { OutlineButton } from "@/components/ui/gold-outline-button";
import Image from "next/image";
import maxsM from "@/public/maxsM.png";
import EntityButton from "@/components/EntityButton";
import EmptyState, { NoPDPsEmptyState } from "@/components/ui/EmptyState";
const CreatePDPModal = dynamic(() => import("@/components/CreatePDPModal"), { ssr: false });

export default function DevelopmentPlanCard({ pdp, playerId, playerName, onPdpUpdate }: { pdp: Pdp | null, playerId: string, playerName: string, onPdpUpdate?: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  if (!pdp) return (
    <>
      <NoPDPsEmptyState onCreatePDP={() => setCreateOpen(true)} />
      <CreatePDPModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        player={{ id: playerId, name: playerName }}
        onCreated={() => {
          setCreateOpen(false);
          onPdpUpdate?.();
        }}
      />
    </>
  );

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
        <button className="text-xs text-[#C2B56B] underline hover:text-[#b3a04e] bg-transparent border-none p-0 m-0 shadow-none cursor-pointer" type="button" onClick={() => setEditOpen(true)}>
          Edit PDP
        </button>
        <ManagePDPModal
          playerId={playerId}
          playerName={playerName}
          buttonClassName="text-xs text-zinc-400 underline hover:text-zinc-200 bg-transparent border-none p-0 m-0 shadow-none cursor-pointer"
        />
      </div>
      <EditPDPModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        player={{ id: playerId, name: playerName }}
        currentPdp={{ id: pdp.id, content: pdp.content, start_date: pdp.start_date }}
        onSuccess={() => {
          setEditOpen(false);
          onPdpUpdate?.();
        }}
      />
    </div>
  );
} 