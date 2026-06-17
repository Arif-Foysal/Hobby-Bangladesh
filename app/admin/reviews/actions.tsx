"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";

export function ReviewActions({
  id,
  isApproved,
}: {
  id: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleApproval = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("reviews")
      .update({ is_approved: !isApproved })
      .eq("id", id);
    setLoading(false);
    router.refresh();
  };

  const deleteReview = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("reviews").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleApproval}
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
            <AlertDialogAction onClick={deleteReview}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
