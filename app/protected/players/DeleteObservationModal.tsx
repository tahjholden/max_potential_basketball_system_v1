import { StyledModal } from "@/components/ui/StyledModal";

export default function DeleteObservationModal({
  open,
  onClose,
  onConfirm,
  observationId,
  contentPreview,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  observationId: string;
  contentPreview?: string;
}) {
  return (
    <StyledModal
      open={open}
      onOpenChange={onClose}
      title="Delete Observation"
      variant="danger"
    >
      <p className="text-sm text-red-200 mb-3">
        Are you sure you want to permanently delete this observation?
      </p>
      {contentPreview && (
        <div className="bg-[#1a1a1a] border border-slate-700 p-2 text-xs text-slate-300 rounded mb-4 italic">
          {contentPreview}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm border border-slate-500 rounded text-slate-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(observationId)}
          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-500"
        >
          Confirm Delete
        </button>
      </div>
    </StyledModal>
  );
} 