"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function DeleteButton({
  onConfirm,
  entity = "Item",
  description,
  iconOnly = true,
  label = "Delete",
  confirmText,
  triggerClassName,
}: {
  onConfirm: () => void;
  entity?: string;
  description?: string;
  iconOnly?: boolean;
  label?: string;
  confirmText?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const isConfirmed = !confirmText || inputValue === confirmText;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button className={triggerClassName || "text-red-500 hover:text-red-600"}>
            <Trash2 size={16} />
          </button>
        ) : (
          <button className={triggerClassName || "border border-[#C2B56B] text-sm px-4 py-2 rounded font-semibold text-[#C2B56B] hover:bg-[#C2B56B]/10 transition"}>
            {label}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 text-white border-2 border-red-600" aria-describedby="delete-dialog-desc">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete {entity}?</DialogTitle>
        </DialogHeader>
        <DialogDescription id="delete-dialog-desc">
          {description || "This action is permanent and cannot be undone."}
        </DialogDescription>
        <div className="text-sm text-zinc-400 my-4 space-y-4">
          {confirmText && (
            <div>
              <p className="mb-2">
                To confirm, please type <strong className="text-red-400">{confirmText}</strong> below:
              </p>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-zinc-800 border-red-600 focus:border-red-600 focus:ring-red-600"
                autoFocus
              />
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700 border-red-600"
            onClick={() => {
              if (isConfirmed) {
                onConfirm();
                setOpen(false);
              }
            }}
            disabled={!isConfirmed}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 