import * as React from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <HeadlessDialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={onOpenChange}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
          leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
        >
          <HeadlessDialog.Panel className="relative z-10">{children}</HeadlessDialog.Panel>
        </Transition.Child>
      </HeadlessDialog>
    </Transition>
  );
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-[#232733] rounded-xl p-8 w-full max-w-md shadow-xl border border-yellow-400", className)}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("text-xl font-bold text-yellow-400", className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
} 