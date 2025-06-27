import React, { useState, useEffect, useMemo } from "react";
import PaneTitle from "@/components/PaneTitle";
import { SearchEmptyState } from "@/components/ui/EmptyState";

interface EntityListItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface EntityListPaneProps {
  title: string;
  items: EntityListItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  renderItem?: (item: EntityListItem, selected: boolean) => React.ReactNode;
  showSearch?: boolean;
  className?: string;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const EntityListPane: React.FC<EntityListPaneProps> = ({
  title,
  items,
  selectedId,
  onSelect,
  actions,
  searchPlaceholder = "Search...",
  renderItem,
  showSearch = true,
  className = "",
  footer,
  headerActions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<EntityListItem[]>(items);

  useEffect(() => {
    setFilteredItems(
      items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [items, searchTerm]);

  return (
    <div 
      className={`bg-zinc-900 p-4 rounded-lg border border-zinc-700 ${className}`} 
      style={{ 
        height: '600px', 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '600px',
        maxHeight: '600px'
      }}
    >
      {/* Header - Fixed */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <PaneTitle>{title}</PaneTitle>
        {headerActions || actions}
      </div>
      
      {/* Scrollable Content Area - Takes remaining space */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ 
          minHeight: 0,
          maxHeight: 'calc(600px - 120px)' // Account for header and footer
        }}
      >
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            searchTerm ? (
              <SearchEmptyState searchTerm={searchTerm} />
            ) : (
              <div className="text-zinc-500 text-sm text-center py-4">
                No {title.toLowerCase()} available.
              </div>
            )
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedId === item.id;
              return renderItem ? (
                renderItem(item, isSelected)
              ) : (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => onSelect && onSelect(item.id)}
                    className={`w-full text-left px-4 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2 ${
                      isSelected
                        ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                        : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B]"
                    }`}
                  >
                    {item.name}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Footer - Fixed */}
      {footer ? (
        <div className="mt-4 flex-shrink-0">{footer}</div>
      ) : showSearch && (
        <div className="mt-4 flex-shrink-0">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default EntityListPane; 