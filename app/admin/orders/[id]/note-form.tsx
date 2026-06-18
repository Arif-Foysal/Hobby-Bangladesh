"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addOrderNote } from "../actions";

export function OrderNoteForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setLoading(true);
    const result = await addOrderNote(orderId, note.trim());
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Note added");
      setNote("");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Add an internal note about this order..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={loading || !note.trim()}
        >
          {loading ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </div>
  );
}
