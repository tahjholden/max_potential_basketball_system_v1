"use client";
import { useState } from "react";
import { ChevronDown, Edit, Archive, Plus } from "lucide-react";
import ArchiveAndReplaceButton from "./ArchiveAndReplaceButton";

interface ManagePDPMenuProps {
  playerId: string;
  onEdit?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export default function ManagePDPMenu({ 
  playerId, 
  onEdit, 
  onSuccess,
  className = ""
}: ManagePDPMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    setIsOpen(false);
    onEdit?.();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-yellow-400 underline hover:text-yellow-300 transition-colors"
      >
        Manage PDP
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#232323] border border-[#323232] rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-[#323232] rounded transition-colors"
            >
              <Edit size={14} />
              Edit PDP
            </button>
            
            <ArchiveAndReplaceButton
              playerId={playerId}
              onSuccess={() => {
                setIsOpen(false);
                onSuccess?.();
              }}
              variant="menu-item"
            />
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 