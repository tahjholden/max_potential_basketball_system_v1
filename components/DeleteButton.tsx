"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
          <button className={triggerClassName || "border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"}>
            {label}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 text-white border border-zinc-700">
        <DialogHeader>
          <DialogTitle>Delete {entity}?</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-zinc-400 my-4 space-y-4">
          <p>{description || "This action is permanent and cannot be undone."}</p>
          {confirmText && (
            <div>
              <p className="mb-2">
                To confirm, please type <strong className="text-red-400">{confirmText}</strong> below:
              </p>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-zinc-800 border-zinc-600"
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