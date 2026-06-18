import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminCoupons } from "./actions";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { DeleteCouponButton } from "./delete-button";
import { ToggleCouponActiveButton } from "./toggle-button";
import { IconPlus, IconPencil } from "@tabler/icons-react";

export const metadata = { title: "Coupons | Admin | Hobby Bangladesh" };

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const perPage = typeof params.perPage === "string" ? parseInt(params.perPage) : 20;

  const { coupons, total, totalPages } = await getAdminCoupons({
    search,
    status,
    sort,
    page,
    perPage,
  });

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">
            {total} coupon{total !== 1 ? "s" : ""} total.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <IconPlus className="mr-2 size-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search by code or description..."
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ],
            },
            {
              key: "sort",
              label: "Sort",
              options: [
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Code: A → Z", value: "code_asc" },
                { label: "Code: Z → A", value: "code_desc" },
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
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {search ? "No coupons match your search." : "No coupons yet."}
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">
                        {coupon.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `৳ ${coupon.discount_value.toLocaleString()}`}
                        {coupon.max_discount_amount && (
                          <span className="text-xs text-muted-foreground">
                            {" "}(max ৳{coupon.max_discount_amount.toLocaleString()})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.min_order_amount > 0
                          ? `৳ ${coupon.min_order_amount.toLocaleString()}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {coupon.used_count}
                        {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                      </TableCell>
                      <TableCell>
                        <ToggleCouponActiveButton
                          id={coupon.id}
                          isActive={coupon.is_active}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : coupon.expires_at ? (
                          new Date(coupon.expires_at).toLocaleDateString("en-BD")
                        ) : (
                          "Never"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/coupons/${coupon.id}/edit`}>
                              <IconPencil className="size-4" />
                            </Link>
                          </Button>
                          <DeleteCouponButton id={coupon.id} code={coupon.code} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
