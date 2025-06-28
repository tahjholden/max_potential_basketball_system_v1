"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Observation {
  id: string;
  content: string;
  archived?: boolean;
  archived_at?: string | null;
}

interface ArchiveObservationsModalProps {
  pdpId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ArchiveObservationsModal({ pdpId, open, onClose, onSuccess }: ArchiveObservationsModalProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchObservations = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("observations")
        .select("id, content, archived, archived_at")
        .eq("pdp_id", pdpId)
        .or("archived.is.null,archived.eq.false");
      if (error) {
        toast.error("Failed to fetch observations");
        return;
      }
      setObservations(data || []);
      setSelected(new Set((data || []).map((obs: Observation) => obs.id)));
      setSelectAll(true);
    };
    fetchObservations();
  }, [open, pdpId]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelected(new Set(observations.map((obs) => obs.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setSelectAll(next.size === observations.length);
      return next;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createClient();
    const now = new Date().toISOString();
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast.error("No observations selected");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("observations")
      .update({ 
        archived: true
      })
      .in("id", ids);
    setLoading(false);
    if (error) {
      toast.error("Failed to archive observations");
    } else {
      toast.success(`Archived ${ids.length} observation(s)`);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gold">Archive Observations</h2>
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span>Select All</span>
          </label>
          <div className="max-h-48 overflow-y-auto border rounded bg-zinc-800 p-2">
            {observations.length === 0 ? (
              <div className="text-zinc-400 text-sm">No active observations for this PDP.</div>
            ) : (
              observations.map((obs) => (
                <label key={obs.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selected.has(obs.id)}
                    onChange={() => handleToggle(obs.id)}
                  />
                  <span className="text-zinc-200 text-sm">{obs.content}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-zinc-600 text-white"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-gold text-black font-semibold"
            onClick={handleSubmit}
            disabled={loading || selected.size === 0}
          >
            {loading ? "Archiving..." : `Archive (${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
} 