"use client";

import { createClient } from "@/lib/supabase/client";
import DeleteButton from "./DeleteButton";
import { toast } from "sonner";

export default function DeleteObservationButton({
  observationId,
}: {
  observationId: string;
}) {
  async function handleDelete() {
    const supabase = createClient();
    const { error } = await supabase
      .from("observations")
      .delete()
      .eq("id", observationId);
    if (error) {
      toast.error("Failed to delete observation");
    } else {
      toast.success("Observation deleted");
      // Optional: refetch
    }
  }

  return (
    <DeleteButton
      onConfirm={handleDelete}
      entity="Observation"
      description="This will permanently remove the observation from the system."
      iconOnly
    />
  );
} 