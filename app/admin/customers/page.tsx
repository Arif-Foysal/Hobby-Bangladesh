import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { IconEye, IconPlus } from "@tabler/icons-react";

export const metadata = { title: "Customers | Admin | Hobby Bangladesh" };

async function getAdminCustomers({
  search,
  role,
  page = 1,
  perPage = 20,
}: {
  search?: string;
  role?: string;
  page?: number;
  perPage?: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    customers: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

async function getCustomerOrderCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("user_id");

  const counts: Record<string, number> = {};
  data?.forEach((order) => {
    counts[order.user_id] = (counts[order.user_id] || 0) + 1;
  });
  return counts;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const role = typeof params.role === "string" ? params.role : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const perPage = typeof params.perPage === "string" ? parseInt(params.perPage) : 20;

  const [{ customers, total, totalPages }, orderCounts] = await Promise.all([
    getAdminCustomers({ search, role, page, perPage }),
    getCustomerOrderCounts(),
  ]);

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            {total} registered user{total !== 1 ? "s" : ""}.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/customers/new">
            <IconPlus className="mr-1 size-4" /> Create User
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search by name or phone..."
          filters={[
            {
              key: "role",
              label: "Role",
              options: [
                { label: "Customer", value: "customer" },
                { label: "Admin", value: "admin" },
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
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search ? "No customers match your search." : "No customers yet."}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
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
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
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
