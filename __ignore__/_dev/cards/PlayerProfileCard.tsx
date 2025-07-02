import type { Player } from "@/types/entities";
import EntityMetadataCard from "@/components/ui/EntityMetadataCard";
import EmptyCard from "@/components/ui/EmptyCard";

export default function PlayerProfileCard({ player }: { player: Player | null }) {
  if (!player) return <EmptyCard title="Select a player to view their profile" />;

  return (
    <EntityMetadataCard
      fields={[
        { label: "Name", value: player.name, highlight: true },
        { label: "Joined", value: player.joined ?? "—" },
        ...(player.team_name ? [{ label: "Team", value: player.team_name }] : []),
      ]}
    />
  );
} 