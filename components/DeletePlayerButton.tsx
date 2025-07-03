"use client";

import { createClient } from "@/lib/supabase/client";
import DeleteButton from "./DeleteButton";
import { toast } from "sonner";

export default function DeletePlayerButton({
  playerId,
  playerName,
  triggerClassName,
  onDeleted,
}: {
  playerId: string;
  playerName: string;
  triggerClassName?: string;
  onDeleted?: () => void;
}) {
  async function handleDelete() {
    const supabase = createClient();
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) {
      toast.error(`Failed to delete ${playerName}`);
    } else {
      toast.success(`${playerName} deleted`);
      if (onDeleted) {
        onDeleted();
      } else {
        window.location.reload();
      }
    }
  }

  return (
    <DeleteButton
      onConfirm={handleDelete}
      entity="Player"
      description={`This will permanently delete ${playerName} and remove all linked data.`}
      iconOnly={false}
      label="Delete Player"
      confirmText={playerName}
      triggerClassName={triggerClassName}
    />
  );
} 