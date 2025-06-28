import { ReactNode } from "react";
import { GoldModal, ConfirmationModal, FormModal } from "./gold-modal";

// Re-export the base components
export { GoldModal, ConfirmationModal, FormModal };

// Main StandardModal component that provides a unified API
interface StandardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: "default" | "danger" | "success" | "warning" | "archive" | "gray";
  size?: "sm" | "md" | "lg" | "xl";
  type?: "basic" | "confirmation" | "form";
  // Confirmation specific props
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  // Form specific props
  onSubmit?: () => void;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function StandardModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "default",
  size = "md",
  type = "basic",
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  onSubmit,
  submitText,
  loading = false,
  disabled = false,
}: StandardModalProps) {
  // Confirmation modal
  if (type === "confirmation" && onConfirm) {
    return (
      <ConfirmationModal
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || ""}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
        loading={loading}
      />
    );
  }

  // Form modal
  if (type === "form" && onSubmit) {
    return (
      <FormModal
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText={submitText}
        cancelText={cancelText}
        loading={loading}
        disabled={disabled}
        variant={variant}
      >
        {children}
      </FormModal>
    );
  }

  // Basic modal
  return (
    <GoldModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      size={size}
    >
      {children}
    </GoldModal>
  );
}

// Convenience hooks for common modal patterns
export function useConfirmationModal() {
  return {
    ConfirmationModal,
    createDeleteConfirmation: (
      open: boolean,
      onOpenChange: (open: boolean) => void,
      onConfirm: () => void,
      itemName: string = "this item"
    ) => (
      <ConfirmationModal
        open={open}
        onOpenChange={onOpenChange}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
        onConfirm={onConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    ),
    createArchiveConfirmation: (
      open: boolean,
      onOpenChange: (open: boolean) => void,
      onConfirm: () => void,
      itemName: string = "this item"
    ) => (
      <ConfirmationModal
        open={open}
        onOpenChange={onOpenChange}
        title="Confirm Archive"
        description={`Are you sure you want to archive ${itemName}? You can restore it later from the archive.`}
        onConfirm={onConfirm}
        confirmText="Archive"
        cancelText="Cancel"
        variant="archive"
      />
    ),
    createAddConfirmation: (
      open: boolean,
      onOpenChange: (open: boolean) => void,
      onConfirm: () => void,
      itemName: string = "this item"
    ) => (
      <ConfirmationModal
        open={open}
        onOpenChange={onOpenChange}
        title="Confirm Addition"
        description={`Are you sure you want to add ${itemName}?`}
        onConfirm={onConfirm}
        confirmText="Add"
        cancelText="Cancel"
        variant="default"
      />
    ),
  };
}

export function useFormModal() {
  return {
    FormModal,
    createAddModal: (
      open: boolean,
      onOpenChange: (open: boolean) => void,
      onSubmit: () => void,
      title: string,
      children: ReactNode,
      loading = false,
      disabled = false
    ) => (
      <FormModal
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        onSubmit={onSubmit}
        submitText="Add"
        cancelText="Cancel"
        loading={loading}
        disabled={disabled}
        variant="default"
      >
        {children}
      </FormModal>
    ),
    createEditModal: (
      open: boolean,
      onOpenChange: (open: boolean) => void,
      onSubmit: () => void,
      title: string,
      children: ReactNode,
      loading = false,
      disabled = false
    ) => (
      <FormModal
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        onSubmit={onSubmit}
        submitText="Save Changes"
        cancelText="Cancel"
        loading={loading}
        disabled={disabled}
        variant="default"
      >
        {children}
      </FormModal>
    ),
    createDeleteModal: (
      open: boolean,
      onOpenChange: (open: boolean) => void,
      onSubmit: () => void,
      title: string,
      children: ReactNode,
      loading = false,
      disabled = false
    ) => (
      <FormModal
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        onSubmit={onSubmit}
        submitText="Delete"
        cancelText="Cancel"
        loading={loading}
        disabled={disabled}
        variant="danger"
      >
        {children}
      </FormModal>
    ),
  };
} 