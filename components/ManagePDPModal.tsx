"use client";

import { Modal } from "@/components/ui/UniversalModal";
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
    <>
      <button 
        className={buttonClassName || actionButtonClass}
        onClick={() => setOpen(true)}
      >
        Manage PDP
      </button>
      <Modal.Info
        open={open}
        onOpenChange={setOpen}
        title={`Manage PDP for ${playerName}`}
        description="Archive the current PDP and start fresh? Observations since the start of the current plan will be linked to it."
      >
        <div className="flex justify-end">
          <ArchiveCreateNewModal 
            playerId={playerId} 
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        </div>
      </Modal.Info>
    </>
  );
} 