import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
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
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import {
  formatAuditDetails,
  formatAuditAction,
  getActionColor,
} from "@/lib/audit-format";

export const metadata = { title: "Audit Log | Admin | Hobby Bangladesh" };

async function getAuditLog({
  search,
  action,
  resourceType,
  userId,
  dateFrom,
  dateTo,
  page = 1,
  perPage = 50,
}: {
  search?: string;
  action?: string;
  resourceType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("audit_log")
    .select("*, profiles(name)", { count: "exact" });

  if (action && action !== "all") {
    query = query.eq("action", action);
  }

  if (search) {
    query = query.or(`resource_id.ilike.%${search}%,action.ilike.%${search}%,resource_type.ilike.%${search}%`);
  }

  if (resourceType && resourceType !== "all") {
    query = query.eq("resource_type", resourceType);
  }

  if (userId && userId !== "all") {
    query = query.eq("user_id", userId);
  }

  if (dateFrom) {
    query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
  }

  if (dateTo) {
    query = query.lte("created_at", `${dateTo}T23:59:59Z`);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    logs: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

async function getAdminUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "admin")
    .order("name", { ascending: true });
  return data || [];
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const action = typeof params.action === "string" ? params.action : undefined;
  const resourceType =
    typeof params.resourceType === "string" ? params.resourceType : undefined;
  const userId = typeof params.userId === "string" ? params.userId : undefined;
  const dateFrom =
    typeof params.dateFrom === "string" ? params.dateFrom : undefined;
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [{ logs, total, totalPages }, adminUsers] = await Promise.all([
    getAuditLog({
      search,
      action,
      resourceType,
      userId,
      dateFrom,
      dateTo,
      page,
    }),
    getAdminUsers(),
  ]);

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <p className="text-muted-foreground">
          {total} event{total !== 1 ? "s" : ""} recorded.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <DataTableToolbar
          searchPlaceholder="Search..."
          filters={[
            {
              key: "action",
              label: "Action",
              options: [
                { label: "Created", value: "create" },
                { label: "Updated", value: "update" },
                { label: "Deleted", value: "delete" },
                { label: "Status Change", value: "update_status" },
                { label: "Payment Update", value: "update_payment" },
                { label: "Role Change", value: "update_role" },
                { label: "Toggled", value: "toggle" },
                { label: "Reordered", value: "reorder" },
                { label: "Login", value: "login" },
                { label: "Logout", value: "logout" },
                { label: "Denied Access", value: "denied_access" },
              ],
            },
            {
              key: "resourceType",
              label: "Resource",
              options: [
                { label: "Product", value: "product" },
                { label: "Category", value: "category" },
                { label: "Order", value: "order" },
                { label: "Coupon", value: "coupon" },
                { label: "Review", value: "review" },
                { label: "Settings", value: "settings" },
                { label: "User", value: "user" },
                { label: "Auth", value: "auth" },
              ],
            },
            {
              key: "userId",
              label: "Admin",
              options: adminUsers.map((u) => ({
                label: u.name ?? "Unknown",
                value: u.id,
              })),
            },
          ]}
        />
        <DateRangeFilter />
      </div>

      <Card className="mx-4 lg:mx-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No audit events found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const entry = log as {
                    id: string;
                    created_at: string;
                    action: string;
                    resource_type: string;
                    resource_id: string | null;
                    details: Record<string, unknown> | null;
                    ip_address: string | null;
                    profiles?: { name: string } | null;
                  };
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(entry.created_at).toLocaleString("en-BD")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.profiles?.name ?? "System"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(entry.action)}>
                          {formatAuditAction(entry.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{entry.resource_type}</span>
                        {entry.resource_id && (
                          <span className="ml-1 font-mono text-xs text-muted-foreground">
                            ({entry.resource_id.slice(0, 8)}...)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                        {formatAuditDetails(entry)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.ip_address ?? "—"}
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