"use client";

import React, { useState } from "react";
import PaneTitle from "@/components/PaneTitle";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import { NoArchivedPDPsEmptyState } from "./EmptyState";

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
        {sortedItems.length === 0 ? (
          emptyStateMessage ? (
            <div className="text-zinc-500 text-sm text-center py-4">
              {emptyStateMessage}
            </div>
          ) : (
            <NoArchivedPDPsEmptyState />
          )
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} className="bg-zinc-800 p-3 rounded text-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-[#d8cc97] font-semibold">{item.title}</p>
                  <StatusBadge 
                    variant={getStatusVariant(item.status)} 
                    size="sm" 
                    showIcon
                  >
                    {getStatusLabel(item.status)}
                  </StatusBadge>
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
                  {format(new Date(item.archivedAt), "MMM dd, yyyy")}
                </p>
              </div>

              {/* Custom metadata */}
              {renderItemMetadata && renderItemMetadata(item)}

              {/* Expandable content */}
              {expandedItems.has(item.id) && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  {renderItemContent ? (
                    renderItemContent(item)
                  ) : item.children && item.children.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                        Related Items ({item.children.length})
                      </h4>
                      <div className="space-y-2">
                        {item.children.map((child) => (
                          <div key={child.id} className="bg-zinc-900 p-2 rounded text-xs">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-zinc-400 font-medium">{child.title}</span>
                              <span className="text-zinc-500">
                                {format(new Date(child.archivedAt), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <p className="text-zinc-300">{child.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
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
  const formatPDPItems = (pdps: any[]): ArchiveItem[] => {
    return pdps.map(pdp => ({
      id: pdp.id,
      title: pdp.dateRange,
      summary: pdp.summary,
      dateRange: pdp.dateRange,
      archivedAt: pdp.archived_at || pdp.created_at,
      status: "archived" as const,
      children: pdp.observations?.map((obs: any) => ({
        id: obs.id,
        title: `Observation - ${format(new Date(obs.observation_date), "MMM dd, yyyy")}`,
        summary: obs.content,
        dateRange: format(new Date(obs.observation_date), "MMM dd, yyyy"),
        archivedAt: obs.created_at,
        status: "archived" as const,
      })) || []
    }));
  };

  const renderPDPContent = (item: ArchiveItem) => {
    if (item.children && item.children.length > 0) {
      return (
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
            Observations ({item.children.length})
          </h4>
          <div className="space-y-2">
            {item.children.map((obs) => (
              <div key={obs.id} className="bg-zinc-900 p-2 rounded text-xs">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-zinc-400">
                    {format(new Date(obs.archivedAt), "MMM dd, yyyy")}
                  </span>
                </div>
                <p className="text-zinc-300">{obs.summary}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ArchivePane
      title="PDP Archive"
      items={formatPDPItems(pdps)}
      sortOrder={sortOrder}
      onSortOrderChange={onSortOrderChange}
      onRestore={onRestore}
      onDelete={onDelete}
      renderItemContent={renderPDPContent}
      emptyStateMessage="No archived plans found."
    />
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
      dateRange: format(new Date(obs.observation_date), "MMM dd, yyyy"),
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