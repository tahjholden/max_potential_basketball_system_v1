import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type ModalVariant = "default" | "danger";

const variantClasses: Record<ModalVariant, string> = {
  default: "bg-[#232323] text-white border border-[#C2B56B]",
  danger: "bg-[#1c0e0e] text-red-100 border border-red-600",
};

const titleVariantClasses: Record<ModalVariant, string> = {
  default: "text-[#C2B56B] text-lg font-bold",
  danger:
    "text-red-400 text-lg font-bold uppercase tracking-wide flex items-center gap-2",
};

export function StyledModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  variant = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: ModalVariant;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`rounded-lg shadow-lg p-6 w-full max-w-md ${variantClasses[variant]} !bg-opacity-100 !backdrop-blur-none`}
      >
        <DialogHeader>
          <DialogTitle className={titleVariantClasses[variant]}>
            {variant === "danger" ? (
              <>
                <span>🗑</span> {title}
              </>
            ) : (
              title
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">{children}</div>

        {footer && <DialogFooter className="mt-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
} 