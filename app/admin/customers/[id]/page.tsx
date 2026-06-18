import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerDetail } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleManager } from "./role-manager";
import { IconArrowLeft, IconStarFilled } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Customer Detail | Admin | Hobby Bangladesh" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerDetail(id);
  if (!data) notFound();

  const { profile, orders, addresses, reviews } = data;

  const totalSpent = orders.reduce(
    (sum: number, o: { total: number }) => sum + o.total,
    0
  );

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <IconArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{profile.name ?? "Unnamed User"}</h2>
          <p className="text-sm text-muted-foreground">
            Joined {new Date(profile.created_at).toLocaleDateString("en-BD")}
          </p>
        </div>
        <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
          {profile.role}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{profile.phone ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">৳ {totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{reviews.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Role Management</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleManager userId={profile.id} currentRole={profile.role} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses saved.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map(
                  (addr: {
                    id: string;
                    name: string;
                    phone: string;
                    division: string;
                    city: string;
                    area: string;
                    address: string;
                    is_default: boolean;
                  }) => (
                    <div key={addr.id} className="rounded-lg border p-3 text-sm">
                      {addr.is_default && (
                        <Badge className="mb-2" variant="secondary">Default</Badge>
                      )}
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-muted-foreground">{addr.address}</p>
                      <p className="text-muted-foreground">
                        {addr.area}, {addr.city}, {addr.division}
                      </p>
                      <p className="text-muted-foreground">{addr.phone}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(
                  (order: {
                    id: string;
                    order_number: string;
                    created_at: string;
                    status: string;
                    payment_status: string;
                    total: number;
                  }) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-BD")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ৳ {order.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No reviews yet.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map(
                  (review: {
                    id: string;
                    products?: { name: string; slug: string };
                    rating: number;
                    title: string | null;
                    content: string | null;
                    is_approved: boolean;
                    created_at: string;
                  }) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.products?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconStarFilled className="size-3 text-yellow-400" />
                          {review.rating}
                        </div>
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
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
