"use client";

import { createClient } from "@/lib/supabase/client";
import DeleteButton from "./DeleteButton";
import { toast } from "sonner";

export default function DeletePlayerButton({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
  async function handleDelete() {
    const supabase = createClient();
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) {
      toast.error(`Failed to delete ${playerName}`);
    } else {
      toast.success(`${playerName} deleted`);
      // Optional: trigger reload or refetch
      window.location.reload();
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
    />
  );
} 