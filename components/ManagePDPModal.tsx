"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { actionButtonClass } from "@/lib/utils";
import ArchiveCreateNewModal from "./ArchiveCreateNewModal";
import { useState } from "react";

export default function ManagePDPModal({
  playerId,
  playerName,
  onSuccess,
  buttonClassName,
}: {
  playerId: string;
  playerName: string;
  onSuccess?: () => void;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={buttonClassName || actionButtonClass}>
          Manage PDP
        </button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Manage PDP for <span className="text-yellow-300">{playerName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-zinc-300">
          Archive the current PDP and start fresh? Observations since the start
          of the current plan will be linked to it.
        </div>
        <div className="flex justify-end">
          <ArchiveCreateNewModal 
            playerId={playerId} 
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 