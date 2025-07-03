import React, { ReactNode } from "react";
import { GoldModal, ConfirmationModal, FormModal } from "./gold-modal";
import { colors } from "@/lib/design-tokens";

// Modal variant types
type ModalVariant = "default" | "danger" | "success" | "warning" | "archive" | "gray";

// Modal size types
type ModalSize = "sm" | "md" | "lg" | "xl";

// Modal type types
type ModalType = "basic" | "confirmation" | "form";

// Base modal props
interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
  className?: string;
}

// Confirmation modal props
interface ConfirmationModalProps extends BaseModalProps {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

// Form modal props
interface FormModalProps extends BaseModalProps {
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
}

// Unified modal component
export const UniversalModal = {
  // Basic modal for content display
  Basic: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    variant = "default",
    size = "md",
    className = "",
  }: BaseModalProps) => {
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
  },

  // Confirmation modal for user confirmations
  Confirm: ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    loading = false,
  }: ConfirmationModalProps) => {
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
  },

  // Form modal for data entry
  Form: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitText = "Submit",
    cancelText = "Cancel",
    variant = "default",
    loading = false,
    disabled = false,
  }: FormModalProps) => {
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
  },

  // Unified API for all modal types
  Dialog: ({
    type = "basic",
    variant = "default",
    ...props
  }: BaseModalProps & {
    type?: ModalType;
  } & Partial<ConfirmationModalProps> &
    Partial<FormModalProps>) => {
    switch (type) {
      case "confirmation":
        return (
          <UniversalModal.Confirm
            variant={variant}
            {...(props as ConfirmationModalProps)}
          />
        );
      case "form":
        return (
          <UniversalModal.Form
            variant={variant}
            {...(props as FormModalProps)}
          />
        );
      default:
        return (
          <UniversalModal.Basic
            variant={variant}
            {...(props as BaseModalProps)}
          />
        );
    }
  },
};

// Convenience components for common use cases
export const Modal = {
  // Delete confirmation modal
  Delete: ({
    open,
    onOpenChange,
    title = "Confirm Deletion",
    description,
    onConfirm,
    onCancel,
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
  }: Omit<ConfirmationModalProps, 'variant'>) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "Are you sure you want to delete this item? This action cannot be undone."}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="danger"
        loading={loading}
      />
    );
  },

  // Archive confirmation modal
  Archive: ({
    open,
    onOpenChange,
    title = "Archive Item",
    description,
    onConfirm,
    onCancel,
    confirmText = "Archive",
    cancelText = "Cancel",
    loading = false,
    children,
  }: Omit<ConfirmationModalProps, 'variant'> & { children?: React.ReactNode }) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "Are you sure you want to archive this item? This action cannot be undone."}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="archive"
        loading={loading}
      >
        {children}
      </UniversalModal.Confirm>
    );
  },

  // Success confirmation modal
  Success: ({
    open,
    onOpenChange,
    title = "Success",
    description,
    onConfirm,
    onCancel,
    confirmText = "Continue",
    cancelText = "Close",
    loading = false,
  }: Omit<ConfirmationModalProps, 'variant'>) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "The operation completed successfully."}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="success"
        loading={loading}
      />
    );
  },

  // Warning confirmation modal
  Warning: ({
    open,
    onOpenChange,
    title = "Warning",
    description,
    onConfirm,
    onCancel,
    confirmText = "Proceed",
    cancelText = "Cancel",
    loading = false,
  }: Omit<ConfirmationModalProps, 'variant'>) => {
    return (
      <UniversalModal.Confirm
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description || "This action may have unintended consequences. Are you sure you want to proceed?"}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="warning"
        loading={loading}
      />
    );
  },

  // Add form modal
  Add: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitText = "Add",
    cancelText = "Cancel",
    loading = false,
    disabled = false,
  }: Omit<FormModalProps, 'variant'>) => {
    return (
      <UniversalModal.Form
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText={submitText}
        cancelText={cancelText}
        variant="default"
        loading={loading}
        disabled={disabled}
      >
        {children}
      </UniversalModal.Form>
    );
  },

  // Edit form modal
  Edit: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitText = "Save Changes",
    cancelText = "Cancel",
    loading = false,
    disabled = false,
  }: Omit<FormModalProps, 'variant'>) => {
    return (
      <UniversalModal.Form
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText={submitText}
        cancelText={cancelText}
        variant="default"
        loading={loading}
        disabled={disabled}
      >
        {children}
      </UniversalModal.Form>
    );
  },

  // Info modal
  Info: ({
    open,
    onOpenChange,
    title,
    description,
    children,
    variant = "default",
    size = "md",
  }: BaseModalProps) => {
    return (
      <UniversalModal.Basic
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        variant={variant}
        size={size}
      >
        {children}
      </UniversalModal.Basic>
    );
  },
};

// Export the main components
export default UniversalModal; 