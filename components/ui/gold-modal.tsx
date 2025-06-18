import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function GoldModal({ open, onOpenChange, title, children, footer }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#232733] border border-[#CFB53B] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#CFB53B]">{title}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
} 