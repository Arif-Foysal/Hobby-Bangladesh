import { createClient } from "@/lib/supabase/server";
import { ReviewsList } from "./reviews-list";
import { ReviewForm } from "./review-form";

export async function ProductReviews({
  productId,
}: {
  productId: string;
}) {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(name)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
          {reviews && reviews.length > 0 && (
            <p className="text-muted-foreground">
              {avgRating.toFixed(1)} out of 5 ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </p>
          )}
        </div>
      </div>

      {isLoggedIn && <ReviewForm productId={productId} />}

      <ReviewsList reviews={reviews || []} />
    </section>
  );
}
