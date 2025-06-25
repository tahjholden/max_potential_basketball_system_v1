"use client";

import { ConfirmationModal } from "@/components/ui/StandardModal";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export default function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm Deletion",
  description,
  itemName = "this item",
  loading = false,
}: DeleteModalProps) {
  const defaultDescription = `Are you sure you want to delete ${itemName}? This action cannot be undone.`;

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description || defaultDescription}
      onConfirm={onConfirm}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      loading={loading}
    />
  );
} 