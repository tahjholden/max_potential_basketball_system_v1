"use client";

import React, { useState } from "react";
import PaneTitle from "@/components/PaneTitle";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/ui-utils";
import { Card } from "@/components/ui/card";
import EmptyState from "@/components/ui/EmptyState";
import { Archive } from "lucide-react";

interface ArchiveItem {
  id: string;
  title: string;
  summary: string;
  dateRange: string;
  archivedAt: string;
  status: "archived" | "deleted" | "expired";
  metadata?: Record<string, any>;
  children?: ArchiveItem[];
}

interface ArchivePaneProps {
  title: string;
  items: ArchiveItem[];
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  onItemClick?: (item: ArchiveItem) => void;
  onRestore?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  renderItemContent?: (item: ArchiveItem) => React.ReactNode;
  renderItemMetadata?: (item: ArchiveItem) => React.ReactNode;
  showActions?: boolean;
  className?: string;
  emptyStateMessage?: string;
  sortField?: "date" | "title" | "status";
}

export default function ArchivePane({
  title,
  items,
  sortOrder = "desc",
  onSortOrderChange,
  onItemClick,
  onRestore,
  onDelete,
  renderItemContent,
  renderItemMetadata,
  showActions = true,
  className = "",
  emptyStateMessage,
  sortField = "date"
}: ArchivePaneProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSortOrderChange = () => {
    if (onSortOrderChange) {
      onSortOrderChange(sortOrder === "desc" ? "asc" : "desc");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "archived":
        return "archived";
      case "deleted":
        return "danger";
      case "expired":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "archived":
        return "Archived";
      case "deleted":
        return "Deleted";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "date":
      default:
        aValue = new Date(a.archivedAt);
        bValue = new Date(b.archivedAt);
        break;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (sortedItems.length === 0) {
    return emptyStateMessage ? (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-8 flex flex-col items-center justify-center min-h-[120px]">
        <img
          src="/maxsM.png"
          alt="MP Shield"
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%',
            maxWidth: '220px',
            maxHeight: '120px',
            display: 'block',
            margin: '0 auto',
            filter: 'drop-shadow(0 2px 12px #2226)',
            opacity: 0.75,
            transform: 'scale(3)',
          }}
        />
        <div className="text-zinc-400 text-center font-semibold mt-4">{emptyStateMessage}</div>
      </div>
    ) : (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-8 flex flex-col items-center justify-center min-h-[120px]">
        <img
          src="/maxsM.png"
          alt="MP Shield"
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%',
            maxWidth: '220px',
            maxHeight: '120px',
            display: 'block',
            margin: '0 auto',
            filter: 'drop-shadow(0 2px 12px #2226)',
            opacity: 0.75,
            transform: 'scale(3)',
          }}
        />
        <div className="text-zinc-400 text-center font-semibold mt-4">No archived plans found.</div>
      </div>
    );
  }
  return (
    <div className={`bg-zinc-900 p-4 rounded-md shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <PaneTitle>{title}</PaneTitle>
        {onSortOrderChange && (
          <button
            onClick={handleSortOrderChange}
            className="text-xs px-3 py-1 border border-zinc-600 rounded text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {sortedItems.map((item) => (
          <div key={item.id} className="bg-zinc-800 p-3 rounded text-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-[#C2B56B] font-semibold">{item.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {showActions && onRestore && (
                  <button
                    onClick={() => onRestore(item.id)}
                    className="text-xs px-2 py-1 border border-gold text-gold rounded hover:bg-gold/10 transition-colors"
                  >
                    Restore
                  </button>
                )}
                {showActions && onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-xs px-2 py-1 border border-red-500 text-red-400 rounded hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
                {(renderItemContent || item.children) && (
                  <button
                    onClick={() => toggleItemExpansion(item.id)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-zinc-300 text-xs">{item.summary}</p>
              <p className="text-zinc-500 text-xs">
                {formatDate(item.archivedAt)}
              </p>
            </div>
            {expandedItems.has(item.id) && renderItemContent && (
              <div className="mt-2">
                {renderItemContent(item)}
              </div>
            )}
            {expandedItems.has(item.id) && item.children && item.children.length > 0 && (
              <div className="mt-2">
                {item.children.map(child => (
                  <div key={child.id} className="bg-zinc-900 p-2 rounded text-xs mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-zinc-400">
                        {formatDate(child.archivedAt)}
                      </span>
                    </div>
                    <p className="text-zinc-300">{child.summary}</p>
                  </div>
                ))}
              </div>
            )}
            {renderItemMetadata && (
              <div className="mt-2">
                {renderItemMetadata(item)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Convenience components for specific archive types
export function PDPArchivePane({
  pdps,
  sortOrder,
  onSortOrderChange,
  onRestore,
  onDelete,
}: {
  pdps: any[];
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  onRestore?: (pdpId: string) => void;
  onDelete?: (pdpId: string) => void;
}) {
  if (!pdps || pdps.length === 0) {
    return (
      <Card className="bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-5 shadow-lg flex items-center justify-center min-h-[160px]">
        <EmptyState
          icon={Archive}
          title="No Archived Plans"
          description="There are no archived development plans to display."
          className="[&_.text-lg]:text-[#C2B56B] [&_.text-lg]:font-bold [&_.text-zinc-400]:font-medium"
        />
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-[#C2B56B]">PDP Archive</span>
        {onSortOrderChange && (
          <button
            onClick={() => onSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
            className="text-xs px-3 py-1 border border-zinc-600 rounded text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        )}
      </div>
      {pdps.map((pdp) => (
        <Card key={pdp.id} className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 shadow flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#C2B56B] font-semibold text-sm">{pdp.dateRange}</span>
          </div>
          <div className="text-zinc-300 text-xs mb-1">{pdp.summary.replace(/\s*\d{4,4}.*$/, "")}</div>
          {pdp.observations && pdp.observations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wide">Observations ({pdp.observations.length})</div>
              <div className="flex flex-col gap-1">
                {pdp.observations.map((obs: any) => (
                  <div key={obs.id} className="bg-zinc-900 p-2 rounded text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-zinc-400">{formatDate(obs.observation_date)}</span>
                    </div>
                    <p className="text-zinc-300">{obs.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function ObservationArchivePane({
  observations,
  sortOrder,
  onSortOrderChange,
  onRestore,
  onDelete,
}: {
  observations: any[];
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  onRestore?: (obsId: string) => void;
  onDelete?: (obsId: string) => void;
}) {
  const formatObservationItems = (observations: any[]): ArchiveItem[] => {
    return observations.map(obs => ({
      id: obs.id,
      title: `Observation - ${obs.player_name || 'Unknown Player'}`,
      summary: obs.content,
      dateRange: formatDate(obs.observation_date),
      archivedAt: obs.created_at,
      status: "archived" as const,
      metadata: {
        playerName: obs.player_name,
        coachName: obs.coach_name,
      }
    }));
  };

  const renderObservationMetadata = (item: ArchiveItem) => {
    if (item.metadata) {
      return (
        <div className="text-xs text-zinc-500 space-y-1">
          {item.metadata.playerName && (
            <div>Player: {item.metadata.playerName}</div>
          )}
          {item.metadata.coachName && (
            <div>Coach: {item.metadata.coachName}</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ArchivePane
      title="Observation Archive"
      items={formatObservationItems(observations)}
      sortOrder={sortOrder}
      onSortOrderChange={onSortOrderChange}
      onRestore={onRestore}
      onDelete={onDelete}
      renderItemMetadata={renderObservationMetadata}
      emptyStateMessage="No archived observations found."
    />
  );
} 