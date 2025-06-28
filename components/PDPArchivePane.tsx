"use client";

import { PDPArchivePane as GenericPDPArchivePane } from "@/components/ui/ArchivePane";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

interface ArchivedPDP {
  id: string;
  dateRange: string;
  summary: string;
  archived_at?: string;
  created_at: string;
  observations?: Observation[];
}

interface PDPArchivePaneProps {
  pdps: ArchivedPDP[];
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  onRestore?: (pdpId: string) => void;
  onDelete?: (pdpId: string) => void;
}

export default function PDPArchivePane({
  pdps,
  sortOrder,
  onSortOrderChange,
  onRestore,
  onDelete,
}: PDPArchivePaneProps) {
  return (
    <GenericPDPArchivePane
      pdps={pdps}
      sortOrder={sortOrder}
      onSortOrderChange={onSortOrderChange}
      onRestore={onRestore}
      onDelete={onDelete}
    />
  );
} 