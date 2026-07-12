import Link from "next/link";
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
import { getAdminOrders } from "./actions";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { OrderQuickActions } from "./order-quick-actions";
import { IconEye } from "@tabler/icons-react";

export const metadata = { title: "Orders | Admin | Hobby Bangladesh" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const paymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const perPage = typeof params.perPage === "string" ? parseInt(params.perPage) : 20;

  const { orders, total, totalPages } = await getAdminOrders({
    search,
    status,
    paymentStatus,
    sort,
    page,
    perPage,
  });

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          {total} order{total !== 1 ? "s" : ""} total.
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search by order # or customer..."
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { label: "Pending", value: "pending" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Processing", value: "processing" },
                { label: "Shipped", value: "shipped" },
                { label: "Delivered", value: "delivered" },
                { label: "Cancelled", value: "cancelled" },
              ],
            },
            {
              key: "paymentStatus",
              label: "Payment",
              options: [
                { label: "Unpaid", value: "unpaid" },
                { label: "Paid", value: "paid" },
                { label: "Refunded", value: "refunded" },
                { label: "Failed", value: "failed" },
              ],
            },
            {
              key: "sort",
              label: "Sort",
              options: [
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Total: High → Low", value: "total_desc" },
                { label: "Total: Low → High", value: "total_asc" },
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
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status / Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search ? "No orders match your search." : "No orders yet."}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      {order.profiles?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-BD")}
                    </TableCell>
                    <TableCell>
                      <OrderQuickActions
                        orderId={order.id}
                        currentStatus={order.status}
                        currentPaymentStatus={order.payment_status}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      ৳ {order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <IconEye className="size-4" />
                        </Link>
                      </Button>
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
