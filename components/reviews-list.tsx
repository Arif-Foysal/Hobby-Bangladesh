"use client";

import { IconStarFilled } from "@tabler/icons-react";

export function ReviewsList({
  reviews,
}: {
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    created_at: string;
    profiles: { name: string | null } | null;
  }[];
}) {
  if (reviews.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <IconStarFilled
                  key={star}
                  className={`size-4 ${
                    star <= review.rating
                      ? "text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            {review.title && (
              <span className="text-sm font-medium">{review.title}</span>
            )}
          </div>
          {review.content && (
            <p className="mt-2 text-sm text-muted-foreground">
              {review.content}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {review.profiles?.name ?? "Anonymous"} &middot;{" "}
            {new Date(review.created_at).toLocaleDateString("en-BD")}
          </p>
        </div>
      ))}
    </div>
  );
}
