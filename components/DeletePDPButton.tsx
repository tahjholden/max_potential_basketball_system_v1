"use client";

import { createClient } from "@/lib/supabase/client";
import DeleteButton from "./DeleteButton";
import { toast } from "sonner";

export default function DeletePDPButton({
  pdpId,
}: {
  pdpId: string;
}) {
  async function handleDelete() {
    const supabase = createClient();
    const { error } = await supabase.from("pdp").delete().eq("id", pdpId);
    if (error) {
      toast.error("Failed to delete PDP");
    } else {
      toast.success("PDP deleted");
      // Optional: refresh PDP list
    }
  }

  return (
    <DeleteButton
      onConfirm={handleDelete}
      entity="PDP"
      description="This will permanently delete this PDP and unlink all references."
      iconOnly={false}
      label="Delete PDP"
    />
  );
} 