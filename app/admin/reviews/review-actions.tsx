"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";
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
import { toggleReviewApproval, deleteReview } from "./actions";
import { toast } from "sonner";

export function ReviewActions({
  id,
  isApproved,
}: {
  id: string;
  isApproved: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleReviewApproval(id, isApproved);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isApproved ? "Review rejected" : "Review approved");
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteReview(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Review deleted");
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={loading}
        title={isApproved ? "Reject" : "Approve"}
      >
        {isApproved ? <IconX /> : <IconCheck />}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <IconTrash />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
