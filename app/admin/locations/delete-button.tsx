"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLocation } from "./actions";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteLocationButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteLocation(id);
    setOpen(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Location deleted");
      router.refresh();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconTrash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete location</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{name}&quot;? Any cities or
            areas under it will also be deleted. Existing orders keep their
            stored address and charge.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}