import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewActions } from "./actions";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

export const metadata = { title: "Reviews | Admin | Hobby Bangladesh" };

async function getReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profiles(name), products(name, slug)")
    .order("created_at", { ascending: false });
  return data || [];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <IconStarFilled key={i} className="size-4 text-yellow-400" />
        ) : (
          <IconStar key={i} className="size-4 text-muted-foreground" />
        )
      )}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
        <p className="text-muted-foreground">Moderate customer reviews.</p>
      </div>

      <Card className="mx-4 lg:mx-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No reviews yet.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.products?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {review.profiles?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {review.title || review.content || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.is_approved ? "default" : "secondary"}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-BD")}
                    </TableCell>
                    <TableCell>
                      <ReviewActions id={review.id} isApproved={review.is_approved} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
