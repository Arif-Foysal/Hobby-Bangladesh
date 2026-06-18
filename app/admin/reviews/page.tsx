import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
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
import { ReviewActions } from "./review-actions";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { IconStar, IconStarFilled } from "@tabler/icons-react";

export const metadata = { title: "Reviews | Admin | Hobby Bangladesh" };

async function getAdminReviews({
  search,
  status,
  rating,
  sort = "newest",
  page = 1,
  perPage = 20,
}: {
  search?: string;
  status?: string;
  rating?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("reviews")
    .select("*, profiles(name), products(name, slug)", { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,products.name.ilike.%${search}%`);
  }

  if (status === "approved") {
    query = query.eq("is_approved", true);
  } else if (status === "pending") {
    query = query.eq("is_approved", false);
  }

  if (rating && rating !== "all") {
    query = query.eq("rating", parseInt(rating));
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "rating_high":
      query = query.order("rating", { ascending: false });
      break;
    case "rating_low":
      query = query.order("rating", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    reviews: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
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

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const rating = typeof params.rating === "string" ? params.rating : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const perPage = typeof params.perPage === "string" ? parseInt(params.perPage) : 20;

  const { reviews, total, totalPages } = await getAdminReviews({
    search,
    status,
    rating,
    sort,
    page,
    perPage,
  });

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
        <p className="text-muted-foreground">
          {total} review{total !== 1 ? "s" : ""} total.
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search reviews..."
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Approved", value: "approved" },
                { label: "Pending", value: "pending" },
              ],
            },
            {
              key: "rating",
              label: "Rating",
              options: [
                { label: "5 Stars", value: "5" },
                { label: "4 Stars", value: "4" },
                { label: "3 Stars", value: "3" },
                { label: "2 Stars", value: "2" },
                { label: "1 Star", value: "1" },
              ],
            },
            {
              key: "sort",
              label: "Sort",
              options: [
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Highest Rating", value: "rating_high" },
                { label: "Lowest Rating", value: "rating_low" },
              ],
            },
          ]}
        />
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
                    {search ? "No reviews match your search." : "No reviews yet."}
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

      {totalPages > 1 && (
        <div className="px-4 lg:px-6">
          <DataTablePagination totalPages={totalPages} totalItems={total} />
        </div>
      )}
    </>
  );
}
