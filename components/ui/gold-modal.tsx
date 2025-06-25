import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type ModalVariant = "default" | "danger" | "success" | "warning" | "archive" | "gray";

interface GoldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: ModalVariant;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const variantClasses: Record<ModalVariant, string> = {
  default: "border-gold",
  danger: "border-red-500",
  success: "border-green-500", 
  warning: "border-yellow-500",
  archive: "border-zinc-500",
  gray: "border-zinc-400",
};

const titleVariantClasses: Record<ModalVariant, string> = {
  default: "text-gold",
  danger: "text-red-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  archive: "text-zinc-300",
  gray: "text-zinc-400",
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function GoldModal({ 
  open, 
  onOpenChange, 
  title, 
  description,
  children, 
  footer, 
  variant = "default",
  size = "md",
  showCloseButton = true
}: GoldModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`bg-[#232733] border ${variantClasses[variant]} rounded-xl shadow-2xl ${sizeClasses[size]} !bg-opacity-100 !backdrop-blur-none`}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className={`text-xl font-bold ${titleVariantClasses[variant]}`}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-300 text-sm leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {children}
        </div>
        
        {footer && (
          <DialogFooter className="pt-4 border-t border-gray-700">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Convenience components for common modal patterns
export function ConfirmationModal({
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  loading?: boolean;
}) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Button styling based on variant
  const getConfirmButtonStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "success":
        return "bg-green-600 text-white hover:bg-green-700";
      case "warning":
        return "bg-yellow-600 text-black hover:bg-yellow-700";
      case "archive":
        return "bg-zinc-600 text-white hover:bg-zinc-700";
      case "gray":
        return "bg-zinc-500 text-white hover:bg-zinc-600";
      default:
        return "bg-gold text-black hover:bg-gold/80";
    }
  };

  return (
    <GoldModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      size="sm"
      footer={
        <div className="flex gap-3 w-full">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-700/50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${getConfirmButtonStyle()}`}
          >
            {loading ? "Loading..." : confirmText}
          </button>
        </div>
      }
    >
      <div />
    </GoldModal>
  );
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  variant = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: ModalVariant;
}) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  // Button styling based on variant
  const getSubmitButtonStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "success":
        return "bg-green-600 text-white hover:bg-green-700";
      case "warning":
        return "bg-yellow-600 text-black hover:bg-yellow-700";
      case "archive":
        return "bg-zinc-600 text-white hover:bg-zinc-700";
      case "gray":
        return "bg-zinc-500 text-white hover:bg-zinc-600";
      default:
        return "bg-gold text-black hover:bg-gold/80";
    }
  };

  return (
    <GoldModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      size="md"
      footer={
        <div className="flex gap-3 w-full">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-700/50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || disabled}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${getSubmitButtonStyle()}`}
          >
            {loading ? "Loading..." : submitText}
          </button>
        </div>
      }
    >
      {children}
    </GoldModal>
  );
} 