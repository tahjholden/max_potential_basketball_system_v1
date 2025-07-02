import React, { useState, useEffect, useMemo } from "react";
import PaneTitle from "@/components/PaneTitle";

export interface EntityListItem {
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
  renderItem?: (item: EntityListItem, isSelected: boolean) => React.ReactNode;
  teams?: { id: string; name: string }[];
  selectedTeamId?: string;
  setSelectedTeamId?: (id: string) => void;
}

const EntityListPane: React.FC<EntityListPaneProps> = ({
  title,
  items,
  selectedId,
  onSelect,
  actions,
  searchPlaceholder = "Search...",
  renderItem,
  teams = [],
  selectedTeamId = "",
  setSelectedTeamId = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<EntityListItem[]>([]);

  // Filter by team if applicable
  const teamFilteredItems = useMemo(() =>
    selectedTeamId ? items.filter((item) => item.team_id === selectedTeamId) : items,
    [items, selectedTeamId]
  );

  useEffect(() => {
    const filtered = teamFilteredItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [teamFilteredItems, searchTerm]);

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <PaneTitle>{title}</PaneTitle>
        {actions}
      </div>
      {teams.length > 0 && (
        <div className="mb-2">
          <select
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
            className="w-full h-10 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm mb-2"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 text-sm"
        />
      </div>
      <div className="space-y-2 max-h-96 pr-3 flex-1">
        {filteredItems.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-4">
            {searchTerm ? `No ${title.toLowerCase()} found.` : `No ${title.toLowerCase()} available.`}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect && onSelect(item.id)}
                className={`w-full text-left px-3 py-2 rounded mb-1 font-bold transition-colors duration-100 border-2 ${
                  isSelected
                    ? "bg-[#C2B56B] text-black border-[#C2B56B]"
                    : "bg-zinc-900 text-[#C2B56B] border-[#C2B56B]"
                }`}
              >
                {renderItem ? renderItem(item, isSelected) : item.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EntityListPane; 