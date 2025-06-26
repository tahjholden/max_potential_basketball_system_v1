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
    <div className={`bg-zinc-900 p-4 rounded-md shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <PaneTitle>{title}</PaneTitle>
        {actions}
      </div>
      {showSearch && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
          />
        </div>
      )}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-3">
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
                  className={`w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2 ${
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
  );
};

export default EntityListPane; 