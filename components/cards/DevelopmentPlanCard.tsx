import type { Pdp } from "@/types/entities";
import EntityMetadataCard from "@/components/ui/EntityMetadataCard";
import EmptyCard from "@/components/ui/EmptyCard";

export default function DevelopmentPlanCard({ pdp }: { pdp: Pdp | null }) {
  if (!pdp) return <EmptyCard title="No active development plan." />;

  return (
    <EntityMetadataCard
      fields={[
        { label: "Started", value: pdp.start_date ?? "—" },
        { label: "Plan", value: pdp.content ?? "No active plan." },
      ]}
    />
  );
} 