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

export const metadata = { title: "Audit Log | Admin | Hobby Bangladesh" };

async function getAuditLog({
  action,
  resourceType,
  page = 1,
  perPage = 50,
}: {
  action?: string;
  resourceType?: string;
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

  if (resourceType && resourceType !== "all") {
    query = query.eq("resource_type", resourceType);
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

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  update_status: "Status Change",
  update_payment: "Payment Update",
};

const actionColors: Record<string, "default" | "secondary" | "destructive"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  update_status: "secondary",
  update_payment: "default",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const action = typeof params.action === "string" ? params.action : undefined;
  const resourceType = typeof params.resourceType === "string" ? params.resourceType : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const { logs, total, totalPages } = await getAuditLog({
    action,
    resourceType,
    page,
  });

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <p className="text-muted-foreground">
          {total} event{total !== 1 ? "s" : ""} recorded.
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <DataTableToolbar
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
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No audit events found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(log.created_at).toLocaleString("en-BD")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {(log as { profiles?: { name: string } }).profiles?.name ?? "System"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionColors[log.action] ?? "secondary"}>
                        {actionLabels[log.action] ?? log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{log.resource_type}</span>
                      {log.resource_id && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          ({log.resource_id.slice(0, 8)}...)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                      {log.details ? JSON.stringify(log.details) : "—"}
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
