"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getClaims();

    if (!authData?.claims) {
      toast.error("Please log in to leave a review");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: authData.claims.sub,
      product_id: productId,
      rating,
      title: formData.get("title") as string || null,
      content: formData.get("content") as string || null,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already reviewed this product");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Review submitted for approval");
    setSubmitted(true);
    router.refresh();
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">
        Thank you! Your review has been submitted and will appear after approval.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg border bg-card p-5">
      <h3 className="text-sm font-medium">Write a Review</h3>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="cursor-pointer"
          >
            {star <= (hoverRating || rating) ? (
              <IconStarFilled className="size-6 text-yellow-400" />
            ) : (
              <IconStar className="size-6 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Input name="title" placeholder="Review title (optional)" />
        <Textarea name="content" placeholder="Write your review..." rows={3} />
      </div>
      <Button type="submit" className="mt-3" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
