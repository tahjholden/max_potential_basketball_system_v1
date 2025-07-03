"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/UniversalModal";
import UniversalButton from "@/components/ui/UniversalButton";

interface Observation {
  id: string;
  content: string;
  archived?: boolean;
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
        .select("id, content, archived")
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

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal.Archive
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title="Archive Observations"
      description={`Select the observations you want to archive. You can restore them later.`}
      onConfirm={handleSubmit}
      confirmText={loading ? "Archiving..." : `Archive (${selected.size})`}
      cancelText="Cancel"
      loading={loading}
    >
      <div className="space-y-4">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="select-all"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-800 text-[#C2B56B] focus:ring-[#C2B56B] focus:ring-offset-zinc-900"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-zinc-300">
            Select All ({observations.length})
          </label>
        </div>

        {/* Observations List */}
        <div className="max-h-48 overflow-y-auto border border-zinc-700 rounded-lg bg-zinc-800 p-3 space-y-2">
          {observations.length === 0 ? (
            <div className="text-zinc-400 text-sm text-center py-4">
              No active observations for this PDP.
            </div>
          ) : (
            observations.map((obs) => (
              <label key={obs.id} className="flex items-start gap-3 p-2 rounded hover:bg-zinc-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={selected.has(obs.id)}
                  onChange={() => handleToggle(obs.id)}
                  className="mt-0.5 rounded border-zinc-600 bg-zinc-800 text-[#C2B56B] focus:ring-[#C2B56B] focus:ring-offset-zinc-900"
                />
                <span className="text-zinc-200 text-sm leading-relaxed flex-1">
                  {obs.content}
                </span>
              </label>
            ))
          )}
        </div>

        {/* Summary */}
        {observations.length > 0 && (
          <div className="text-xs text-zinc-400 text-center">
            {selected.size} of {observations.length} observations selected
          </div>
        )}
      </div>
    </Modal.Archive>
  );
} 