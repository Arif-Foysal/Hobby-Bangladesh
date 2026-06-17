import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconUsers } from "@tabler/icons-react";

export const metadata = { title: "Customers | Admin | Hobby Bangladesh" };

async function getCustomers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getCustomerOrderCounts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("user_id");
  
  const counts: Record<string, number> = {};
  data?.forEach((order) => {
    counts[order.user_id] = (counts[order.user_id] || 0) + 1;
  });
  return counts;
}

export default async function CustomersPage() {
  const [customers, orderCounts] = await Promise.all([
    getCustomers(),
    getCustomerOrderCounts(),
  ]);

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <IconUsers className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">No customers yet</h2>
        <p className="text-muted-foreground">
          Customers will appear here after they sign up.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <p className="text-muted-foreground">
          {customers.length} registered user(s).
        </p>
      </div>

      <Card className="mx-4 lg:mx-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.role === "admin" ? "default" : "secondary"}>
                      {customer.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{orderCounts[customer.id] ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(customer.created_at).toLocaleDateString("en-BD")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
