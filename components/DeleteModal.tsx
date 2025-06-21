"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DeleteModal({
  trigger,
  entityName,
  description,
  onDelete,
}: {
  trigger: React.ReactNode;
  entityName: string;
  description?: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-zinc-900 text-white border border-zinc-700">
        <DialogHeader>
          <DialogTitle>Delete {entityName}?</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {description || `This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 