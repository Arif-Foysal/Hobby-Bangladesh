import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusUpdateForm } from "./status-form";
import { PaymentStatusForm } from "./payment-form";
import { OrderNoteForm } from "./note-form";
import { IconPrinter } from "@tabler/icons-react";
import type { ShippingAddress } from "@/lib/database/types";

export const metadata = { title: "Order Detail | Admin | Hobby Bangladesh" };

const allStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const addr = (order.shipping_address ?? {}) as Partial<ShippingAddress>;
  const isGuest = !order.user_id;
  const customerName = order.profiles?.name ?? addr.name ?? "—";
  const customerPhone = order.profiles?.phone ?? addr.phone ?? null;
  const customerEmail = order.customerEmail ?? addr.email ?? null;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order {order.order_number}</h2>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString("en-BD")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isGuest && <Badge variant="secondary">Guest order</Badge>}
          <Badge>{order.status}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={`/invoice/${order.id}`} target="_blank" rel="noopener">
              <IconPrinter className="size-4" />
              Print Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Customer{isGuest && " (guest)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{customerName}</p>
            {customerPhone && <p>{customerPhone}</p>}
            {customerEmail && <p>{customerEmail}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {addr.name && <p className="font-medium text-foreground">{addr.name}</p>}
            {addr.address && <p>{addr.address}</p>}
            {(addr.area || addr.city || addr.division) && (
              <p>
                {[addr.area, addr.city, addr.division].filter(Boolean).join(", ")}
              </p>
            )}
            {addr.phone && <p>{addr.phone}</p>}
            {addr.email && <p>{addr.email}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              <span className="text-muted-foreground">Method: </span>
              {order.payment_method === "sslcommerz" ? "Online" : "COD"}
            </p>
            <p>
              <span className="text-muted-foreground">Status: </span>
              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                {order.payment_status}
              </Badge>
            </p>
            {order.transaction_id && (
              <p>
                <span className="text-muted-foreground">Txn ID: </span>
                {order.transaction_id}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item: { id: string; product_name: string; quantity: number; unit_price: number; total: number }) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>৳ {item.unit_price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    ৳ {item.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <div className="flex flex-col gap-1 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>৳ {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cost === 0 ? "Free" : `৳ ${order.shipping_cost}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-2">
                  Discount
                  {order.coupon_code && (
                    <Badge variant="secondary" className="font-mono">
                      {order.coupon_code}
                    </Badge>
                  )}
                </span>
                <span>− ৳ {order.discount.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>৳ {order.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusUpdateForm orderId={order.id} currentStatus={order.status} statuses={allStatuses} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentStatusForm orderId={order.id} currentStatus={order.payment_status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderNoteForm orderId={order.id} />
          </CardContent>
        </Card>
      </div>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Order Notes History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {order.notes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
